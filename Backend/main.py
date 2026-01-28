from datetime import datetime, date
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy import Boolean, Column, Date, DateTime, Float, Integer, String, Text, create_engine, func
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker

"""
Backend for Hyacinth Watch

Goals:
- Solid persistence for reports and volunteers
- Clean, versionable API surface tailored to the current frontend
- Easy to run locally (SQLite) but ready to swap to Postgres
"""

# ---------------------------------------------------------------------------
# Database setup
# ---------------------------------------------------------------------------

SQLALCHEMY_DATABASE_URL = "sqlite:///./hyacinth_watch.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},  # needed for SQLite + threads
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Report(Base):
    """
    Single observation of water hyacinth.
    Matches the frontend's concept of a report:
    - lat / lng
    - title (human-readable place name)
    - date (date observed)
    - severity
    - cleaned flag
    """

    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    title = Column(String(255), nullable=True)
    date = Column(Date, nullable=False)
    severity = Column(String(16), nullable=False)  # low, medium, high, critical
    cleaned = Column(Boolean, nullable=False, default=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)


class Volunteer(Base):
    """
    Minimal volunteer record.
    The current UI only collects an email, but we keep space for
    future metadata (created_at, last_notified_at, etc.).
    """

    __tablename__ = "volunteers"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


Base.metadata.create_all(bind=engine)


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------------------------
# API models
# ---------------------------------------------------------------------------


class ReportIn(BaseModel):
    lat: float
    lng: float
    title: Optional[str] = None
    date: date
    severity: str
    cleaned: bool = False
    description: Optional[str] = None


class ReportOut(BaseModel):
    id: int
    lat: float
    lng: float
    title: Optional[str]
    date: date
    severity: str
    cleaned: bool

    class Config:
        orm_mode = True


class StatsOut(BaseModel):
    total_reports: int
    high_critical: int
    cleaned: int
    active_areas: int
    growth_rate: float


class VolunteerIn(BaseModel):
    email: EmailStr


class VolunteerOut(BaseModel):
    id: int
    email: EmailStr

    class Config:
        orm_mode = True


class LeaderboardItem(BaseModel):
    name: str
    reports: int


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(title="Hyacinth Watch API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["meta"])
def healthcheck() -> dict:
    return {"status": "ok", "service": "hyacinth-watch-api"}


# ---------------------------------------------------------------------------
# Reports
# ---------------------------------------------------------------------------


@app.get("/api/reports", response_model=List[ReportOut], tags=["reports"])
def list_reports(db: Session = next(get_db())):
    """
    Return all reports, newest first.
    The shape matches what the frontend currently uses.
    """
    reports = db.query(Report).order_by(Report.created_at.desc()).all()
    return reports


@app.post("/api/reports", response_model=ReportOut, tags=["reports"])
def create_report(payload: ReportIn, db: Session = next(get_db())):
    """
    Create a new report.
    """
    if payload.severity not in {"low", "medium", "high", "critical"}:
        raise HTTPException(status_code=400, detail="Invalid severity level")

    report = Report(
        lat=payload.lat,
        lng=payload.lng,
        title=payload.title,
        date=payload.date,
        severity=payload.severity,
        cleaned=payload.cleaned,
        description=payload.description,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


# ---------------------------------------------------------------------------
# Stats for dashboard + home impact counters
# ---------------------------------------------------------------------------


@app.get("/api/stats", response_model=StatsOut, tags=["stats"])
def get_stats(db: Session = next(get_db())):
    """
    Aggregate numbers used by:
    - Home impact counters
    - Dashboard metric cards
    """
    total = db.query(Report).count()
    high_critical = (
        db.query(Report)
        .filter(Report.severity.in_(["high", "critical"]))
        .count()
    )
    cleaned = db.query(Report).filter(Report.cleaned.is_(True)).count()

    # Use title as a human-readable key; fall back to coordinates
    active_areas = (
        db.query(func.count(func.distinct(Report.title)))
        .filter(Report.title.isnot(None))
        .scalar()
    )

    if not active_areas:
        active_areas = (
            db.query(func.count(func.distinct(func.concat(Report.lat, ":", Report.lng))))
            .scalar()
        )

    # Simple growth proxy: last 30 days vs total
    now = datetime.utcnow()
    thirty_days_ago = now.date().toordinal() - 30
    last_30 = (
        db.query(Report)
        .filter(Report.date >= date.fromordinal(thirty_days_ago))
        .count()
    )
    growth_rate = float(last_30) / total * 100 if total > 0 else 0.0

    return StatsOut(
        total_reports=total,
        high_critical=high_critical,
        cleaned=cleaned,
        active_areas=active_areas or 0,
        growth_rate=round(growth_rate, 1),
    )


# ---------------------------------------------------------------------------
# Volunteers
# ---------------------------------------------------------------------------


@app.post("/api/volunteers", response_model=VolunteerOut, tags=["volunteers"])
def signup_volunteer(payload: VolunteerIn, db: Session = next(get_db())):
    """
    Store a volunteer email.
    Idempotent: signing up twice with the same email just returns the same record.
    """
    existing = db.query(Volunteer).filter(Volunteer.email == payload.email).first()
    if existing:
        return existing

    volunteer = Volunteer(email=payload.email)
    db.add(volunteer)
    db.commit()
    db.refresh(volunteer)
    return volunteer


@app.get("/api/volunteers/leaderboard", response_model=List[LeaderboardItem], tags=["volunteers"])
def get_leaderboard() -> List[LeaderboardItem]:
    """
    Simple, static-ish leaderboard to support the current UI.
    (You can later back this with real aggregates.)
    """
    sample = [
        {"name": "A. Njoroge", "reports": 18},
        {"name": "L. Santos", "reports": 15},
        {"name": "R. Almeida", "reports": 12},
        {"name": "M. Khan", "reports": 11},
    ]
    return [LeaderboardItem(**row) for row in sample]


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)


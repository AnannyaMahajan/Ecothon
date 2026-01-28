# ECOTHON 2026 - Water Hyacinth Monitoring System

A community-driven AI-powered platform for tracking and monitoring water hyacinth (Eichhornia) infestations in water bodies.

## Features

- 🗺️ **Interactive Live Map** - View all reported infestations on an interactive map
- 📸 **Report Submission** - Submit reports with photos, GPS location, and descriptions
- 🤖 **AI Analysis** - TensorFlow.js-powered image classification and NLP text analysis
- 📊 **Dashboard** - Real-time statistics, charts, and growth tracking
- 👥 **Volunteer Program** - Top contributors leaderboard and cleanup squad signup
- 📚 **Education** - Comprehensive information about Eichhornia and prevention methods

## Tech Stack

### Frontend
- HTML5, CSS3, JavaScript
- Leaflet.js for mapping
- Chart.js for data visualization
- TensorFlow.js for AI/ML

### Backend
- FastAPI (Python)
- SQLite database
- RESTful API

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the backend server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Open `index.html` in a web browser, or use a local server:
```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx serve
```

2. Navigate to `http://localhost:8080` (or the port you chose)

## API Endpoints

- `GET /api/reports` - Get all reports
- `POST /api/reports` - Submit a new report
- `GET /api/dashboard` - Get dashboard statistics
- `GET /api/volunteers/top` - Get top contributors
- `POST /api/volunteers/signup` - Sign up as a volunteer

## Mapping Setup

The application uses **Leaflet.js** with **OpenStreetMap** tiles, which requires no API key. The map is free to use and works out of the box.

If you want to use Google Maps instead, you can:
1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Add the Google Maps script to `map.html` and integrate it with Leaflet using a plugin

## Project Structure

```
.
├── index.html          # Homepage
├── map.html            # Interactive map page
├── report.html         # Report submission form
├── dashboard.html      # Dashboard with statistics
├── volunteers.html     # Volunteer program page
├── education.html      # Educational content
├── styles.css          # Main stylesheet
├── map.css             # Map page styles
├── report.css          # Report form styles
├── dashboard.css       # Dashboard styles
├── volunteers.css      # Volunteer page styles
├── education.css       # Education page styles
├── map.js              # Map functionality
├── report.js            # Report form logic
├── dashboard.js         # Dashboard logic
├── volunteers.js        # Volunteer functionality
├── backend/
│   ├── main.py         # FastAPI backend
│   ├── requirements.txt # Python dependencies
│   └── uploads/         # Uploaded images directory
└── README.md           # This file
```

## Team

**CTRL ALT ELITE** - ECOTHON 2026
- Team Leader: Anannya Mahajan

## License

This project is part of the India-Israel Hackathon and Symposium 2026.

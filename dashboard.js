let reportsChart = null;
let severityChart = null;

// Load dashboard data
async function loadDashboardData() {
  try {
    const response = await fetch("http://localhost:8000/api/dashboard");
    const data = await response.json();
    updateStats(data);
    updateCharts(data);
    updateRecentReports(data.recent_reports || []);
  } catch (error) {
    console.error("Error loading dashboard:", error);
    // Use sample data for demo
    useSampleData();
  }
}

// Update statistics
function updateStats(data) {
  document.getElementById("total-reports").textContent =
    data.total_reports || 0;
  document.getElementById("areas-cleaned").textContent =
    data.areas_cleaned || 0;
  document.getElementById("high-critical").textContent =
    data.high_critical_count || 0;
  document.getElementById("growth-rate").textContent =
    (data.growth_rate || 0).toFixed(1) + "%";
}

// Update charts
function updateCharts(data) {
  updateReportsChart(data.reports_over_time || []);
  updateSeverityChart(data.severity_distribution || {});
}

// Update reports over time chart
function updateReportsChart(timeData) {
  const ctx = document.getElementById("reports-chart").getContext("2d");

  const labels = timeData.map((d) => new Date(d.date).toLocaleDateString());
  const counts = timeData.map((d) => d.count);

  if (reportsChart) {
    reportsChart.destroy();
  }

  reportsChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Reports",
          data: counts,
          borderColor: "#16a34a",
          backgroundColor: "rgba(22, 163, 74, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: "#9ca3af",
          },
          grid: {
            color: "rgba(148, 163, 184, 0.1)",
          },
        },
        x: {
          ticks: {
            color: "#9ca3af",
          },
          grid: {
            color: "rgba(148, 163, 184, 0.1)",
          },
        },
      },
    },
  });
}

// Update severity distribution chart
function updateSeverityChart(severityData) {
  const ctx = document.getElementById("severity-chart").getContext("2d");

  const labels = Object.keys(severityData);
  const values = Object.values(severityData);
  const colors = {
    low: "#86efac",
    medium: "#fde047",
    high: "#f59e0b",
    critical: "#dc2626",
  };

  if (severityChart) {
    severityChart.destroy();
  }

  severityChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels.map((l) => l.toUpperCase()),
      datasets: [
        {
          data: values,
          backgroundColor: labels.map((l) => colors[l] || "#9ca3af"),
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#9ca3af",
          },
        },
      },
    },
  });
}

// Update recent reports list
function updateRecentReports(reports) {
  const container = document.getElementById("recent-reports");

  if (reports.length === 0) {
    container.innerHTML = '<p class="muted-text">No reports yet</p>';
    return;
  }

  container.innerHTML = reports
    .map((report) => {
      const severityClass = `severity-${report.severity}`;
      return `
      <div class="report-item">
        ${report.image_url ? `<img src="${report.image_url}" alt="Report" class="report-item-image" />` : '<div class="report-item-image" style="background: rgba(148, 163, 184, 0.2);"></div>'}
        <div class="report-item-info">
          <h3>Report #${report.id}</h3>
          <p><strong>Location:</strong> ${report.location || "Unknown"}</p>
          <p><strong>Date:</strong> ${new Date(report.date_observed).toLocaleString()}</p>
          <p>${report.description || "No description"}</p>
        </div>
        <div class="report-item-severity">
          <span class="severity-badge ${severityClass}">${report.severity.toUpperCase()}</span>
        </div>
      </div>
    `;
    })
    .join("");
}

// Use sample data for demo
function useSampleData() {
  const sampleData = {
    total_reports: 47,
    areas_cleaned: 12,
    high_critical_count: 8,
    growth_rate: 15.3,
    reports_over_time: generateTimeSeries(30),
    severity_distribution: {
      low: 15,
      medium: 18,
      high: 10,
      critical: 4,
    },
    recent_reports: [
      {
        id: 47,
        severity: "high",
        location: "Mumbai, Maharashtra",
        date_observed: new Date().toISOString(),
        description: "Large patches covering water surface",
        image_url: null,
      },
      {
        id: 46,
        severity: "critical",
        location: "Bangalore, Karnataka",
        date_observed: new Date(Date.now() - 86400000).toISOString(),
        description: "Water body almost completely blocked",
        image_url: null,
      },
      {
        id: 45,
        severity: "medium",
        location: "New Delhi",
        date_observed: new Date(Date.now() - 172800000).toISOString(),
        description: "Partial coverage detected",
        image_url: null,
      },
    ],
  };

  updateStats(sampleData);
  updateCharts(sampleData);
  updateRecentReports(sampleData.recent_reports);
}

// Generate time series data
function generateTimeSeries(days) {
  const data = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString(),
      count: Math.floor(Math.random() * 10) + 1,
    });
  }
  return data;
}

// Add severity badge styles
const style = document.createElement("style");
style.textContent = `
  .severity-badge {
    display: inline-block;
    padding: 0.3rem 0.8rem;
    border-radius: var(--radius-pill);
    font-size: 0.8rem;
    font-weight: 500;
  }
  .severity-low { background: rgba(34, 197, 94, 0.2); color: #86efac; }
  .severity-medium { background: rgba(251, 191, 36, 0.2); color: #fde047; }
  .severity-high { background: rgba(249, 115, 22, 0.2); color: #fdba74; }
  .severity-critical { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
`;
document.head.appendChild(style);

// Initialize dashboard
document.addEventListener("DOMContentLoaded", () => {
  loadDashboardData();
  // Refresh every 30 seconds
  setInterval(loadDashboardData, 30000);
});

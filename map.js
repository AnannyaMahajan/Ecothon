// Initialize map
let map;
let markers = [];
let currentFilter = "all";

// Severity colors - Green-based theme
const severityColors = {
  low: "#86efac",      // Light green
  medium: "#fde047",   // Yellow (kept for visibility)
  high: "#f59e0b",     // Amber (warmer than orange)
  critical: "#dc2626", // Red (kept for urgency)
};

// Initialize Leaflet map
function initMap() {
  map = L.map("map").setView([20.5937, 78.9629], 5); // Center on India

  // Add OpenStreetMap tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

  // Load reports from API
  loadReports();
}

// Load reports from backend
async function loadReports() {
  try {
    const response = await fetch("http://localhost:8000/api/reports");
    const reports = await response.json();

    // Clear existing markers
    markers.forEach((marker) => map.removeLayer(marker));
    markers = [];

    // Add markers for each report
    reports.forEach((report) => {
      addMarker(report);
    });

    updateStats(reports);
  } catch (error) {
    console.error("Error loading reports:", error);
    // Add sample data for demo
    addSampleMarkers();
  }
}

// Add marker to map
function addMarker(report) {
  const color = severityColors[report.severity] || severityColors.low;
  const icon = L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
  });

  const marker = L.marker([report.latitude, report.longitude], {
    icon: icon,
  }).addTo(map);

  marker.bindPopup(`
    <div style="min-width: 200px;">
      <h3 style="margin: 0 0 0.5rem;">${report.severity.toUpperCase()} Severity</h3>
      <p style="margin: 0.25rem 0;"><strong>Date:</strong> ${new Date(report.date_observed).toLocaleDateString()}</p>
      <p style="margin: 0.25rem 0;"><strong>Location:</strong> ${report.location || "Unknown"}</p>
      <p style="margin: 0.5rem 0 0;">${report.description || "No description"}</p>
    </div>
  `);

  marker.on("click", () => {
    showMarkerPreview(report);
  });

  // Store report data with marker for filtering
  marker.report = report;
  markers.push(marker);
}

// Show marker preview card
function showMarkerPreview(report) {
  const previewDiv = document.getElementById("marker-preview");
  const previewContent = document.getElementById("preview-content");
  const severityClass = report.severity;

  previewContent.innerHTML = `
    ${report.image_url ? `<img src="${report.image_url}" alt="Report image" class="preview-image" />` : ""}
    <div class="preview-header">
      <h3 class="preview-title">Report #${report.id}</h3>
      <span class="preview-severity ${severityClass}">${report.severity.toUpperCase()}</span>
    </div>
    <div class="preview-meta">
      <p><strong>Date:</strong> ${new Date(report.date_observed).toLocaleDateString()}</p>
      <p><strong>Location:</strong> ${report.location || "Unknown"}</p>
      <p><strong>Coordinates:</strong> ${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}</p>
    </div>
    <p class="preview-description">${report.description || "No description provided"}</p>
    ${report.ai_confidence ? `<p class="preview-meta"><strong>AI Confidence:</strong> ${(report.ai_confidence * 100).toFixed(1)}%</p>` : ""}
    <div class="preview-actions">
      <button class="btn btn-primary" onclick="window.location.href='dashboard.html'">View Full Report</button>
    </div>
  `;

  previewDiv.classList.remove("hidden");

  // Close button handler
  const closeBtn = previewDiv.querySelector('.preview-close');
  if (closeBtn) {
    closeBtn.onclick = () => {
      previewDiv.classList.add("hidden");
    };
  }
}

// Update statistics
function updateStats(reports) {
  document.getElementById("total-reports").textContent = reports.length;
  const criticalCount = reports.filter((r) => r.severity === "critical").length;
  document.getElementById("critical-count").textContent = criticalCount;
}

// Filter markers by severity
function filterMarkers(severity) {
  markers.forEach((marker) => {
    if (severity === "all") {
      marker.addTo(map);
    } else {
      const report = marker.report;
      if (report && report.severity === severity) {
        marker.addTo(map);
      } else {
        map.removeLayer(marker);
      }
    }
  });

  // Update active button
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.severity === severity) {
      btn.classList.add("active");
    }
  });

  currentFilter = severity;
}

// Add sample markers for demo
function addSampleMarkers() {
  const sampleReports = [
    {
      id: 1,
      latitude: 19.076,
      longitude: 72.8777,
      severity: "high",
      date_observed: new Date().toISOString(),
      location: "Mumbai, Maharashtra",
      description: "Large patches of water hyacinth observed covering approximately 40% of the water surface.",
      ai_confidence: 0.87,
    },
    {
      id: 2,
      latitude: 12.9716,
      longitude: 77.5946,
      severity: "critical",
      date_observed: new Date(Date.now() - 86400000).toISOString(),
      location: "Bangalore, Karnataka",
      description: "Critical infestation - water body almost completely blocked. Urgent action required.",
      ai_confidence: 0.92,
    },
    {
      id: 3,
      latitude: 28.6139,
      longitude: 77.209,
      severity: "medium",
      date_observed: new Date(Date.now() - 172800000).toISOString(),
      location: "New Delhi",
      description: "Partial coverage detected. Monitoring recommended.",
      ai_confidence: 0.75,
    },
  ];

  sampleReports.forEach((report) => {
    addMarker(report);
  });

  updateStats(sampleReports);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  initMap();

  // Filter button handlers
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      filterMarkers(btn.dataset.severity);
    });
  });
});

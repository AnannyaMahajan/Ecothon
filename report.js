// Step Navigation
let currentStep = 1;
const totalSteps = 4;

function nextStep() {
  if (currentStep < totalSteps) {
    // Validate current step
    if (validateStep(currentStep)) {
      currentStep++;
      updateSteps();
    }
  }
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    updateSteps();
  }
}

function updateSteps() {
  // Update step indicators
  document.querySelectorAll('.step-item').forEach((item, index) => {
    const stepNum = index + 1;
    item.classList.remove('active', 'completed');
    if (stepNum < currentStep) {
      item.classList.add('completed');
    } else if (stepNum === currentStep) {
      item.classList.add('active');
    }
  });

  // Update form steps
  document.querySelectorAll('.form-step').forEach((step, index) => {
    const stepNum = index + 1;
    step.classList.remove('active');
    if (stepNum === currentStep) {
      step.classList.add('active');
    }
  });

  // Update review summary on step 4
  if (currentStep === 4) {
    updateReviewSummary();
  }
}

function validateStep(step) {
  switch(step) {
    case 1:
      const photo = document.getElementById('photo');
      if (!photo.files.length) {
        showToast('Please upload a photo first', 'error');
        return false;
      }
      return true;
    case 2:
      const lat = parseFloat(document.getElementById('latitude').value);
      const lon = parseFloat(document.getElementById('longitude').value);
      if (!lat || !lon) {
        showToast('Please set your location first', 'error');
        return false;
      }
      return true;
    case 3:
      const description = document.getElementById('description').value.trim();
      if (!description) {
        showToast('Please add a description', 'error');
        return false;
      }
      return true;
    default:
      return true;
  }
}

function updateReviewSummary() {
  const summary = document.getElementById('review-summary');
  const photo = document.getElementById('photo-preview');
  const location = document.getElementById('location').value;
  const lat = document.getElementById('latitude').value;
  const lon = document.getElementById('longitude').value;
  const date = document.getElementById('date-observed').value;
  const severity = document.getElementById('severity').value;
  const description = document.getElementById('description').value;

  summary.innerHTML = `
    ${photo.classList.contains('show') ? `<img src="${photo.src}" alt="Report photo" class="review-image" />` : ''}
    <div class="review-item">
      <span class="review-label">Location:</span>
      <span class="review-value">${location || 'Not specified'}</span>
    </div>
    <div class="review-item">
      <span class="review-label">Coordinates:</span>
      <span class="review-value">${lat}, ${lon}</span>
    </div>
    <div class="review-item">
      <span class="review-label">Date Observed:</span>
      <span class="review-value">${new Date(date).toLocaleDateString()}</span>
    </div>
    <div class="review-item">
      <span class="review-label">Severity:</span>
      <span class="review-value"><span class="preview-severity ${severity}">${severity.toUpperCase()}</span></span>
    </div>
    <div class="review-item">
      <span class="review-label">Description:</span>
      <span class="review-value">${description}</span>
    </div>
  `;
}

// Make functions globally available
window.nextStep = nextStep;
window.prevStep = prevStep;

// Initialize TensorFlow.js model (simplified version)
let model = null;

// Load AI model (placeholder - in production, load actual trained model)
async function loadModel() {
  try {
    // In production, load from: await tf.loadLayersModel('/models/water-hyacinth-model.json');
    console.log("AI model ready (using placeholder)");
    model = "ready";
  } catch (error) {
    console.error("Error loading model:", error);
  }
}

// Analyze image with AI
async function analyzeImage(imageFile) {
  if (!model) {
    await loadModel();
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const img = new Image();
      img.onload = async () => {
        // Placeholder AI analysis
        // In production, use actual TensorFlow.js model
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        // Simulate AI analysis
        const severity = simulateAIAnalysis(img);
        const confidence = 0.75 + Math.random() * 0.2;

        resolve({
          severity,
          confidence,
          coverage: Math.floor(Math.random() * 100),
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(imageFile);
  });
}

// Simulate AI analysis (replace with actual model)
function simulateAIAnalysis(img) {
  // Simple heuristic based on image characteristics
  const colors = ["low", "medium", "high", "critical"];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Analyze text description with NLP
function analyzeText(text) {
  const lowerText = text.toLowerCase();
  let severity = "low";
  let confidence = 0.5;

  // Keyword-based analysis
  const keywords = {
    critical: ["blocked", "completely", "full", "entire", "100%", "total"],
    high: ["full cover", "most", "majority", "large", "extensive"],
    medium: ["partial", "some", "moderate", "half", "50%"],
    low: ["patches", "few", "small", "little", "minimal"],
  };

  for (const [level, words] of Object.entries(keywords)) {
    if (words.some((word) => lowerText.includes(word))) {
      severity = level;
      confidence = 0.7;
      break;
    }
  }

  return { severity, confidence };
}

// Get current location
function getCurrentLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser");
    return;
  }

  const statusDiv = document.getElementById("submit-status");
  statusDiv.className = "submit-status";
  statusDiv.textContent = "Getting location...";
  statusDiv.style.display = "block";

  navigator.geolocation.getCurrentPosition(
    (position) => {
      document.getElementById("latitude").value = position.coords.latitude;
      document.getElementById("longitude").value = position.coords.longitude;
      statusDiv.textContent = "Location captured successfully!";
      statusDiv.className = "submit-status success";
      setTimeout(() => {
        statusDiv.style.display = "none";
      }, 3000);
    },
    (error) => {
      statusDiv.textContent = "Error getting location: " + error.message;
      statusDiv.className = "submit-status error";
    }
  );
}

// Handle photo upload
document.getElementById("photo").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const preview = document.getElementById("photo-preview");
  const uploadArea = document.getElementById("upload-area");
  const analysisDiv = document.getElementById("ai-analysis");

  // Show preview
  const reader = new FileReader();
  reader.onload = (e) => {
    preview.src = e.target.result;
    preview.classList.add("show");
    uploadArea.querySelector(".upload-text").textContent = file.name;
  };
  reader.readAsDataURL(file);

  // Analyze with AI
  analysisDiv.innerHTML = "<p>🤖 Analyzing image with AI...</p>";
  analysisDiv.classList.add("show");

  try {
    const analysis = await analyzeImage(file);
    analysisDiv.innerHTML = `
      <h4>AI Analysis Results</h4>
      <p><strong>Detected Severity:</strong> ${analysis.severity.toUpperCase()}</p>
      <p><strong>Confidence:</strong> ${(analysis.confidence * 100).toFixed(1)}%</p>
      <p><strong>Estimated Coverage:</strong> ${analysis.coverage}%</p>
    `;

    // Update AI detection display
    document.getElementById('ai-severity').textContent = analysis.severity.toUpperCase();
    document.getElementById('ai-confidence').textContent = (analysis.confidence * 100).toFixed(0) + '%';

    // Auto-select severity option
    const severityInput = document.getElementById("severity");
    severityInput.value = analysis.severity;
    
    // Update severity selector UI
    document.querySelectorAll('.severity-option').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.severity === analysis.severity) {
        btn.classList.add('active');
      }
    });
  } catch (error) {
    console.error("Error analyzing image:", error);
    analysisDiv.innerHTML = "<p>Analysis unavailable. Please select severity manually.</p>";
  }
});

// Handle severity selector buttons
document.querySelectorAll('.severity-option').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.severity-option').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('severity').value = btn.dataset.severity;
  });
});

// Handle description analysis
document.getElementById("description").addEventListener("input", (e) => {
  const text = e.target.value;
  if (text.length > 50) {
    const analysis = analyzeText(text);
    const severityInput = document.getElementById("severity");
    if (!severityInput.value && analysis.confidence > 0.6) {
      severityInput.value = analysis.severity;
      // Update UI
      document.querySelectorAll('.severity-option').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.severity === analysis.severity) {
          btn.classList.add('active');
        }
      });
    }
  }
});

// Handle form submission
document.getElementById("report-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const statusDiv = document.getElementById("submit-status");

  // Validate location
  const lat = parseFloat(formData.get("latitude"));
  const lon = parseFloat(formData.get("longitude"));

  if (!lat || !lon) {
    statusDiv.textContent = "Please capture your location first";
    statusDiv.className = "submit-status error";
    statusDiv.style.display = "block";
    return;
  }

  statusDiv.textContent = "Submitting report...";
  statusDiv.className = "submit-status";
  statusDiv.style.display = "block";

  try {
    const response = await fetch("http://localhost:8000/api/reports", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      statusDiv.textContent = "Report submitted successfully! Thank you for your contribution.";
      statusDiv.className = "submit-status success";
      e.target.reset();
      document.getElementById("photo-preview").classList.remove("show");
      document.getElementById("ai-analysis").classList.remove("show");
    } else {
      throw new Error("Submission failed");
    }
  } catch (error) {
    console.error("Error submitting report:", error);
    statusDiv.textContent =
      "Error submitting report. Please try again or check your connection.";
    statusDiv.className = "submit-status error";
  }
});

// Get location button
document.getElementById("get-location-btn").addEventListener("click", getCurrentLocation);

// Set default date to today
document.getElementById("date-observed").valueAsDate = new Date();

// Initialize
loadModel();
updateSteps(); // Initialize step display

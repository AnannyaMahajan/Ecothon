// Load contributors list
async function loadContributors() {
  try {
    const response = await fetch("http://localhost:8000/api/volunteers/top");
    const contributors = await response.json();
    displayContributors(contributors);
  } catch (error) {
    console.error("Error loading contributors:", error);
    // Use sample data
    displayContributors(getSampleContributors());
  }
}

// Display contributors
function displayContributors(contributors) {
  const container = document.getElementById("contributors-list");
  if (contributors.length === 0) return;

  container.innerHTML = `
    <h3 style="margin-bottom: 1rem;">All Contributors</h3>
    ${contributors
      .map(
        (contributor, index) => `
      <div class="contributor-item">
        <div class="contributor-item-rank">#${index + 4}</div>
        <div class="contributor-item-avatar">${contributor.initials}</div>
        <div class="contributor-item-info">
          <h4>${contributor.name}</h4>
          <p>${contributor.reports} Reports • ${contributor.cleanups} Cleanups</p>
        </div>
      </div>
    `
      )
      .join("")}
  `;
}

// Get sample contributors
function getSampleContributors() {
  return [
    { name: "Sneha Patel", initials: "SP", reports: 12, cleanups: 3 },
    { name: "Vikram Singh", initials: "VS", reports: 10, cleanups: 2 },
    { name: "Meera Nair", initials: "MN", reports: 9, cleanups: 4 },
    { name: "Rahul Desai", initials: "RD", reports: 8, cleanups: 1 },
    { name: "Anita Reddy", initials: "AR", reports: 7, cleanups: 2 },
  ];
}

// Handle volunteer signup form
document.getElementById("volunteer-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    location: formData.get("location"),
    interests: formData.getAll("interests"),
  };

  const statusDiv = document.getElementById("signup-status");
  statusDiv.textContent = "Submitting...";
  statusDiv.className = "submit-status";
  statusDiv.style.display = "block";

  try {
    const response = await fetch("http://localhost:8000/api/volunteers/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      statusDiv.textContent =
        "Thank you for joining! You'll receive updates about cleanup events and volunteer opportunities.";
      statusDiv.className = "submit-status success";
      e.target.reset();
    } else {
      throw new Error("Signup failed");
    }
  } catch (error) {
    console.error("Error signing up:", error);
    statusDiv.textContent =
      "Error signing up. Please try again or check your connection.";
    statusDiv.className = "submit-status error";
  }
});

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadContributors();
});

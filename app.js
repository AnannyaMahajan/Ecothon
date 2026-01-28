// Theme Toggle
function initThemeToggle() {
  const themeToggle = document.querySelector('.theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('theme');
  
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);
  
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }
}

function updateThemeIcon(theme) {
  const themeToggle = document.querySelector('.theme-toggle');
  if (themeToggle) {
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

// Initialize theme on load
document.addEventListener('DOMContentLoaded', initThemeToggle);

// Toast Notification System
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : '✕'}</span>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Loading Skeleton
function createSkeleton(type = 'card') {
  const skeleton = document.createElement('div');
  skeleton.className = `skeleton skeleton-${type}`;
  return skeleton;
}

// Mobile Navigation
function initMobileNav() {
  if (window.innerWidth <= 768) {
    const nav = document.querySelector('.site-header .nav');
    if (nav && !document.querySelector('.mobile-nav')) {
      const mobileNav = document.createElement('nav');
      mobileNav.className = 'mobile-nav';
      mobileNav.innerHTML = `
        <a href="index.html" class="mobile-nav-item">
          <span>🏠</span>
          <span>Home</span>
        </a>
        <a href="map.html" class="mobile-nav-item">
          <span>🗺️</span>
          <span>Map</span>
        </a>
        <a href="report.html" class="mobile-nav-item">
          <span>📸</span>
          <span>Report</span>
        </a>
        <a href="dashboard.html" class="mobile-nav-item">
          <span>📊</span>
          <span>Dashboard</span>
        </a>
        <a href="volunteers.html" class="mobile-nav-item">
          <span>👥</span>
          <span>Volunteer</span>
        </a>
      `;
      document.body.appendChild(mobileNav);
      
      // Set active nav item
      const currentPath = window.location.pathname.split('/').pop() || 'index.html';
      mobileNav.querySelectorAll('.mobile-nav-item').forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
          item.classList.add('active');
        }
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  window.addEventListener('resize', initMobileNav);
});

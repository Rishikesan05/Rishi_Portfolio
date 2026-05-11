
/* ======================================
   MOBILE DRAWER — slide-in from right
====================================== */
const drawer    = document.getElementById("mobile-drawer");
const overlay   = document.getElementById("mobile-overlay");
const hamburger = document.getElementById("hamburger-icon");

function openMenu() {
  drawer  && drawer.classList.add("open");
  overlay && overlay.classList.add("active");
  hamburger && hamburger.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeMenu() {
  drawer  && drawer.classList.remove("open");
  overlay && overlay.classList.remove("active");
  hamburger && hamburger.classList.remove("open");
  document.body.style.overflow = "";
}

function toggleMenu() {
  if (drawer && drawer.classList.contains("open")) {
    closeMenu();
  } else {
    openMenu();
  }
}

/* ======================================
   DARK MODE
====================================== */
const THEME_KEY = "rishi-theme";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  const isDark = theme === "dark";

  // Desktop SVG icons
  const dtMoon = document.getElementById("dt-icon-moon");
  const dtSun  = document.getElementById("dt-icon-sun");
  if (dtMoon) dtMoon.style.display = isDark ? "none" : "block";
  if (dtSun)  dtSun.style.display  = isDark ? "block" : "none";

  // Mobile nav SVG icons
  const mbMoon = document.getElementById("icon-moon");
  const mbSun  = document.getElementById("icon-sun");
  if (mbMoon) mbMoon.style.display = isDark ? "none" : "block";
  if (mbSun)  mbSun.style.display  = isDark ? "block" : "none";

  // Desktop label
  const label = document.querySelector(".theme-label");
  if (label) label.textContent = isDark ? "Light" : "Dark";
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "light";
  applyTheme(current === "dark" ? "light" : "dark");
}

// Desktop button
const desktopBtn = document.getElementById("theme-toggle");
if (desktopBtn) desktopBtn.addEventListener("click", toggleTheme);

// On load — restore saved or use OS preference
(function () {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) {
    applyTheme(saved);
  } else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    applyTheme("dark");
  }
})();

/* ======================================
   PROJECT FILTER
====================================== */
const filterBtns  = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");
const noResultsEl  = document.getElementById("no-results");

filterBtns.forEach(btn => {
  btn.addEventListener("click", function () {
    filterBtns.forEach(b => b.classList.remove("active"));
    this.classList.add("active");

    const filter = this.dataset.filter;
    let visibleCount = 0;
    
    const grid = document.getElementById("projects-grid");
    const isExpanded = grid ? grid.classList.contains("expanded") : false;

    projectCards.forEach(card => {
      const match = filter === "all" || card.dataset.category === filter;
      let show = false;
      
      if (match) {
        visibleCount++;
        if (filter !== "all" || isExpanded || visibleCount <= 6) {
          show = true;
        }
      }
      card.classList.toggle("hidden", !show);
    });

    if (noResultsEl) {
      noResultsEl.style.display = visibleCount === 0 ? "block" : "none";
    }
    
    const toggleBtn = document.getElementById("projects-toggle-btn");
    if (toggleBtn) {
      if (filter === "all" && visibleCount > 6) {
        toggleBtn.style.display = "inline-flex";
        toggleBtn.innerHTML = isExpanded 
          ? 'Show Less <svg width="20" height="20" style="width:1.2em;height:1.2em;margin-left:0.3em;vertical-align:-0.25em;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>' 
          : 'Show More <svg width="20" height="20" style="width:1.2em;height:1.2em;margin-left:0.3em;vertical-align:-0.25em;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
      } else {
        toggleBtn.style.display = "none";
      }
    }
  });
});

function toggleProjectsGrid() {
  const grid = document.getElementById("projects-grid");
  if (!grid) return;
  grid.classList.toggle("expanded");
  
  const activeFilter = document.querySelector(".filter-btn.active");
  if (activeFilter) activeFilter.click();
}

// Trigger default filter on load
const activeFilter = document.querySelector(".filter-btn.active");
if (activeFilter) activeFilter.click();

/* ======================================
   CONTACT FORM
====================================== */
async function handleContactForm(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector(".form-submit-btn");
  const status = document.getElementById("form-status");
  const original = btn.textContent;

  // Sending state
  btn.textContent = "Sending...";
  btn.disabled = true;
  status.className = "form-status";
  status.textContent = "";

  try {
    const formData = new FormData(form);
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData
    });
    const data = await res.json();

    if (data.success) {
      // Success
      status.textContent = "✓ Message sent! I'll get back to you soon.";
      status.className = "form-status form-status-success";
      btn.textContent = "Sent ✓";
      btn.style.background = "#22c55e";
      btn.style.borderColor = "#22c55e";
      form.reset();
      setTimeout(() => {
        btn.textContent = original;
        btn.style.background = "";
        btn.style.borderColor = "";
        btn.disabled = false;
        status.textContent = "";
        status.className = "form-status";
      }, 4000);
    } else {
      throw new Error(data.message || "Something went wrong");
    }
  } catch (err) {
    // Error
    status.textContent = "✕ Failed to send. Please try again or email me directly.";
    status.className = "form-status form-status-error";
    btn.textContent = "Retry →";
    btn.style.background = "#ef4444";
    btn.style.borderColor = "#ef4444";
    btn.disabled = false;
    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = "";
      btn.style.borderColor = "";
      status.textContent = "";
      status.className = "form-status";
    }, 5000);
  }
}

/* ======================================
   ACTIVE NAV LINK ON SCROLL
====================================== */
const sections    = document.querySelectorAll("section[id]");
const allNavLinks = document.querySelectorAll("#desktop-nav .nav-links a");

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      allNavLinks.forEach(link => {
        link.classList.toggle(
          "active-link",
          link.getAttribute("href") === `#${id}`
        );
      });
    }
  });
}, { rootMargin: "-40% 0px -55% 0px" });

sections.forEach(s => navObserver.observe(s));

/* ======================================
   LINKEDIN FEED AUTO-SCROLL
====================================== */
let currentPost = 0;
const posts = document.querySelectorAll(".lf-post");
const dots  = document.querySelectorAll(".lf-dot");
let feedTimer = null;

function goToPost(idx) {
  posts.forEach(p => { p.classList.remove("lf-post--active"); p.style.display = "none"; });
  dots.forEach(d => d.classList.remove("active"));
  currentPost = idx;
  if (posts[idx]) { posts[idx].style.display = "block"; posts[idx].classList.add("lf-post--active"); }
  if (dots[idx])  dots[idx].classList.add("active");
}

function nextPost() {
  goToPost((currentPost + 1) % posts.length);
}

if (posts.length > 0) {
  posts.forEach((p, i) => { p.style.display = i === 0 ? "block" : "none"; });
  feedTimer = setInterval(nextPost, 4000);
  const feed = document.querySelector(".lf-posts");
  if (feed) {
    feed.addEventListener("mouseenter", () => clearInterval(feedTimer));
    feed.addEventListener("mouseleave", () => { feedTimer = setInterval(nextPost, 4000); });
  }
}


/* ======================================
   SCROLL REVEAL — fade-in on scroll
====================================== */
const revealElements = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target); // only once
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

revealElements.forEach(el => revealObserver.observe(el));

/* ======================================
   ANIMATED STAT COUNTER
====================================== */
function animateCounters() {
  document.querySelectorAll(".stat-number").forEach(el => {
    const raw = el.textContent.trim();
    const suffix = raw.replace(/[0-9]/g, "");
    const target = parseInt(raw);
    if (isNaN(target)) return;
    
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 30));
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      el.textContent = current + suffix;
    }, 40);
  });
}

// Trigger counter animation when stats bar enters viewport
const statsBar = document.querySelector(".stats-bar");
if (statsBar) {
  let counted = false;
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !counted) {
        counted = true;
        animateCounters();
      }
    });
  }, { threshold: 0.5 });
  statsObserver.observe(statsBar);
}

/* ======================================
   SHOW MORE / LESS TOGGLE
====================================== */
function toggleGrid(selector, btn) {
  const grid = document.querySelector(selector);
  if (!grid) return;
  
  grid.classList.toggle("expanded");
  const isExpanded = grid.classList.contains("expanded");
  
  btn.innerHTML = isExpanded 
    ? 'Show Less <svg width="20" height="20" style="width:1.2em;height:1.2em;margin-left:0.3em;vertical-align:-0.25em;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>' 
    : 'Show More <svg width="20" height="20" style="width:1.2em;height:1.2em;margin-left:0.3em;vertical-align:-0.25em;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
}

/* ======================================
   DYNAMIC STATS CALCULATION
====================================== */
function calculateStats() {
  // Projects: count all project cards
  const projectCount = document.querySelectorAll(".project-card").length;
  const statProjects = document.getElementById("stat-projects");
  if (statProjects) statProjects.textContent = projectCount + "+";

  // Awards: count only major awards
  const awardsCount = document.querySelectorAll('.award-card[data-major="true"]').length;
  const statAwards = document.getElementById("stat-awards");
  if (statAwards) statAwards.textContent = awardsCount;

  // Years Coding: calculate from 2023
  const currentYear = new Date().getFullYear();
  const yearsCoding = currentYear - 2023;
  const statYears = document.getElementById("stat-years");
  if (statYears) statYears.textContent = yearsCoding + "+";

  // Footer Year
  const footerYear = document.getElementById("footer-year");
  if (footerYear) footerYear.textContent = currentYear;

  // Organizations: count unique tags
  const orgCount = document.querySelectorAll('[data-count-org="true"]').length;
  const statOrgs = document.getElementById("stat-orgs");
  if (statOrgs) statOrgs.textContent = orgCount;
}

/* ======================================
   DEMO MODAL LOGIC
====================================== */
function openDemoModal(projectName) {
  const modal = document.getElementById('demo-modal');
  const projectInput = document.getElementById('demo-project');
  if (modal && projectInput) {
    projectInput.value = projectName;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; 
  }
}

function closeDemoModal() {
  const modal = document.getElementById('demo-modal');
  const form = document.getElementById('demo-form');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    if (form) form.reset();
  }
}

function sendDemoRequest(type) {
  const name = document.getElementById('demo-name').value.trim();
  const email = document.getElementById('demo-email').value.trim();
  const project = document.getElementById('demo-project').value.trim();
  const message = document.getElementById('demo-message').value.trim();

  if (!name || !email || !message) {
    alert("Please fill in all required fields.");
    return;
  }

  const subject = `Demo Request: ${project}`;
  const fullMessage = `Hello Rishi,\n\nI am interested in a demo for ${project}.\n\nDetails:\nName: ${name}\nEmail: ${email}\nMessage: ${message}`;

  if (type === 'whatsapp') {
    const waUrl = `https://wa.me/94770760636?text=${encodeURIComponent(fullMessage)}`;
    window.open(waUrl, '_blank');
  } else if (type === 'email') {
    const mailtoUrl = `mailto:bsrishi2003@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`;
    window.location.href = mailtoUrl;
  } else if (type === 'gmail') {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=bsrishi2003@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`;
    window.open(gmailUrl, '_blank');
  }
  
  closeDemoModal();
}


// Run immediately to set target values before scroll animation triggers
calculateStats();

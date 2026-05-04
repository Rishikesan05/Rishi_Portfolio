/* ══════════════════════════════════════
   DYNAMIC YEAR
══════════════════════════════════════ */
const yearEl = document.getElementById("footer-year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ══════════════════════════════════════
   MOBILE DRAWER — slide-in from right
══════════════════════════════════════ */
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

/* ══════════════════════════════════════
   DARK MODE
══════════════════════════════════════ */
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

/* ══════════════════════════════════════
   PROJECT FILTER
══════════════════════════════════════ */
const filterBtns  = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll(".project-card");
const noResultsEl  = document.getElementById("no-results");

filterBtns.forEach(btn => {
  btn.addEventListener("click", function () {
    filterBtns.forEach(b => b.classList.remove("active"));
    this.classList.add("active");

    const filter = this.dataset.filter;
    let visible = 0;

    projectCards.forEach(card => {
      const show = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("hidden", !show);
      if (show) visible++;
    });

    if (noResultsEl) {
      noResultsEl.style.display = visible === 0 ? "block" : "none";
    }
  });
});

// Trigger default filter on load
const activeFilter = document.querySelector(".filter-btn.active");
if (activeFilter) activeFilter.click();

/* ══════════════════════════════════════
   CONTACT FORM
══════════════════════════════════════ */
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

/* ══════════════════════════════════════
   ACTIVE NAV LINK ON SCROLL
══════════════════════════════════════ */
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

/* ══════════════════════════════════════
   LINKEDIN FEED AUTO-SCROLL
══════════════════════════════════════ */
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

/* Drawer year */
document.querySelectorAll(".drawer-year").forEach(el => el.textContent = new Date().getFullYear());

/* ══════════════════════════════════════
   SCROLL REVEAL — fade-in on scroll
══════════════════════════════════════ */
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

/* ══════════════════════════════════════
   ANIMATED STAT COUNTER
══════════════════════════════════════ */
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

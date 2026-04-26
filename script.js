/*
  TKJ Construction Network JavaScript
  Handles navigation, animations, estimate calculator, FAQ, before/after slider,
  image fallbacks, conversion nudges, and UX polish.
*/

document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const navLinks = document.querySelectorAll(".nav-menu a");
  const year = document.getElementById("year");

  if (year) year.textContent = new Date().getFullYear();

  setupMobileNavigation(navToggle, navMenu, navLinks);
  setupRevealAnimations();
  setupEstimateCalculator();
  setupFaqAccordion();
  setupBeforeAfterSlider();
  setupImageFallbacks();
  setupScrollState();
});

/* ================================
   Mobile Navigation
================================ */

function setupMobileNavigation(navToggle, navMenu, navLinks) {
  if (!navToggle || !navMenu) return;

  const closeMenu = () => {
    navMenu.classList.remove("active");
    navToggle.classList.remove("active");
    navToggle.setAttribute("aria-expanded", "false");
  };

  navToggle.addEventListener("click", (event) => {
    event.stopPropagation();

    const isOpen = navMenu.classList.toggle("active");
    navToggle.classList.toggle("active", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (
      navMenu.classList.contains("active") &&
      !navMenu.contains(event.target) &&
      !navToggle.contains(event.target)
    ) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1080) closeMenu();
  });
}

/* ================================
   Reveal Animations
================================ */

function setupRevealAnimations() {
  const revealItems = document.querySelectorAll(".reveal");

  if (!revealItems.length) return;

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

/* ================================
   Estimate Calculator
================================ */

function setupEstimateCalculator() {
  const form = document.getElementById("estimate-calculator");
  const result = document.getElementById("estimate-result");

  if (!form || !result) return;

  const baseRates = {
    "roof-repair": { base: 450, squareFeet: 0.4, rooms: 0, roofSquares: 85, linearFeet: 3 },
    "roof-replacement": { base: 4500, squareFeet: 0.2, rooms: 0, roofSquares: 430, linearFeet: 0 },
    "interior-remodel": { base: 2500, squareFeet: 26, rooms: 900, roofSquares: 0, linearFeet: 0 },
    "exterior-remodel": { base: 2200, squareFeet: 18, rooms: 0, roofSquares: 0, linearFeet: 22 },
    painting: { base: 850, squareFeet: 2.4, rooms: 325, roofSquares: 0, linearFeet: 0 },
    flooring: { base: 1200, squareFeet: 7.5, rooms: 250, roofSquares: 0, linearFeet: 0 },
    drywall: { base: 900, squareFeet: 3.8, rooms: 350, roofSquares: 0, linearFeet: 0 },
    commercial: { base: 6500, squareFeet: 32, rooms: 600, roofSquares: 250, linearFeet: 18 }
  };

  const qualityMultipliers = {
    economy: 0.9,
    standard: 1,
    premium: 1.28
  };

  const urgencyMultipliers = {
    normal: 1,
    rush: 1.18
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const projectType = getValue("project-type");
    const squareFeet = getNumber("square-feet");
    const rooms = getNumber("rooms");
    const roofSquares = getNumber("roof-squares");
    const linearFeet = getNumber("linear-feet");
    const materialQuality = getValue("material-quality");
    const urgency = getValue("urgency");

    const rate = baseRates[projectType] || baseRates["roof-repair"];

    let estimate =
      rate.base +
      squareFeet * rate.squareFeet +
      rooms * rate.rooms +
      roofSquares * rate.roofSquares +
      linearFeet * rate.linearFeet;

    estimate *= qualityMultipliers[materialQuality] || 1;
    estimate *= urgencyMultipliers[urgency] || 1;

    const low = Math.max(350, Math.round((estimate * 0.82) / 50) * 50);
    const high = Math.max(low + 250, Math.round((estimate * 1.28) / 50) * 50);

    showEstimateResult(result, low, high);

    setTimeout(() => {
      document.querySelector("#contact")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 2200);
  });
}

function showEstimateResult(result, low, high) {
  result.innerHTML = `
    <span>Rough planning range:</span>
    <strong>${formatCurrency(low)} - ${formatCurrency(high)}</strong>
    <small>Get an exact free estimate below.</small>
  `;

  result.classList.add("estimate-ready");

  setTimeout(() => {
    result.classList.remove("estimate-ready");
  }, 1400);
}

function getValue(id) {
  const element = document.getElementById(id);
  return element ? element.value : "";
}

function getNumber(id) {
  const element = document.getElementById(id);
  const value = element ? Number(element.value) : 0;
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

/* ================================
   FAQ Accordion
================================ */

function setupFaqAccordion() {
  const items = document.querySelectorAll(".faq-item");

  if (!items.length) return;

  items.forEach((item) => {
    item.addEventListener("click", () => {
      const panel = item.nextElementSibling;
      const icon = item.querySelector("strong");
      const isOpen = item.getAttribute("aria-expanded") === "true";

      items.forEach((otherItem) => {
        const otherPanel = otherItem.nextElementSibling;
        const otherIcon = otherItem.querySelector("strong");

        otherItem.setAttribute("aria-expanded", "false");

        if (otherPanel) otherPanel.style.maxHeight = "0";
        if (otherIcon) otherIcon.textContent = "+";
      });

      if (!isOpen) {
        item.setAttribute("aria-expanded", "true");

        if (panel) panel.style.maxHeight = `${panel.scrollHeight}px`;
        if (icon) icon.textContent = "−";
      }
    });
  });
}

/* ================================
   Before / After Slider
================================ */

function setupBeforeAfterSlider() {
  const range = document.getElementById("before-after-range");
  const afterWrap = document.getElementById("after-wrap");

  if (!range || !afterWrap) return;

  const updateSlider = () => {
    afterWrap.style.width = `${range.value}%`;
  };

  range.addEventListener("input", updateSlider);
  range.addEventListener("change", updateSlider);

  updateSlider();
}

/* ================================
   Image Fallbacks
================================ */

function setupImageFallbacks() {
  const fallbacks = {
    "assets/hero.jpg": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80",
    "assets/roofing.jpg": "https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=1600&q=80",
    "assets/remodeling.jpg": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    "assets/commercial.jpg": "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1600&q=80",
    "assets/interior.jpg": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80",
    "assets/exterior.jpg": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
    "assets/flooring.jpg": "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=1600&q=80"
  };

  document.querySelectorAll("img").forEach((image) => {
    image.addEventListener(
      "error",
      () => {
        const fallback = fallbacks[image.getAttribute("src")];

        if (fallback) {
          image.src = fallback;
        } else {
          image.style.display = "none";
        }
      },
      { once: true }
    );
  });
}

/* ================================
   Scroll-Based Conversion Polish
================================ */

function setupScrollState() {
  const updateScrollState = () => {
    if (window.scrollY > 700) {
      document.body.classList.add("scrolled");
    } else {
      document.body.classList.remove("scrolled");
    }
  };

  updateScrollState();
  window.addEventListener("scroll", updateScrollState, { passive: true });
}

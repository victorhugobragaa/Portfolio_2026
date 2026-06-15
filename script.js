const navLinks = Array.from(document.querySelectorAll(".navbar a, .mobile-menu-link"));
const mobileMenu = document.querySelector(".mobile-menu");
const mobileMenuToggles = Array.from(document.querySelectorAll(".mobile-menu-toggle"));
const mobileMenuToggle = mobileMenuToggles[0];
const mobileMenuClose = document.querySelector(".mobile-menu-close");
const mobileViewport = window.matchMedia("(max-width: 640px)");
let touchStartX = 0;
let touchStartY = 0;

function lockHorizontalScroll() {
  if (mobileViewport.matches && window.scrollX !== 0) {
    window.scrollTo(0, window.scrollY);
  }
}

function applyMobileWidthLock() {
  if (!mobileViewport.matches) return;

  document.documentElement.style.overflowX = "hidden";
  document.documentElement.style.maxWidth = "100%";
  document.body.style.overflowX = "hidden";
  document.body.style.maxWidth = "100%";

  const shell = document.querySelector(".portfolio-shell");

  if (shell) {
    shell.style.maxWidth = "100%";
    shell.style.overflowX = "hidden";
  }

  if (mobileMenuToggle) {
    mobileMenuToggles.forEach((toggle) => {
      toggle.style.display = "inline-flex";
      toggle.style.opacity = "1";
      toggle.style.visibility = "visible";
      toggle.style.zIndex = "2147483647";
    });
  }

  document.querySelectorAll("body *").forEach((element) => {
    if (
      element === mobileMenu ||
      mobileMenuToggles.includes(element) ||
      mobileMenuToggles.some((toggle) => toggle.contains(element))
    ) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const leaksRight = rect.right > window.innerWidth + 1;
    const leaksLeft = rect.left < -1;

    if (leaksRight || leaksLeft) {
      element.style.maxWidth = "100%";
      element.style.overflowX = "hidden";

      if (getComputedStyle(element).position === "static") {
        element.style.position = "relative";
      }
    }
  });

  lockHorizontalScroll();
}

function lockHorizontalScrollSoon() {
  lockHorizontalScroll();
  requestAnimationFrame(lockHorizontalScroll);
  setTimeout(lockHorizontalScroll, 100);
  setTimeout(lockHorizontalScroll, 300);
}

window.addEventListener(
  "touchstart",
  (event) => {
    if (!mobileViewport.matches || event.touches.length !== 1) return;

    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
  },
  { passive: true }
);

window.addEventListener(
  "touchmove",
  (event) => {
    if (!mobileViewport.matches || event.touches.length !== 1) return;

    const deltaX = event.touches[0].clientX - touchStartX;
    const deltaY = event.touches[0].clientY - touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      event.preventDefault();
      lockHorizontalScroll();
    }
  },
  { passive: false }
);

function closeMobileMenu() {
  if (!mobileMenu || !mobileMenuToggle) return;

  mobileMenu.classList.remove("is-open");
  mobileMenu.setAttribute("aria-hidden", "true");
  mobileMenuToggles.forEach((toggle) => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu");
  });
  document.body.classList.remove("mobile-menu-open");
}

function openMobileMenu() {
  if (!mobileMenu || !mobileMenuToggle) return;

  mobileMenu.classList.add("is-open");
  mobileMenu.setAttribute("aria-hidden", "false");
  mobileMenuToggles.forEach((toggle) => {
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Fechar menu");
  });
  document.body.classList.add("mobile-menu-open");
}

function toggleMobileMenu() {
  if (mobileMenu?.classList.contains("is-open")) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
}

mobileMenuToggles.forEach((toggle) =>
  toggle.addEventListener("click", toggleMobileMenu)
);
mobileMenuClose?.addEventListener("click", closeMobileMenu);

mobileMenu?.addEventListener("click", (event) => {
  if (event.target === mobileMenu) {
    closeMobileMenu();
  }
});

const sectionLinks = navLinks
  .map((link) => {
    const id = link.getAttribute("href");
    const section = id && id.startsWith("#") ? document.querySelector(id) : null;
    return section ? { link, section } : null;
  })
  .filter(Boolean);
const groupedSections = Array.from(document.querySelectorAll("[data-nav-section]"))
  .map((section) => {
    const navId = section.dataset.navSection;
    const link = navLinks.find((navLink) => navLink.getAttribute("href") === `#${navId}`);
    return link ? { link, section } : null;
  })
  .filter(Boolean);
sectionLinks.push(...groupedSections);

function setActiveLink(activeLink) {
  const activeHref = activeLink?.getAttribute("href") || null;

  navLinks.forEach((link) => {
    const isActive = Boolean(activeHref) && link.getAttribute("href") === activeHref;
    const image = link.querySelector("img");

    link.classList.toggle("active", isActive);

    if (image?.dataset.default && image?.dataset.active) {
      image.src = isActive ? image.dataset.active : image.dataset.default;
    }
  });
}

navLinks.forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    const targetId = this.getAttribute("href");
    const targetSection = targetId && document.querySelector(targetId);

    if (targetSection) {
      closeMobileMenu();
      targetSection.scrollIntoView({ behavior: "smooth" });
      setActiveLink(this);
    }
  });
});

function updateActiveOnScroll() {
  const marker = window.innerHeight * 0.32;
  let current = null;

  sectionLinks.forEach(({ link, section }) => {
    const rect = section.getBoundingClientRect();

    if (rect.top <= marker && rect.bottom > marker) {
      current = link;
    }
  });

  setActiveLink(current);
}

window.addEventListener("scroll", updateActiveOnScroll, { passive: true });
window.addEventListener("scroll", lockHorizontalScroll, { passive: true });
window.addEventListener("resize", () => {
  applyMobileWidthLock();
  lockHorizontalScrollSoon();
});
window.addEventListener("load", updateActiveOnScroll);
window.addEventListener("load", () => {
  applyMobileWidthLock();
  lockHorizontalScrollSoon();
});

document.querySelectorAll("img").forEach((image) => {
  image.addEventListener("load", applyMobileWidthLock, { once: true });
});

const cursorGlow = document.querySelector(".cursor-glow");

if (cursorGlow) {
  window.addEventListener("mousemove", (event) => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  });
}

const revealTargets = document.querySelectorAll(
  ".hero-background, .hero-person, .hero-info, .about-photo, .about-content, .projects-heading, .project-card, .photos-heading, .photo-card, .services-section > h2, .service-item"
  + ", .contact-heading, .contact-form, .contact-divider, .contact-card"
);

revealTargets.forEach((target) => target.classList.add("reveal"));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -8% 0px",
  }
);

revealTargets.forEach((target) => revealObserver.observe(target));

const projectLightbox = document.querySelector(".project-lightbox");
const lightboxPanel = document.querySelector(".lightbox-panel");
const lightboxImage = document.querySelector(".lightbox-image");
const lightboxTitle = document.querySelector(".lightbox-title");
const lightboxClose = document.querySelector(".lightbox-close");

function closeProjectLightbox() {
  if (!projectLightbox) return;

  projectLightbox.classList.remove("is-open");
  projectLightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function openProjectLightbox(card, options = {}) {
  if (!projectLightbox || !lightboxImage || !lightboxTitle) return;

  const image = card.querySelector("img");

  if (!image) return;

  lightboxImage.src = card.dataset.zoomSrc || image.src;
  lightboxImage.alt = image.alt;
  lightboxTitle.textContent = card.dataset.projectTitle || image.alt;
  lightboxPanel?.classList.toggle("is-portrait", card.classList.contains("project-card-tall"));
  lightboxPanel?.classList.toggle("is-photo", Boolean(options.photo));
  projectLightbox.classList.add("is-open");
  projectLightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

document.querySelectorAll(".project-card").forEach((card) => {
  const actions = card.querySelectorAll(".project-action");
  const zoomAction = card.querySelector(".project-zoom-action") || actions[1];

  if (zoomAction) {
    zoomAction.addEventListener("click", (event) => {
      if (event.target.closest("a")) return;

      event.stopPropagation();
      openProjectLightbox(card);
    });
  }
});

document.querySelectorAll(".photo-card").forEach((card) => {
  const zoomAction = card.querySelector(".photo-action");

  if (zoomAction) {
    zoomAction.addEventListener("click", (event) => {
      event.stopPropagation();
      openProjectLightbox(card, { photo: true });
    });
  }
});

if (projectLightbox) {
  projectLightbox.addEventListener("click", (event) => {
    if (event.target === projectLightbox) {
      closeProjectLightbox();
    }
  });
}

if (lightboxClose) {
  lightboxClose.addEventListener("click", closeProjectLightbox);
}

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMobileMenu();
    closeProjectLightbox();
  }
});

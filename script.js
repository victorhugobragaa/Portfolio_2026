const navLinks = Array.from(document.querySelectorAll(".navbar a"));
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
  navLinks.forEach((link) => link.classList.toggle("active", link === activeLink));
}

navLinks.forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    const targetId = this.getAttribute("href");
    const targetSection = targetId && document.querySelector(targetId);

    if (targetSection) {
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
window.addEventListener("load", updateActiveOnScroll);

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
    closeProjectLightbox();
  }
});

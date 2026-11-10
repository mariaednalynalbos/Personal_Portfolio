// Intro animation
const introOverlay = document.getElementById("introOverlay");
if (introOverlay) {
  // Remove from DOM after all animations finish (lines finish at ~2.45s)
  setTimeout(() => introOverlay.classList.add("done"), 3000);
}

// Preloader
const preloader = document.getElementById("preloader");
window.addEventListener("load", () => {
  setTimeout(() => preloader?.classList.add("done"), 700);
});

// Year
document.getElementById("year").textContent = new Date().getFullYear();

// Mobile nav
const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");
menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
});
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}));

// Reveal on scroll
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 4, 3) * 80}ms`;
    revealObserver.observe(el);
  });
} else {
  document.querySelectorAll(".reveal").forEach(el => el.classList.add("visible"));
}

// Active nav link
const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll(".nav-link, .mobile-tab")];
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link =>
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`)
      );
    }
  });
}, { rootMargin: "-35% 0px -55% 0px" });
sections.forEach(s => sectionObserver.observe(s));

// Cursor-position profile photo reveal
const heroPhotoFrame = document.getElementById("heroPhotoFrame");
if (heroPhotoFrame) {
  heroPhotoFrame.addEventListener("pointermove", event => {
    const bounds = heroPhotoFrame.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    heroPhotoFrame.style.setProperty("--cursor-x", `${x}%`);
    heroPhotoFrame.style.setProperty("--cursor-y", `${y}%`);
    heroPhotoFrame.classList.add("is-revealing");
  });
  heroPhotoFrame.addEventListener("pointerleave", () => {
    heroPhotoFrame.classList.remove("is-revealing");
  });
}
// Project and certificate detail view
const lightbox = document.getElementById("projectLightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxPrev = document.getElementById("lightboxPrev");
const lightboxNext = document.getElementById("lightboxNext");
const lightboxDots = document.getElementById("lightboxDots");
const lightboxType = document.getElementById("lightboxType");
const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxDescription = document.getElementById("lightboxDescription");
const lightboxTags = document.getElementById("lightboxTags");
const lightboxAction = document.getElementById("lightboxAction");

let lbImages = [], lbIndex = 0;

function lbShow(index) {
  lbIndex = index;
  lightboxImg.style.opacity = 0;
  setTimeout(() => {
    lightboxImg.src = lbImages[lbIndex];
    lightboxImg.style.opacity = 1;
  }, 150);
  lightboxPrev.classList.toggle("hidden", lbImages.length <= 1);
  lightboxNext.classList.toggle("hidden", lbImages.length <= 1);
  [...lightboxDots.children].forEach((dot, i) => dot.classList.toggle("active", i === lbIndex));
}

function lbOpen(images, card) {
  lbImages = images;
  const isCertificate = card.classList.contains("cert-card");
  const artImage = card.querySelector(isCertificate ? ".cert-img-wrap img" : ".project-art img");
  lightboxType.textContent = isCertificate ? "CERTIFICATE" : (card.querySelector(".project-type")?.textContent.trim() || "PROJECT");
  lightboxTitle.textContent = isCertificate ? card.dataset.title : (card.querySelector(".project-content h3")?.textContent.trim() || "Project details");
  lightboxDescription.textContent = isCertificate ? card.dataset.description : (card.querySelector(".project-content p")?.textContent.trim() || "");
  lightboxImg.alt = artImage?.alt || (lightboxTitle.textContent + " image");
  lightboxTags.replaceChildren();
  lightboxAction.replaceChildren();
  if (!isCertificate) {
    const tags = card.querySelector(".chip-row");
    if (tags) [...tags.children].forEach(tag => lightboxTags.append(tag.cloneNode(true)));
    const action = card.querySelector(".project-link");
    if (action) lightboxAction.append(action.cloneNode(true));
  }

  lightboxDots.innerHTML = images.map((_, i) =>
    '<span class="lightbox-dot' + (i === 0 ? ' active' : '') + '" role="button" tabindex="0" aria-label="Show image ' + (i + 1) + '"></span>'
  ).join("");
  [...lightboxDots.children].forEach((dot, i) => {
    dot.addEventListener("click", () => lbShow(i));
    dot.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); lbShow(i); }
    });
  });
  lbShow(0);
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  lightboxClose.focus();
}

function lbClose() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.querySelectorAll(".project-card").forEach(card => {
  card.addEventListener("click", event => {
    if (event.target.closest("a, button")) return;
    const art = card.querySelector(".project-art[data-images]");
    if (!art) return;
    const images = art.dataset.images.split(",").map(src => src.trim());
    lbOpen(images, card);
  });
});

document.querySelectorAll(".cert-card").forEach(card => {
  const openCertificate = () => lbOpen([card.querySelector(".cert-img-wrap img").getAttribute("src")], card);
  card.addEventListener("click", openCertificate);
  card.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openCertificate(); }
  });
});

lightboxClose.addEventListener("click", lbClose);
lightbox.addEventListener("click", event => { if (event.target === lightbox) lbClose(); });
lightboxPrev.addEventListener("click", event => { event.stopPropagation(); lbShow((lbIndex - 1 + lbImages.length) % lbImages.length); });
lightboxNext.addEventListener("click", event => { event.stopPropagation(); lbShow((lbIndex + 1) % lbImages.length); });
document.addEventListener("keydown", event => {
  if (!lightbox.classList.contains("open")) return;
  if (event.key === "Escape") lbClose();
  if (event.key === "ArrowLeft") lbShow((lbIndex - 1 + lbImages.length) % lbImages.length);
  if (event.key === "ArrowRight") lbShow((lbIndex + 1) % lbImages.length);
});
// Prepare contact form message in the visitor's email app
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", event => {
    event.preventDefault();
    const fields = new FormData(contactForm);
    const subject = encodeURIComponent(fields.get("subject") || "Portfolio inquiry");
    const body = encodeURIComponent(`Name: ${fields.get("name")}\nEmail: ${fields.get("email")}\n\n${fields.get("message")}`);
    window.location.href = `mailto:mariaednalynalbos@gmail.com?subject=${subject}&body=${body}`;
  });
}
// Biliran map modal
const mapModal = document.getElementById("mapModal");
const mapOpen = document.getElementById("mapOpen");
const mapClose = document.getElementById("mapClose");

function closeMap() {
  mapModal.classList.remove("open");
  mapModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  mapOpen.focus();
}

mapOpen.addEventListener("click", () => {
  mapModal.classList.add("open");
  mapModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  mapClose.focus();
});
mapClose.addEventListener("click", closeMap);
mapModal.addEventListener("click", event => { if (event.target === mapModal) closeMap(); });
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && mapModal.classList.contains("open")) closeMap();
});
// Particle canvas — blue tones
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let particles = [];
let width = 0, height = 0, raf = 0;

const COLORS = [
  "rgba(59, 130, 246,",
  "rgba(96, 165, 250,",
  "rgba(37, 99, 235,",
  "rgba(14, 165, 233,",
];

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.min(70, Math.floor(width / 16));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.3 + 0.2,
    speed: Math.random() * 0.2 + 0.03,
    alpha: Math.random() * 0.4 + 0.1,
    phase: Math.random() * Math.PI * 2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }));
}

function drawParticles() {
  ctx.clearRect(0, 0, width, height);
  const time = performance.now() * 0.001;
  particles.forEach(p => {
    if (!reduceMotion) p.y -= p.speed;
    if (p.y < -4) { p.y = height + 4; p.x = Math.random() * width; }
    const alpha = p.alpha * (0.6 + 0.4 * Math.sin(time + p.phase));
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `${p.color}${alpha})`;
    ctx.fill();
  });
  if (!reduceMotion) raf = requestAnimationFrame(drawParticles);
}

resizeCanvas();
drawParticles();
window.addEventListener("resize", () => {
  cancelAnimationFrame(raf);
  resizeCanvas();
  drawParticles();
});



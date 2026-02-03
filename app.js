// Año dinámico en el footer
document.getElementById("year").textContent = new Date().getFullYear();

// Smooth scroll con offset de navbar
document.querySelectorAll("[data-scroll], .nav-link, .navbar-brand, .btn[href^='#']").forEach((a) => {
  a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    if (href && href.startsWith("#")) {
      e.preventDefault();
      const el = document.querySelector(href);
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.pageYOffset - 70;
      window.scrollTo({ top: y, behavior: "smooth" });
      // Cerrar menú móvil si está abierto
      const navMain = document.getElementById("navMain");
      const bsCollapse = bootstrap.Collapse.getInstance(navMain);
      if (bsCollapse && navMain.classList.contains("show")) bsCollapse.hide();
    }
  });
});

// IntersectionObserver para animaciones de entrada (reveal)
const revealEls = document.querySelectorAll(".reveal");
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
revealEls.forEach((el) => io.observe(el));

// Mensaje de suscripción (demo sin backend)
const form = document.getElementById("newsletterForm");
const msg = document.getElementById("newsletterMsg");
form?.addEventListener("submit", (e) => {
  e.preventDefault();
  msg.classList.remove("d-none");
  form.reset();
});

// Carrusel (autoplay + hover pause) Bootstrap principal
const heroCarousel = document.getElementById("heroCarousel");
if (heroCarousel) {
  new bootstrap.Carousel(heroCarousel, {
    interval: 4500,
    pause: "hover",
    ride: "carousel",
    touch: true,
    wrap: true,
  });
}

/* ==========================================================
   MINI CARRUSEL NEÓN (tarjetas)
   - Snap + botones + dots + autoplay + drag/swipe
   ==========================================================*/
(function() {
  const root  = document.getElementById("miniCarousel");
  if (!root) return;

  const track = document.getElementById("mcTrack");
  const prev  = document.getElementById("mcPrev");
  const next  = document.getElementById("mcNext");
  const prevM = document.getElementById("mcPrevMob");
  const nextM = document.getElementById("mcNextMob");
  const slides = Array.from(track.querySelectorAll(".mc-slide"));
  const dotsEl = document.getElementById("mcDots");

  // Crear dots
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", `Ir a tarjeta ${i+1}`);
    b.addEventListener("click", () => goTo(i));
    const li = document.createElement("li");
    li.appendChild(b);
    dotsEl.appendChild(li);
  });
  const dots = Array.from(dotsEl.querySelectorAll("button"));

  // Medidas
  function slideSize() {
    const first = slides[0];
    const cs = getComputedStyle(track);
    const gap = parseFloat(cs.columnGap || cs.gap || 0);
    const w = first.getBoundingClientRect().width;
    return Math.round(w + gap);
  }

  // Estado
  let index = 0;
  let timer = null;
  const INTERVAL = 4200;

  function clamp(i) {
    return Math.max(0, Math.min(i, slides.length - 1));
  }

  function updateActiveByScroll() {
    const w = slideSize();
    const i = Math.round(track.scrollLeft / w);
    index = clamp(i);
    dots.forEach((d, k) => d.classList.toggle("is-active", k === index));
  }

  function goTo(i) {
    index = clamp(i);
    const w = slideSize();
    track.scrollTo({ left: index * w, behavior: "smooth" });
    dots.forEach((d, k) => d.classList.toggle("is-active", k === index));
  }
  const goNext = () => goTo(index + 1);
  const goPrev = () => goTo(index - 1);

  // Botones
  [prev, prevM].forEach(btn => btn?.addEventListener("click", goPrev));
  [next, nextM].forEach(btn => btn?.addEventListener("click", goNext));

  // Autoplay con pausa hover/focus
  const start = () => { stop(); timer = setInterval(() => {
    if (index >= slides.length - 1) goTo(0); else goNext();
  }, INTERVAL); };
  const stop  = () => { if (timer) clearInterval(timer); timer = null; };

  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  track.addEventListener("focusin", stop);
  track.addEventListener("focusout", start);

  // Keyboard (cuando el track tiene foco)
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") goNext();
    if (e.key === "ArrowLeft")  goPrev();
  });

  // Sincronizar dots al scroll (por drag/touch/rueda)
  let rafId = null;
  track.addEventListener("scroll", () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(updateActiveByScroll);
  }, { passive: true });

  // Drag con mouse (desktop)
  let isDown = false, startX = 0, startLeft = 0;
  track.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.clientX;
    startLeft = track.scrollLeft;
    track.classList.add("dragging");
    stop();
  });
  window.addEventListener("mouseup", () => {
    if (!isDown) return;
    isDown = false;
    track.classList.remove("dragging");
    // snap a la tarjeta más cercana
    const w = slideSize();
    goTo(Math.round(track.scrollLeft / w));
    start();
  });
  window.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    track.scrollLeft = startLeft - dx;
  });

  // Desplazamiento con rueda (Shift para horizontal “real” en desktop)
  track.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      track.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }, { passive: false });

  // Recalcular en resize
  window.addEventListener("resize", () => {
    // Mantener la tarjeta actual centrada
    const w = slideSize();
    track.scrollLeft = index * w;
  });

  // Init
  updateActiveByScroll();
  start();
})();

// Animaciones de Campo Somático: aparición al hacer scroll, contador, barra de progreso,
// menú activo y un leve parallax en la portada.
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- 1. Marcar qué aparece al hacer scroll ----------
  // [selector, tipo de entrada, ¿escalonar entre hermanos?]
  const groups = [
    [".section .eyebrow", "rv"],
    [".section h2", "rv"],
    [".why .lead, .why .muted, .head > p, .proposal .two > div > p, .join .two > div > p", "rv"],
    [".pillar", "rv rv-right", true],
    [".areas .area", "rv", true],
    [".list li", "rv rv-right", true],
    [".spaces .card", "rv", true],
    [".total", "rv rv-scale"],
    [".week", "rv", true],
    [".always, .note", "rv"],
    [".who h4", "rv"],
    [".who-cols > div > .bul li, .box h3, .box .bul li", "rv rv-left", true],
    [".box", "rv rv-scale"],
    [".pull", "rv"],
    [".form", "rv rv-scale"],
    [".start-pill", "rv rv-left"],
    [".stepper", "rv rv-scale"],
    [".list-label", "rv"],
    [".placa p, .placa .cap", "rv"],
    [".c5", "rv rv-scale", true],
    [".rec p", "rv"],
    [".tile", "rv rv-scale", true],
    [".about .photo", "rv"],
    [".about .lead, .about .muted, .about .sign", "rv"],
  ];

  const targets = [];
  groups.forEach(([selector, classes, stagger]) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (el.closest(".hero")) return;
      el.classList.add(...classes.split(" "));
      if (stagger) {
        const i = Array.from(el.parentElement.children).indexOf(el);
        el.style.setProperty("--d", Math.min(i, 6) * 0.11 + "s");
      }
      targets.push(el);
    });
  });

  const counters = document.querySelectorAll("[data-count]");

  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    targets.forEach((el) => io.observe(el));

    // ---------- 2. Contador "6 encuentros" ----------
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const end = Number(el.dataset.count);
        const start = performance.now();
        const dur = 1400;
        el.textContent = "0";
        const tick = (now) => {
          const t = Math.min((now - start) / dur, 1);
          el.textContent = Math.round(end * (1 - Math.pow(1 - t, 3)));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        countIO.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => countIO.observe(el));
  }

  // ---------- 3. Barra de progreso, menú con sombra y parallax ----------
  const progress = document.querySelector(".progress");
  const nav = document.querySelector(".nav");
  const heroRipples = document.querySelector(".hero .ripples");
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : 0);
    nav.classList.toggle("scrolled", y > 10);
    if (heroRipples && !reduce && y < window.innerHeight * 1.2) {
      heroRipples.style.setProperty("--py", (y * 0.18).toFixed(1) + "px");
    }
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  // ---------- 4. Resaltar en el menú la sección que se está viendo ----------
  const links = new Map();
  document.querySelectorAll('.links a[href^="#"]:not(.btn)').forEach((a) => links.set(a.getAttribute("href").slice(1), a));
  if ("IntersectionObserver" in window && links.size) {
    const navIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = links.get(entry.target.id);
        if (link) link.classList.toggle("active", entry.isIntersecting);
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach((_, id) => {
      const section = document.getElementById(id);
      if (section) navIO.observe(section);
    });
  }
})();

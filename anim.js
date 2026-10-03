// Animaciones de Campo Somático: detalles que aparecen al hacer scroll, contador, barra de progreso,
// menú activo y un leve parallax en la portada.
(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- 1. Detalles que se animan al aparecer ----------
  // El contenido principal (títulos, textos, tarjetas, listas, foto) se ve al instante.
  // Solo se animan detalles: números, píldoras, frases en cursiva, íconos, la línea y la firma.
  // [selector, clases]
  const details = [
    [".pillar .dot", "rv rv-pop"],
    [".area .big", "rv rv-left"],
    [".area .tag", "rv rv-pop"],
    [".area .chip b", "rv rv-pop"],
    [".growth .sat circle", "rv rv-pop"],
    [".list .k", "rv"],
    [".list .f", "rv rv-pop"],
    [".card .tl", "rv"],
    [".card .pause", "rv rv-pop"],
    [".tile svg", "rv rv-pop"],
    [".eq", "rv"],
    [".pull i", "rv rv-draw"],
    [".pull svg", "rv rv-pop"],
    [".about .sign", "rv rv-sign"],
  ];

  // Cada detalle se dispara cuando entra en pantalla el bloque que lo contiene
  // (así funciona también con detalles que arrancan sin tamaño, como la línea).
  const groupsByTrigger = new Map();
  details.forEach(([selector, classes]) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.classList.add(...classes.split(" "));
      const trigger = el.closest(".area, .card, .pillar, .growth, .list li, .tile, .pull, .about") || el.parentElement;
      if (!groupsByTrigger.has(trigger)) groupsByTrigger.set(trigger, []);
      const group = groupsByTrigger.get(trigger);
      el.style.setProperty("--d", (0.12 + Math.min(group.length, 6) * 0.08).toFixed(2) + "s");
      group.push(el);
    });
  });
  const targets = Array.from(groupsByTrigger.values()).flat();

  const counters = document.querySelectorAll("[data-count]");

  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          groupsByTrigger.get(entry.target).forEach((el) => el.classList.add("in"));
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.2 }
    );
    groupsByTrigger.forEach((_, trigger) => io.observe(trigger));

    // ---------- 2. Contador "6 encuentros" ----------
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const end = Number(el.dataset.count);
        const start = performance.now();
        const dur = 1000;
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

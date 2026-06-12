/* ── Include fragments (header / footer) ──────────────── */
const includeFragments = async () => {
  const nodes = Array.from(document.querySelectorAll("[data-include]"));
  await Promise.all(
    nodes.map(async (node) => {
      const res  = await fetch(node.dataset.include);
      const html = await res.text();
      node.innerHTML = html;
      node.querySelectorAll("script").forEach((old) => {
        const s = document.createElement("script");
        s.textContent = old.textContent;
        document.body.appendChild(s);
        old.remove();
      });
    })
  );
};

/* ── Scroll reveal ────────────────────────────────────── */
const setupReveal = () => {
  // Standalone elements
  document.querySelectorAll(".section-heading, .home-cta__inner").forEach((el) => {
    el.classList.add("reveal-on-scroll");
  });

  // Staggered grid children
  const grids = [
    { parent: ".trust-bar__grid",  child: ".trust-bar__item" },
    { parent: ".products__grid",   child: ".product-card"    },
    { parent: ".gallery__grid",    child: ".gallery__item"   },
    { parent: ".why-us__grid",     child: ".why-card"        },
    { parent: ".process__grid",    child: ".process-step"    },
  ];

  grids.forEach(({ parent, child }) => {
    document.querySelectorAll(`${parent} ${child}`).forEach((el, i) => {
      el.classList.add("reveal-on-scroll", "reveal-stagger");
      el.style.setProperty("--i", i);
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(".reveal-on-scroll").forEach((el) => observer.observe(el));
};

/* ── Animated counters ────────────────────────────────── */
const setupCounters = () => {
  const counters = document.querySelectorAll("[data-count-to]");
  if (!counters.length) return;

  const animate = (node) => {
    const target   = Number(node.dataset.countTo);
    const duration = 1400;
    const start    = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      node.textContent = `${Math.round(target * eased)}+`;
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((c) => observer.observe(c));
};

/* ── Hero carousel ────────────────────────────────────── */
const setupHeroCarousel = () => {
  const slides = Array.from(document.querySelectorAll(".hero-carousel__slide"));
  const dots   = Array.from(document.querySelectorAll("[data-hero-dot]"));
  if (!slides.length) return;

  let current = 0;
  let timer;
  const interval = 3500;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const goTo = (index) => {
    slides[current].classList.remove("is-active");
    dots[current]?.classList.remove("is-active");
    current = (index + slides.length) % slides.length;
    slides[current].classList.add("is-active");
    dots[current]?.classList.add("is-active");
  };

  const start = () => {
    if (reduceMotion) return;
    timer = setInterval(() => goTo(current + 1), interval);
  };

  const restart = () => {
    clearInterval(timer);
    start();
  };

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      goTo(Number(dot.dataset.heroDot));
      restart();
    });
  });

  start();
};

/* ── Init ─────────────────────────────────────────────── */
const init = async () => {
  await includeFragments();
  setupHeroCarousel();
  setupReveal();
  setupCounters();
};

init();

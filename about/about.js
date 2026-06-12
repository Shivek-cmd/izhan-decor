/* ── Include fragments ────────────────────────────────── */
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
  document.querySelectorAll(
    ".about-story__media, .about-story__copy, .about-team__copy, .about-team__media, .section-heading, .about-cta__inner"
  ).forEach((el) => el.classList.add("reveal-on-scroll"));

  const grids = [
    { parent: ".about-stats__grid", child: ".about-stat"   },
    { parent: ".values-grid",       child: ".value-card"   },
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
    const isPercent = node.nextElementSibling?.textContent.includes("%");

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const value    = Math.round(target * eased);
      node.textContent = target <= 6 ? `${value}+` : `${value}+`;
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

/* ── Init ─────────────────────────────────────────────── */
const init = async () => {
  await includeFragments();
  setupReveal();
  setupCounters();
};

init();

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
    ".svc-product__media, .svc-product__copy, .section-heading, .svc-cta__inner"
  ).forEach((el) => el.classList.add("reveal-on-scroll"));

  document.querySelectorAll(".svc-gallery__grid .gallery-thumb").forEach((el, i) => {
    el.classList.add("reveal-on-scroll", "reveal-stagger");
    el.style.setProperty("--i", i);
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

/* ── Sticky nav active pill on scroll ────────────────── */
const setupNavHighlight = () => {
  const pills    = Array.from(document.querySelectorAll(".svc-nav__pill"));
  const sections = pills.map((p) => document.querySelector(p.getAttribute("href")));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        pills.forEach((p) => p.classList.remove("is-active"));
        const active = pills.find((p) => p.getAttribute("href") === `#${entry.target.id}`);
        if (active) active.classList.add("is-active");
      });
    },
    { threshold: 0.4, rootMargin: "-100px 0px -50% 0px" }
  );

  sections.forEach((s) => s && observer.observe(s));
};

/* ── Init ─────────────────────────────────────────────── */
const init = async () => {
  await includeFragments();
  setupReveal();
  setupNavHighlight();
};

init();

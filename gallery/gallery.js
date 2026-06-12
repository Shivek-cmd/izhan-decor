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
  document.querySelectorAll(".section-heading, .gallery-cta__inner").forEach((el) => {
    el.classList.add("reveal-on-scroll");
  });

  document.querySelectorAll(".gallery-hero__stats > div").forEach((el, i) => {
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
    { threshold: 0.12 }
  );

  document.querySelectorAll(".reveal-on-scroll").forEach((el) => observer.observe(el));
};

/* ── Filter bar ───────────────────────────────────────── */
const setupFilter = () => {
  const pills = Array.from(document.querySelectorAll("[data-filter]"));
  const items = Array.from(document.querySelectorAll(".gallery-item"));
  if (!pills.length || !items.length) return;

  const applyFilter = (cat) => {
    items.forEach((item, idx) => {
      const match = cat === "all" || item.dataset.cat === cat;
      if (match) {
        item.classList.remove("is-hidden");
        item.style.animationDelay = `${idx * 45}ms`;
      } else {
        item.classList.add("is-hidden");
        item.style.animationDelay = "";
      }
    });
  };

  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      pills.forEach((p) => p.classList.remove("is-active"));
      pill.classList.add("is-active");
      applyFilter(pill.dataset.filter);
    });
  });
};

/* ── Lightbox ─────────────────────────────────────────── */
const setupLightbox = () => {
  const lightbox  = document.getElementById("lightbox");
  const backdrop  = document.getElementById("lightboxBackdrop");
  const closeBtn  = document.getElementById("lightboxClose");
  const prevBtn   = document.getElementById("lightboxPrev");
  const nextBtn   = document.getElementById("lightboxNext");
  const img       = document.getElementById("lightboxImg");
  const caption   = document.getElementById("lightboxCaption");
  const counter   = document.getElementById("lightboxCounter");
  if (!lightbox) return;

  // Build index from items currently visible — updated on open
  let index  = 0;
  let pool   = [];

  const buildPool = () =>
    Array.from(document.querySelectorAll(".gallery-item:not(.is-hidden)"));

  const open = (item) => {
    pool  = buildPool();
    index = pool.indexOf(item);
    render();
    lightbox.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
    img.focus();
  };

  const close = () => {
    lightbox.setAttribute("hidden", "");
    document.body.style.overflow = "";
  };

  const render = () => {
    const item = pool[index];
    if (!item) return;

    const src  = item.dataset.src;
    const lbl  = item.dataset.label || "";
    const tag  = item.dataset.cat   || "";

    img.src = src;
    img.alt = lbl;
    caption.textContent = tag ? `${tag.charAt(0).toUpperCase() + tag.slice(1)} Blinds · ${lbl}` : lbl;
    counter.textContent = `${index + 1} / ${pool.length}`;
  };

  const goTo = (n) => {
    index = (n + pool.length) % pool.length;
    render();
  };

  // Open on click
  document.querySelectorAll(".gallery-item").forEach((item) => {
    item.addEventListener("click", () => open(item));
  });

  // Controls
  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", close);
  prevBtn.addEventListener("click", () => goTo(index - 1));
  nextBtn.addEventListener("click", () => goTo(index + 1));

  // Keyboard
  document.addEventListener("keydown", (e) => {
    if (lightbox.hasAttribute("hidden")) return;
    if (e.key === "Escape")      close();
    if (e.key === "ArrowLeft")   goTo(index - 1);
    if (e.key === "ArrowRight")  goTo(index + 1);
  });

  // Touch / swipe
  let touchStartX = 0;
  lightbox.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) < 40) return;
    goTo(dx < 0 ? index + 1 : index - 1);
  }, { passive: true });
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

/* ── Init ─────────────────────────────────────────────── */
const init = async () => {
  await includeFragments();
  setupReveal();
  setupCounters();
  setupFilter();
  setupLightbox();
};

init();

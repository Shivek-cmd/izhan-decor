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
    ".contact-form-wrap, .contact-info-card, .contact-trust__item"
  ).forEach((el, i) => {
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

/* ── Form validation & submit ─────────────────────────── */
const setupForm = () => {
  const form    = document.getElementById("contactForm");
  const success = document.getElementById("formSuccess");
  if (!form || !success) return;

  const required = form.querySelectorAll("[required]");

  const validate = (field) => {
    const empty  = !field.value.trim();
    const badEmail = field.type === "email" && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);

    if (empty || badEmail) {
      field.classList.add("is-error");
      return false;
    }

    field.classList.remove("is-error");
    return true;
  };

  required.forEach((field) => {
    field.addEventListener("blur",  () => validate(field));
    field.addEventListener("input", () => {
      if (field.classList.contains("is-error")) validate(field);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;
    required.forEach((field) => { if (!validate(field)) valid = false; });
    if (!valid) return;

    /* Build mailto link with form data */
    const data = new FormData(form);
    const subject = encodeURIComponent("Izhaan Decor — Free Quote Request");
    const body = encodeURIComponent(
      `Name: ${data.get("firstName")} ${data.get("lastName")}\n` +
      `Email: ${data.get("email")}\n` +
      `Phone: ${data.get("phone") || "Not provided"}\n` +
      `Product: ${data.get("service") || "Not specified"}\n` +
      `Address: ${data.get("address") || "Not provided"}\n\n` +
      `Message:\n${data.get("message")}`
    );

    window.location.href = `mailto:info@izhaandecor.ca?subject=${subject}&body=${body}`;

    /* Show success state */
    form.hidden = true;
    success.hidden = false;
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  });
};

/* ── Init ─────────────────────────────────────────────── */
const init = async () => {
  await includeFragments();
  setupReveal();
  setupForm();
};

init();

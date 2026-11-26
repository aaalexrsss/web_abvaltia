(() => {
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#main-nav");

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const isOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Abrir menú" : "Cerrar menú");
      nav.classList.toggle("is-open", !isOpen);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Abrir menú");
        nav.classList.remove("is-open");
      });
    });
  }

  const panel = document.querySelector("#assistant-panel");
  const launcher = document.querySelector(".assistant-launcher");
  const closeAssistant = document.querySelector(".assistant-close");
  const chatForm = document.querySelector("#chat-form");
  const chatInput = document.querySelector("#chat-input");
  const chatHistory = document.querySelector("#chat-history");
  const modeLabel = document.querySelector("#assistant-mode");
  let requestPending = false;

  function setAssistantOpen(open) {
    if (!panel || !launcher) return;
    panel.classList.toggle("is-open", open);
    panel.setAttribute("aria-hidden", String(!open));
    launcher.setAttribute("aria-expanded", String(open));
    if (open) window.setTimeout(() => chatInput?.focus(), 120);
    else launcher.focus();
  }

  document.querySelectorAll("[data-open-assistant]").forEach((button) => {
    button.addEventListener("click", () => {
      setAssistantOpen(true);
      menuButton?.setAttribute("aria-expanded", "false");
      menuButton?.setAttribute("aria-label", "Abrir menú");
      nav?.classList.remove("is-open");
    });
  });
  launcher?.addEventListener("click", () => {
    const open = launcher.getAttribute("aria-expanded") === "true";
    setAssistantOpen(!open);
  });
  closeAssistant?.addEventListener("click", () => setAssistantOpen(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && panel?.classList.contains("is-open")) setAssistantOpen(false);
  });

  function addMessage(content, className) {
    const message = document.createElement("div");
    message.className = `chat-message ${className}`;
    message.textContent = content;
    chatHistory?.append(message);
    if (chatHistory) chatHistory.scrollTop = chatHistory.scrollHeight;
    return message;
  }

  async function ask(question) {
    if (!question || requestPending || !chatHistory) return;
    requestPending = true;
    addMessage(question, "user-message");
    const pending = addMessage("Un momento…", "assistant-message is-pending");
    const submitButton = chatForm?.querySelector("button[type='submit']");
    if (submitButton) submitButton.disabled = true;

    try {
      const response = await fetch("/api/asistente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (!response.ok) {
        if (response.status === 429) throw new Error("Has enviado varias preguntas seguidas. Espera un momento e inténtalo de nuevo.");
        throw new Error("No se pudo consultar el asistente.");
      }
      const result = await response.json();
      pending.classList.remove("is-pending");
      pending.textContent = result.answer || "No tengo una respuesta confirmada para esa pregunta.";
      if (modeLabel) {
        modeLabel.textContent = result.mode === "ia"
          ? "IA · solo contenido público"
          : "Modo local · información pública";
      }
      chatHistory.scrollTop = chatHistory.scrollHeight;
    } catch (error) {
      pending.classList.remove("is-pending");
      pending.textContent = error instanceof Error
        ? error.message
        : "No pude responder ahora. Puedes consultar las secciones de esta página o intentarlo de nuevo.";
    } finally {
      requestPending = false;
      if (submitButton) submitButton.disabled = false;
      chatInput?.focus();
    }
  }

  chatForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = chatInput?.value.trim();
    if (!question) return;
    chatInput.value = "";
    ask(question);
  });

  document.querySelectorAll("[data-question]").forEach((button) => {
    button.addEventListener("click", () => ask(button.dataset.question || ""));
  });

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealItems = document.querySelectorAll("[data-reveal]");
  if (!reducedMotion && "IntersectionObserver" in window && revealItems.length) {
    document.body.classList.add("motion-ready");
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const contactForm = document.querySelector("#contact-form");
  const contactStatus = document.querySelector("#contact-status");
  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const recipient = contactForm.dataset.contactEmail?.trim() || "";
    const addressLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient);

    if (!addressLooksValid) {
      if (contactStatus) {
        contactStatus.textContent = "Este sitio todavía no tiene un correo de contacto configurado. Tu mensaje no se ha enviado.";
      }
      return;
    }

    const values = new FormData(contactForm);
    const interest = String(values.get("interest") || "Conocer ABVALTIA");
    const name = String(values.get("name") || "");
    const email = String(values.get("email") || "");
    const message = String(values.get("message") || "");
    const subject = `Solicitud ABVALTIA: ${interest}`;
    const body = [
      `Nombre: ${name}`,
      `Correo para responder: ${email}`,
      `Interés: ${interest}`,
      "",
      message || "Sin comentario adicional.",
    ].join("\n");

    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (contactStatus) contactStatus.textContent = "Se abrió tu aplicación de correo. Revisa el mensaje antes de enviarlo.";
  });
})();

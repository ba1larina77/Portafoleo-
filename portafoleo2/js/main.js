/* =========================================================
   MAIN.JS — Lógica del portafolio.
   No necesitas editar este archivo para actualizar tu
   información; usa js/data.js en su lugar.
   ========================================================= */

(function () {
  "use strict";

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  /* ================= ICONOS SVG (inline, sin dependencias) ================= */
  const ICONS = {
    github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.56-.29-5.25-1.28-5.25-5.72 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.45-2.7 5.42-5.27 5.71.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.67.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.8 0 0 .78 0 1.75v20.5C0 23.22.8 24 1.77 24h20.45C23.2 24 24 23.22 24 22.25V1.75C24 .78 23.2 0 22.22 0Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></svg>',
    twitter: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.6 8.7L23 22h-6.9l-5.4-6.7L4.4 22H1.3l8.2-9.3L1 2h7l4.9 6.1L18.9 2Zm-1.2 18h1.9L7.4 3.9H5.4L17.7 20Z"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1"/></svg>',
  };

  const iconFor = (name) => ICONS[name] || ICONS.link;

  /* ================= 1. BOOT SCREEN ================= */
  function runBootScreen() {
    const bootScreen = $("#boot-screen");
    const bootLog = $("#boot-log");
    if (!bootScreen || !bootLog) return;

    const lines = [
      "[    0.000000] Booting portafolio.img ...",
      "[    0.120044] Iniciando arch-portfolio v1.0",
      "[    0.240012] Cargando módulo: perfil.data ............ [ OK ]",
      "[    0.360098] Cargando módulo: habilidades.pkg ......... [ OK ]",
      "[    0.480033] Cargando módulo: proyectos.dir ........... [ OK ]",
      "[    0.600077] Montando /home/tu-usuario ................ [ OK ]",
      "[    0.720011] Iniciando interfaz gráfica ............... [ OK ]",
      "[    0.840090] Bienvenido.",
    ];

    let i = 0;
    function nextLine() {
      if (i >= lines.length) {
        setTimeout(() => bootScreen.classList.add("hidden"), 300);
        return;
      }
      const p = document.createElement("div");
      p.className = "line";
      const isOk = lines[i].includes("[ OK ]");
      p.innerHTML = isOk
        ? lines[i].replace("[ OK ]", '<span class="ok">[ OK ]</span>')
        : lines[i];
      bootLog.appendChild(p);
      i++;
      setTimeout(nextLine, 90);
    }

    if (sessionStorage.getItem("bootSeen")) {
      bootScreen.classList.add("hidden");
      return;
    }
    sessionStorage.setItem("bootSeen", "1");
    nextLine();
  }

  /* ================= 2. RELLENAR DATOS (data-fill) ================= */
  function fillTextData() {
    const p = PORTFOLIO_DATA.perfil;
    const map = {
      "nombre-completo": p.nombreCompleto,
      "nombre-corto": p.nombreCorto,
      "rol": p.rol,
      "ubicacion": p.ubicacion,
      "anios-experiencia": p.aniosExperiencia,
      "editor": p.editor,
      "stack-corto": p.stackCorto,
      "descripcion-corta": p.descripcionCorta,
      "sobre-mi-parrafo-1": PORTFOLIO_DATA.sobreMi.parrafo1,
      "sobre-mi-parrafo-2": PORTFOLIO_DATA.sobreMi.parrafo2,
      "disponibilidad": p.disponibilidad,
    };
    $$("[data-fill]").forEach((el) => {
      const key = el.getAttribute("data-fill");
      if (map[key] !== undefined) el.textContent = map[key];
    });
    document.title = `~/${p.nombreCorto.toLowerCase().replace(/\s+/g, "-")} — ${p.rol}`;
  }

  /* ================= 3. EFECTO TYPING ================= */
  function startTyping() {
    const el = $("#typed-text");
    if (!el) return;
    const phrases = PORTFOLIO_DATA.perfil.fraseTyping && PORTFOLIO_DATA.perfil.fraseTyping.length
      ? PORTFOLIO_DATA.perfil.fraseTyping
      : ["Ingeniero en Sistemas"];

    let phraseIdx = 0, charIdx = 0, deleting = false;

    function tick() {
      const current = phrases[phraseIdx];
      if (!deleting) {
        charIdx++;
        el.textContent = current.slice(0, charIdx);
        if (charIdx === current.length) {
          deleting = true;
          setTimeout(tick, 1600);
          return;
        }
      } else {
        charIdx--;
        el.textContent = current.slice(0, charIdx);
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
        }
      }
      setTimeout(tick, deleting ? 35 : 65);
    }
    tick();
  }

  /* ================= 4. HERO SOCIALS ================= */
  function renderHeroSocials() {
    const wrap = $("#heroSocials");
    if (!wrap) return;
    wrap.innerHTML = PORTFOLIO_DATA.contacto.redes.map((r) => `
      <a class="social-icon" href="${r.url}" target="_blank" rel="noopener noreferrer" title="${r.nombre}">
        ${iconFor(r.icono)}
      </a>
    `).join("");
  }

  /* ================= 5. EDUCACIÓN / DATOS RÁPIDOS ================= */
  function renderEducation() {
    const list = $("#educationList");
    if (!list) return;
    if (!PORTFOLIO_DATA.educacion.length) {
      list.innerHTML = `<li><span class="timeline-title">Agrega tu educación en js/data.js</span></li>`;
      return;
    }
    list.innerHTML = PORTFOLIO_DATA.educacion.map((e) => `
      <li>
        <p class="timeline-title">${e.titulo}</p>
        <p class="timeline-sub">${e.institucion}</p>
        <p class="timeline-date">${e.fecha}</p>
      </li>
    `).join("");
  }

  function renderQuickFacts() {
    const list = $("#quickFacts");
    if (!list) return;
    list.innerHTML = PORTFOLIO_DATA.datosRapidos.map((f) => `
      <li><span>${f.etiqueta}</span><span>${f.valor}</span></li>
    `).join("");
  }

  /* ================= 6. HABILIDADES ================= */
  function renderSkills() {
    const wrap = $("#skillsGroups");
    if (!wrap) return;
    wrap.innerHTML = PORTFOLIO_DATA.habilidades.map((grupo) => `
      <div class="glass-card skill-group">
        <p class="skill-group-title">${grupo.categoria}</p>
        ${grupo.items.map((it) => `
          <div class="skill-pill">
            <span class="skill-name">${it.nombre}</span>
            <span class="skill-level">${it.nivel}</span>
          </div>
        `).join("")}
      </div>
    `).join("");
  }

  /* ================= 7. PROYECTOS ================= */
  function renderProjects() {
    const grid = $("#projectsGrid");
    if (!grid) return;
    const proyectos = PORTFOLIO_DATA.proyectos;
    if (!proyectos.length) {
      grid.innerHTML = `
        <div class="glass-card placeholder-card">
          <p>// aún no hay proyectos cargados</p>
          <p>Agrega tus proyectos en <code>js/data.js</code> dentro del arreglo <code>proyectos</code>.</p>
        </div>`;
      return;
    }
    grid.innerHTML = proyectos.map((proj) => `
      <article class="glass-card project-card">
        <div class="project-thumb">${proj.icono || "◆"}</div>
        <div class="project-body">
          <h3 class="project-name">${proj.nombre}</h3>
          <p class="project-desc">${proj.descripcion || ""}</p>
          <div class="project-tags">
            ${(proj.tecnologias || []).map((t) => `<span>${t}</span>`).join("")}
          </div>
          <div class="project-links">
            ${proj.repoUrl ? `<a href="${proj.repoUrl}" target="_blank" rel="noopener noreferrer">Código →</a>` : ""}
            ${proj.demoUrl ? `<a href="${proj.demoUrl}" target="_blank" rel="noopener noreferrer">Demo →</a>` : ""}
          </div>
        </div>
      </article>
    `).join("");
  }

  /* ================= 8. EXPERIENCIA ("git log") ================= */
  function renderExperience() {
    const wrap = $("#experienceLog");
    if (!wrap) return;
    const exp = PORTFOLIO_DATA.experiencia;
    if (!exp.length) {
      wrap.innerHTML = `
        <div class="glass-card placeholder-card">
          <p>// aún no hay commits registrados</p>
          <p>Agrega tu experiencia en <code>js/data.js</code> dentro del arreglo <code>experiencia</code>.</p>
        </div>`;
      return;
    }
    wrap.innerHTML = exp.map((e) => `
      <div class="commit-entry">
        <span class="commit-hash">#${e.hash}</span>
        <div>
          <p class="commit-title">${e.puesto} @ ${e.empresa}</p>
          <p class="commit-meta">${e.fecha}</p>
          <p class="commit-desc">${e.descripcion}</p>
        </div>
      </div>
    `).join("");
  }

  /* ================= 9. CONTACTO ================= */
  function renderContactLinks() {
    const list = $("#contactLinks");
    if (!list) return;
    const c = PORTFOLIO_DATA.contacto;
    const items = [...c.redes];
    list.innerHTML = items.map((r) => `
      <li><a href="${r.url}" target="_blank" rel="noopener noreferrer">${iconFor(r.icono)} ${r.nombre}</a></li>
    `).join("");
  }

  function setupContactForm() {
    const form = $("#contactForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const note = $(".form-note", form);
      const original = note.textContent;
      note.textContent = "Formulario de ejemplo: conecta un servicio como Formspree o EmailJS para enviar mensajes reales (ver README.md).";
      note.style.color = "var(--accent-2)";
      setTimeout(() => { note.textContent = original; note.style.color = ""; }, 4000);
    });
  }

  /* ================= 10. NAV: scroll-spy + menú móvil ================= */
  function setupNav() {
    const links = $$(".nav-link");
    const sections = links
      .map((l) => document.getElementById(l.dataset.section))
      .filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.remove("active"));
          const active = links.find((l) => l.dataset.section === entry.target.id);
          if (active) active.classList.add("active");
        }
      });
    }, { rootMargin: "-40% 0px -50% 0px", threshold: 0 });

    sections.forEach((s) => observer.observe(s));

    const hamburger = $("#hamburger");
    const navLinks = $("#navLinks");
    if (hamburger && navLinks) {
      hamburger.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("open");
        hamburger.setAttribute("aria-expanded", String(isOpen));
      });
      links.forEach((l) => l.addEventListener("click", () => {
        navLinks.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      }));
    }
  }

  /* ================= 11. ACENTO DE COLOR ================= */
  function setupAccentPicker() {
    const dots = $$(".accent-dot");
    const root = document.documentElement;
    const saved = localStorage.getItem("accent") || "arch";
    root.setAttribute("data-accent", saved);
    markActive(saved);

    function markActive(name) {
      dots.forEach((d) => d.classList.toggle("active", d.dataset.accent === name));
    }

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const name = dot.dataset.accent;
        root.setAttribute("data-accent", name);
        localStorage.setItem("accent", name);
        markActive(name);
      });
    });
  }

  /* ================= 12. FADE-IN AL HACER SCROLL ================= */
  function setupScrollReveal() {
    const items = $$(".fade-in");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach((it) => observer.observe(it));
  }

  /* ================= 13. BACK TO TOP ================= */
  function setupBackToTop() {
    const btn = $("#backToTop");
    if (!btn) return;
    window.addEventListener("scroll", () => {
      btn.classList.toggle("visible", window.scrollY > 500);
    });
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ================= 14. TERMINAL INTERACTIVA ================= */
  function setupInteractiveTerminal() {
    const output = $("#interactiveOutput");
    const input = $("#terminalInput");
    if (!output || !input) return;

    const p = PORTFOLIO_DATA.perfil;

    function print(html) {
      const line = document.createElement("p");
      line.className = "term-line";
      line.innerHTML = html;
      output.appendChild(line);
      output.scrollTop = output.scrollHeight;
    }

    const commands = {
      help: () => `Comandos disponibles: <span class="highlight">about</span>, <span class="highlight">skills</span>,
        <span class="highlight">projects</span>, <span class="highlight">contact</span>,
        <span class="highlight">whoami</span>, <span class="highlight">neofetch</span>,
        <span class="highlight">clear</span>`,
      about: () => PORTFOLIO_DATA.sobreMi.parrafo1,
      whoami: () => `${p.nombreCompleto} — ${p.rol}`,
      skills: () => PORTFOLIO_DATA.habilidades
        .map((g) => `<strong>${g.categoria}</strong>: ${g.items.map((i) => i.nombre).join(", ")}`)
        .join("<br>"),
      projects: () => PORTFOLIO_DATA.proyectos.length
        ? PORTFOLIO_DATA.proyectos.map((pr) => pr.nombre).join(", ")
        : "Aún no hay proyectos cargados. Edita js/data.js.",
      contact: () => `Email: ${PORTFOLIO_DATA.contacto.email}`,
      neofetch: () => `${p.nombreCompleto} @ arch-portfolio<br>OS: Arch Linux<br>Rol: ${p.rol}<br>Stack: ${p.stackCorto}`,
      clear: () => { output.innerHTML = ""; return null; },
      sudo: () => "Permiso denegado: este usuario no está en el archivo sudoers ;)",
    };

    input.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const raw = input.value.trim();
      if (!raw) return;
      print(`<span class="prompt-symbol">$</span> ${raw}`);
      const cmd = raw.toLowerCase().split(" ")[0];
      if (commands[cmd]) {
        const result = commands[cmd]();
        if (result) print(result);
      } else {
        print(`bash: ${cmd}: comando no encontrado. Escribe <span class="highlight">help</span>.`);
      }
      input.value = "";
    });
  }

  /* ================= 15. FOOTER YEAR ================= */
  function setFooterYear() {
    const y = $("#year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ================= INIT ================= */
  document.addEventListener("DOMContentLoaded", () => {
    runBootScreen();
    fillTextData();
    startTyping();
    renderHeroSocials();
    renderEducation();
    renderQuickFacts();
    renderSkills();
    renderProjects();
    renderExperience();
    renderContactLinks();
    setupContactForm();
    setupNav();
    setupAccentPicker();
    setupScrollReveal();
    setupBackToTop();
    setupInteractiveTerminal();
    setFooterYear();
  });
})();

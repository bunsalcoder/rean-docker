/* Chapter & lab markdown reader */
const CHAPTERS = [
  { id: "how-to-use", title: "How to use this guide", match: /^## How to use this guide$/m },
  { id: "1", title: "What problem does Docker solve?", match: /^## 1\. /m },
  { id: "2", title: "Core mental model", match: /^## 2\. /m },
  { id: "3", title: "Install & verify", match: /^## 3\. /m },
  { id: "4", title: "Your first containers", match: /^## 4\. /m },
  { id: "5", title: "Images deeply explained", match: /^## 5\. /m },
  { id: "6", title: "Dockerfile — build your own images", match: /^## 6\. /m },
  { id: "7", title: "Volumes — keep data alive", match: /^## 7\. /m },
  { id: "8", title: "Networks — how containers talk", match: /^## 8\. /m },
  { id: "9", title: "Environment, secrets, and config", match: /^## 9\. /m },
  { id: "10", title: "Docker Compose — multi-container apps", match: /^## 10\. /m },
  { id: "11", title: "Multi-stage builds & image size", match: /^## 11\. /m },
  { id: "12", title: "Production-minded practices", match: /^## 12\. /m },
  { id: "13", title: "Debugging & troubleshooting", match: /^## 13\. /m },
  { id: "14", title: "Security essentials", match: /^## 14\. /m },
  { id: "15", title: "Advanced topics", match: /^## 15\. /m },
  { id: "16", title: "Capstone project", match: /^## 16\. /m },
  { id: "17", title: "Cheat sheet", match: /^## 17\. /m },
  { id: "18", title: "Learning path checklist", match: /^## 18\. /m },
];

const LABS = [
  { id: "01-hello", title: "Hello containers", level: "Beginner" },
  { id: "02-dockerfile", title: "Your first Dockerfile", level: "Beginner" },
  { id: "03-compose", title: "Compose stack", level: "Intermediate" },
  { id: "04-networks", title: "Networks & DNS", level: "Intermediate" },
  { id: "05-volumes", title: "Volumes & persistence", level: "Intermediate" },
  { id: "06-multi-stage", title: "Multi-stage builds", level: "Advanced" },
  { id: "07-production", title: "Production practices", level: "Advanced" },
];

function getParam(name) {
  return new URLSearchParams(location.search).get(name);
}

function getRouteId(queryKey) {
  const hash = location.hash.replace(/^#/, "").trim();
  if (hash) return decodeURIComponent(hash);
  return getParam(queryKey);
}

function chapterHref(id) {
  return `./learn.html?c=${encodeURIComponent(id)}`;
}

function labHref(id) {
  return `./lab.html?id=${encodeURIComponent(id)}`;
}

function splitGuide(markdown) {
  const lines = markdown.split("\n");
  const starts = [];

  lines.forEach((line, index) => {
    CHAPTERS.forEach((ch, ci) => {
      if (ch.match.test(line)) {
        starts.push({ ci, index, title: ch.title, id: ch.id });
      }
    });
  });

  starts.sort((a, b) => a.index - b.index);

  return starts.map((s, i) => {
    let end = i + 1 < starts.length ? starts[i + 1].index : lines.length;
    // Keep intro short: stop before the markdown TOC block
    if (CHAPTERS[s.ci].id === "how-to-use") {
      const tocAt = lines.findIndex(
        (line, idx) => idx > s.index && /^## Table of contents$/m.test(line)
      );
      if (tocAt !== -1) end = tocAt;
    }
    let body = lines.slice(s.index, end).join("\n").trim();
    // Avoid duplicate title (page already shows H1)
    body = body.replace(/^##\s.+\n+/, "");
    return { ...CHAPTERS[s.ci], body };
  });
}

function enhanceCodeBlocks(root) {
  root.querySelectorAll("pre").forEach((pre) => {
    if (pre.closest(".code-block")) return;

    const wrap = document.createElement("div");
    wrap.className = "code-block";
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn";
    btn.textContent = "Copy";
    btn.addEventListener("click", async () => {
      const text = pre.querySelector("code")?.textContent || pre.textContent;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "Copied";
        setTimeout(() => {
          btn.textContent = "Copy";
        }, 1400);
      } catch {
        btn.textContent = "Failed";
      }
    });
    wrap.appendChild(btn);
  });
}

async function loadText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${url}`);
  return res.text();
}

function renderMarkdown(target, md) {
  // Prefer marked if present; fallback to basic preformatted text
  if (window.marked) {
    marked.setOptions({
      gfm: true,
      breaks: false,
    });
    target.innerHTML = marked.parse(md);
  } else {
    target.innerHTML = `<pre>${md.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]))}</pre>`;
  }
  enhanceCodeBlocks(target);
}

function setupSidebarToggle() {
  const sidebar = document.querySelector("[data-sidebar]");
  const toggle = document.querySelector("[data-side-toggle]");
  const backdrop = document.querySelector("[data-backdrop]");
  if (!sidebar || !toggle) return;

  const close = () => {
    sidebar.classList.remove("is-open");
    backdrop?.classList.remove("is-on");
    toggle.setAttribute("aria-expanded", "false");
  };

  const open = () => {
    sidebar.classList.add("is-open");
    backdrop?.classList.add("is-on");
    toggle.setAttribute("aria-expanded", "true");
  };

  toggle.addEventListener("click", () => {
    if (sidebar.classList.contains("is-open")) close();
    else open();
  });
  backdrop?.addEventListener("click", close);
  sidebar.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
}

async function initLearnPage() {
  const navEl = document.querySelector("[data-chapter-nav]");
  const bodyEl = document.querySelector("[data-chapter-body]");
  const titleEl = document.querySelector("[data-chapter-title]");
  const progressEl = document.querySelector("[data-progress]");
  const pagerEl = document.querySelector("[data-pager]");
  if (!navEl || !bodyEl) return;

  setupSidebarToggle();

  try {
    const raw = await loadText("./content/guide.md");
    // Strip TOC-only section noise at top but keep intro via how-to-use
    const chapters = splitGuide(raw);
    if (!chapters.length) throw new Error("No chapters found");

    let currentId = getRouteId("c") || chapters[0].id;
    let index = chapters.findIndex((c) => c.id === currentId);
    if (index < 0) index = 0;
    currentId = chapters[index].id;

    navEl.innerHTML = chapters
      .map((c, i) => {
        const n = String(i + 1).padStart(2, "0");
        const active = c.id === currentId ? "is-active" : "";
        return `<li><a href="${chapterHref(c.id)}" class="${active}"><small style="display:block;opacity:.55;font-size:.72rem;font-weight:700;letter-spacing:.06em">${n}</small>${c.title}</a></li>`;
      })
      .join("");

    const chapter = chapters[index];
    if (titleEl) titleEl.textContent = chapter.title;
    if (progressEl) progressEl.textContent = `Chapter ${index + 1} of ${chapters.length}`;
    renderMarkdown(bodyEl, chapter.body);

    if (pagerEl) {
      const prev = chapters[index - 1];
      const next = chapters[index + 1];
      pagerEl.innerHTML = `
        ${prev ? `<a class="pager-prev" href="${chapterHref(prev.id)}"><span>Previous</span>${prev.title}</a>` : ""}
        ${next ? `<a class="pager-next" href="${chapterHref(next.id)}"><span>Next</span>${next.title}</a>` : ""}
      `;
    }

    // Smooth content entrance
    bodyEl.style.animation = "rise 0.55s cubic-bezier(0.22, 1, 0.36, 1)";
  } catch (err) {
    bodyEl.innerHTML = `<div class="error"><strong>Could not load lessons.</strong><br>${err.message}<br><br>Serve the <code>web/</code> folder over HTTP (for example <code>npx serve web</code>), then open the site from that URL.</div>`;
  }
}

async function initLabPage() {
  const navEl = document.querySelector("[data-lab-nav]");
  const bodyEl = document.querySelector("[data-lab-body]");
  const titleEl = document.querySelector("[data-lab-title]");
  const progressEl = document.querySelector("[data-progress]");
  const pagerEl = document.querySelector("[data-pager]");
  if (!navEl || !bodyEl) return;

  setupSidebarToggle();

  const currentId = getRouteId("id") || LABS[0].id;
  let index = LABS.findIndex((l) => l.id === currentId);
  if (index < 0) index = 0;
  const lab = LABS[index];

  navEl.innerHTML = LABS.map(
    (l) =>
      `<li><a href="${labHref(l.id)}" class="${l.id === lab.id ? "is-active" : ""}">${l.title}<br><span style="opacity:.6;font-weight:500;font-size:.8rem">${l.level}</span></a></li>`
  ).join("");

  if (titleEl) titleEl.textContent = lab.title;
  if (progressEl) progressEl.textContent = `Lab ${index + 1} of ${LABS.length} · ${lab.level}`;

  try {
    const md = await loadText(`./content/labs/${lab.id}.md`);
    renderMarkdown(bodyEl, md);
    const h1 = bodyEl.querySelector("h1");
    if (h1) h1.remove();
    bodyEl.style.animation = "rise 0.55s cubic-bezier(0.22, 1, 0.36, 1)";
  } catch (err) {
    bodyEl.innerHTML = `<div class="error"><strong>Could not load lab.</strong><br>${err.message}<br><br>Serve the <code>web/</code> folder over HTTP.</div>`;
  }

  if (pagerEl) {
    const prev = LABS[index - 1];
    const next = LABS[index + 1];
    pagerEl.innerHTML = `
      ${prev ? `<a class="pager-prev" href="${labHref(prev.id)}"><span>Previous lab</span>${prev.title}</a>` : ""}
      ${next ? `<a class="pager-next" href="${labHref(next.id)}"><span>Next lab</span>${next.title}</a>` : ""}
    `;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page === "learn") initLearnPage();
  if (document.body.dataset.page === "lab") initLabPage();
});

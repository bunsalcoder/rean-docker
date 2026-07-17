/* Chapter & lab markdown reader */
const CHAPTERS = [
  { id: "how-to-use", title: "How to use this guide", match: /^## How to use this guide$/m },
  { id: "1", title: "What problem does Docker solve?", match: /^## 1\. /m },
  { id: "2", title: "Containerization foundations", match: /^## 2\. /m },
  { id: "3", title: "Core mental model", match: /^## 3\. /m },
  { id: "4", title: "Install & verify", match: /^## 4\. /m },
  { id: "5", title: "Your first containers", match: /^## 5\. /m },
  { id: "6", title: "Images deeply explained", match: /^## 6\. /m },
  { id: "7", title: "Dockerfile — build your own images", match: /^## 7\. /m },
  { id: "8", title: "Volumes — keep data alive", match: /^## 8\. /m },
  { id: "9", title: "Networks — how containers talk", match: /^## 9\. /m },
  { id: "10", title: "Environment, secrets, and config", match: /^## 10\. /m },
  { id: "11", title: "Docker Compose — multi-container apps", match: /^## 11\. /m },
  { id: "12", title: "Multi-stage builds & image size", match: /^## 12\. /m },
  { id: "13", title: "Production-minded practices", match: /^## 13\. /m },
  { id: "14", title: "Debugging & troubleshooting", match: /^## 14\. /m },
  { id: "15", title: "Security essentials", match: /^## 15\. /m },
  { id: "16", title: "Advanced topics", match: /^## 16\. /m },
  { id: "17", title: "Capstone project", match: /^## 17\. /m },
  { id: "18", title: "Cheat sheet", match: /^## 18\. /m },
  { id: "19", title: "Learning path checklist", match: /^## 19\. /m },
];

const LABS = [
  { id: "01-isolation-basics", title: "Isolation basics", level: "Beginner" },
  { id: "02-hello", title: "Hello containers", level: "Beginner" },
  { id: "03-dockerfile", title: "Your first Dockerfile", level: "Beginner" },
  { id: "04-compose", title: "Compose stack", level: "Intermediate" },
  { id: "05-networks", title: "Networks & DNS", level: "Intermediate" },
  { id: "06-volumes", title: "Volumes & persistence", level: "Intermediate" },
  { id: "07-multi-stage", title: "Multi-stage builds", level: "Advanced" },
  { id: "08-production", title: "Production practices", level: "Advanced" },
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

function checklistStorageKey(scope) {
  return `rean-docker:checklist:${scope}`;
}

function checklistItemKey(li, index) {
  const text = (li?.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
  return text || `item-${index}`;
}

function enhanceChecklists(root, scope) {
  const boxes = root.querySelectorAll('li > input[type="checkbox"]');
  if (!boxes.length) return;

  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(checklistStorageKey(scope)) || "{}");
  } catch {
    saved = {};
  }

  boxes.forEach((input, index) => {
    const li = input.closest("li");
    if (!li) return;

    li.classList.add("task-item");
    input.disabled = false;
    input.removeAttribute("disabled");

    if (!li.querySelector(".task-label")) {
      const label = document.createElement("label");
      label.className = "task-label";
      const text = document.createElement("span");
      text.className = "task-text";
      while (input.nextSibling) {
        text.appendChild(input.nextSibling);
      }
      label.appendChild(input);
      label.appendChild(text);
      li.appendChild(label);
    }

    const key = checklistItemKey(li, index);
    if (Object.prototype.hasOwnProperty.call(saved, key)) {
      input.checked = Boolean(saved[key]);
    }
    li.classList.toggle("is-done", input.checked);

    input.addEventListener("change", () => {
      saved[key] = input.checked;
      li.classList.toggle("is-done", input.checked);
      try {
        localStorage.setItem(checklistStorageKey(scope), JSON.stringify(saved));
      } catch {
        /* ignore quota / private mode */
      }
    });
  });
}

function renderMarkdown(target, md, { checklistScope } = {}) {
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
  if (checklistScope) enhanceChecklists(target, checklistScope);
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
  // Delegate so links added after init still close the drawer
  sidebar.addEventListener("click", (event) => {
    if (event.target.closest("a")) close();
  });
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

    let currentIndex = -1;
    let transitionToken = 0;
    const paneEl = bodyEl.closest(".content-pane");
    const CHAPTER_OUT_MS = 280;
    const prefersReducedMotion = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resolveIndex = (id) => {
      let index = chapters.findIndex((c) => c.id === id);
      if (index < 0) index = 0;
      return index;
    };

    const setActiveNav = (id) => {
      navEl.querySelectorAll("a[data-chapter-id]").forEach((a) => {
        a.classList.toggle("is-active", a.dataset.chapterId === id);
      });
    };

    const renderPager = (index) => {
      if (!pagerEl) return;
      const prev = chapters[index - 1];
      const next = chapters[index + 1];
      pagerEl.innerHTML = `
        ${prev ? `<a class="pager-prev" href="${chapterHref(prev.id)}" data-chapter-id="${prev.id}"><span>Previous</span>${prev.title}</a>` : ""}
        ${next ? `<a class="pager-next" href="${chapterHref(next.id)}" data-chapter-id="${next.id}"><span>Next</span>${next.title}</a>` : ""}
      `;
    };

    const clearChapterMotion = () => {
      bodyEl.classList.remove("is-leaving", "is-switching");
      paneEl?.classList.remove("is-chapter-leaving", "is-chapter-switching");
    };

    const playChapterIn = () => {
      clearChapterMotion();
      void bodyEl.offsetWidth;
      bodyEl.classList.add("is-switching");
      paneEl?.classList.add("is-chapter-switching");
    };

    const applyChapter = (chapter, index) => {
      setActiveNav(chapter.id);
      if (titleEl) titleEl.textContent = chapter.title;
      if (progressEl) progressEl.textContent = `Chapter ${index + 1} of ${chapters.length}`;
      document.title = `${chapter.title} — rean-docker`;
      renderMarkdown(bodyEl, chapter.body, { checklistScope: `learn:${chapter.id}` });
      renderPager(index);
    };

    const showChapter = async (id, { push = false, animate = true } = {}) => {
      const index = resolveIndex(id);
      const chapter = chapters[index];

      // Same chapter click: keep URL in sync, skip re-render flicker
      if (index === currentIndex) {
        if (push) history.replaceState({ c: chapter.id }, "", chapterHref(chapter.id));
        return;
      }

      const token = ++transitionToken;
      const hadChapter = currentIndex >= 0;
      currentIndex = index;

      if (push) {
        history.pushState({ c: chapter.id }, "", chapterHref(chapter.id));
      }

      window.scrollTo({ top: 0, behavior: "smooth" });

      const shouldAnimate = animate && !prefersReducedMotion();

      if (shouldAnimate && hadChapter) {
        clearChapterMotion();
        bodyEl.classList.add("is-leaving");
        paneEl?.classList.add("is-chapter-leaving");
        await new Promise((resolve) => setTimeout(resolve, CHAPTER_OUT_MS));
        if (token !== transitionToken) return;
      }

      applyChapter(chapter, index);

      if (shouldAnimate) {
        playChapterIn();
      } else {
        clearChapterMotion();
      }
    };

    navEl.innerHTML = chapters
      .map((c, i) => {
        const n = String(i + 1).padStart(2, "0");
        return `<li><a href="${chapterHref(c.id)}" data-chapter-id="${c.id}"><small style="display:block;opacity:.55;font-size:.72rem;font-weight:700;letter-spacing:.06em">${n}</small>${c.title}</a></li>`;
      })
      .join("");

    const goToChapter = (id, opts) => {
      if (!id) return;
      showChapter(id, opts);
    };

    navEl.addEventListener("click", (event) => {
      const link = event.target.closest("a[data-chapter-id]");
      if (!link) return;
      event.preventDefault();
      goToChapter(link.dataset.chapterId, { push: true, animate: true });
    });

    pagerEl?.addEventListener("click", (event) => {
      const link = event.target.closest("a[data-chapter-id]");
      if (!link) return;
      event.preventDefault();
      goToChapter(link.dataset.chapterId, { push: true, animate: true });
    });

    window.addEventListener("popstate", () => {
      goToChapter(getRouteId("c") || chapters[0].id, { push: false, animate: true });
    });

    const initialId = getRouteId("c") || chapters[0].id;
    showChapter(initialId, { push: false, animate: true });
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

  let currentIndex = -1;
  let transitionToken = 0;
  const paneEl = bodyEl.closest(".content-pane");
  const cache = new Map();
  const LAB_OUT_MS = 280;
  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const resolveIndex = (id) => {
    let index = LABS.findIndex((l) => l.id === id);
    if (index < 0) index = 0;
    return index;
  };

  const setActiveNav = (id) => {
    navEl.querySelectorAll("a[data-lab-id]").forEach((a) => {
      a.classList.toggle("is-active", a.dataset.labId === id);
    });
  };

  const renderPager = (index) => {
    if (!pagerEl) return;
    const prev = LABS[index - 1];
    const next = LABS[index + 1];
    pagerEl.innerHTML = `
      ${prev ? `<a class="pager-prev" href="${labHref(prev.id)}" data-lab-id="${prev.id}"><span>Previous lab</span>${prev.title}</a>` : ""}
      ${next ? `<a class="pager-next" href="${labHref(next.id)}" data-lab-id="${next.id}"><span>Next lab</span>${next.title}</a>` : ""}
    `;
  };

  const clearLabMotion = () => {
    bodyEl.classList.remove("is-leaving", "is-switching");
    bodyEl.style.animation = "";
    paneEl?.classList.remove("is-chapter-leaving", "is-chapter-switching");
  };

  const playLabIn = () => {
    clearLabMotion();
    void bodyEl.offsetWidth;
    bodyEl.classList.add("is-switching");
    paneEl?.classList.add("is-chapter-switching");
  };

  const loadLabMarkdown = async (id) => {
    if (cache.has(id)) return cache.get(id);
    const md = await loadText(`./content/labs/${id}.md`);
    cache.set(id, md);
    return md;
  };

  const applyLab = async (lab, index) => {
    setActiveNav(lab.id);
    if (titleEl) titleEl.textContent = lab.title;
    if (progressEl) progressEl.textContent = `Lab ${index + 1} of ${LABS.length} · ${lab.level}`;
    document.title = `${lab.title} — rean-docker`;
    renderPager(index);

    try {
      const md = await loadLabMarkdown(lab.id);
      renderMarkdown(bodyEl, md, { checklistScope: `lab:${lab.id}` });
      bodyEl.querySelector("h1")?.remove();
    } catch (err) {
      bodyEl.innerHTML = `<div class="error"><strong>Could not load lab.</strong><br>${err.message}<br><br>Serve the <code>web/</code> folder over HTTP.</div>`;
    }
  };

  const showLab = async (id, { push = false, animate = true } = {}) => {
    const index = resolveIndex(id);
    const lab = LABS[index];

    if (index === currentIndex) {
      if (push) history.replaceState({ id: lab.id }, "", labHref(lab.id));
      return;
    }

    const token = ++transitionToken;
    const hadLab = currentIndex >= 0;
    currentIndex = index;

    if (push) {
      history.pushState({ id: lab.id }, "", labHref(lab.id));
    }

    window.scrollTo({ top: 0, behavior: "smooth" });

    const shouldAnimate = animate && !prefersReducedMotion();

    if (shouldAnimate && hadLab) {
      clearLabMotion();
      bodyEl.classList.add("is-leaving");
      paneEl?.classList.add("is-chapter-leaving");
      await new Promise((resolve) => setTimeout(resolve, LAB_OUT_MS));
      if (token !== transitionToken) return;
    }

    await applyLab(lab, index);
    if (token !== transitionToken) return;

    if (shouldAnimate) {
      playLabIn();
    } else {
      clearLabMotion();
    }
  };

  navEl.innerHTML = LABS.map(
    (l) =>
      `<li><a href="${labHref(l.id)}" data-lab-id="${l.id}">${l.title}<br><span style="opacity:.6;font-weight:500;font-size:.8rem">${l.level}</span></a></li>`
  ).join("");

  const goToLab = (id, opts) => {
    if (!id) return;
    showLab(id, opts);
  };

  navEl.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-lab-id]");
    if (!link) return;
    event.preventDefault();
    goToLab(link.dataset.labId, { push: true, animate: true });
  });

  pagerEl?.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-lab-id]");
    if (!link) return;
    event.preventDefault();
    goToLab(link.dataset.labId, { push: true, animate: true });
  });

  window.addEventListener("popstate", () => {
    goToLab(getRouteId("id") || LABS[0].id, { push: false, animate: true });
  });

  goToLab(getRouteId("id") || LABS[0].id, { push: false, animate: true });
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page === "learn") initLearnPage();
  if (document.body.dataset.page === "lab") initLabPage();
});

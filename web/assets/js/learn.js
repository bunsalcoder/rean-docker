/* Chapter & lab markdown reader */
const t = (key, vars) => (window.ReanI18n ? window.ReanI18n.t(key, vars) : key);
const contentPath = (path) =>
  window.ReanI18n ? window.ReanI18n.contentPath(path) : `./content/en/${path}`;

const CHAPTERS = [
  {
    id: "how-to-use",
    match: /^## (How to use this guide|របៀបប្រើមគ្គុទ្ទេសក៍នេះ)$/m,
  },
  { id: "1", match: /^## 1\. /m },
  { id: "2", match: /^## 2\. /m },
  { id: "3", match: /^## 3\. /m },
  { id: "4", match: /^## 4\. /m },
  { id: "5", match: /^## 5\. /m },
  { id: "6", match: /^## 6\. /m },
  { id: "7", match: /^## 7\. /m },
  { id: "8", match: /^## 8\. /m },
  { id: "9", match: /^## 9\. /m },
  { id: "10", match: /^## 10\. /m },
  { id: "11", match: /^## 11\. /m },
  { id: "12", match: /^## 12\. /m },
  { id: "13", match: /^## 13\. /m },
  { id: "14", match: /^## 14\. /m },
  { id: "15", match: /^## 15\. /m },
  { id: "16", match: /^## 16\. /m },
  { id: "17", match: /^## 17\. /m },
  { id: "18", match: /^## 18\. /m },
  { id: "19", match: /^## 19\. /m },
  { id: "20", match: /^## 20\. /m },
];

const LAB_DEFS = [
  { id: "01-isolation-basics", levelKey: "lab.level.beginner" },
  { id: "02-hello", levelKey: "lab.level.beginner" },
  { id: "03-dockerfile", levelKey: "lab.level.beginner" },
  { id: "04-env-secrets", levelKey: "lab.level.intermediate" },
  { id: "05-compose", levelKey: "lab.level.intermediate" },
  { id: "06-networks", levelKey: "lab.level.intermediate" },
  { id: "07-volumes", levelKey: "lab.level.intermediate" },
  { id: "08-multi-stage", levelKey: "lab.level.advanced" },
  { id: "09-production", levelKey: "lab.level.advanced" },
  { id: "10-debugging", levelKey: "lab.level.advanced" },
  { id: "11-security", levelKey: "lab.level.advanced" },
  { id: "12-ci-cd", levelKey: "lab.level.special" },
  { id: "13-capstone", levelKey: "lab.level.special" },
];

const chapterTitle = (id) => t(`chapter.${id}`);
const labsLocalized = () =>
  LAB_DEFS.map((lab) => ({
    id: lab.id,
    title: t(`labMeta.${lab.id}`),
    level: t(lab.levelKey),
  }));

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
        (line, idx) =>
          idx > s.index &&
          (/^## Table of contents$/m.test(line) || line.trim() === "## តារាងខ្លឹមសារ")
      );
      if (tocAt !== -1) end = tocAt;
    }
    let body = lines.slice(s.index, end).join("\n").trim();
    // Avoid duplicate title (page already shows H1)
    body = body.replace(/^##\s.+\n+/, "");
    const id = CHAPTERS[s.ci].id;
    return { id, title: chapterTitle(id), body };
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
    btn.textContent = t("copy");
    btn.addEventListener("click", async () => {
      const text = pre.querySelector("code")?.textContent || pre.textContent;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = t("copied");
        setTimeout(() => {
          btn.textContent = t("copy");
        }, 1400);
      } catch {
        btn.textContent = t("copyFailed");
      }
    });
    wrap.appendChild(btn);
  });
}

async function loadText(url, { fallbackUrl } = {}) {
  const res = await fetch(url);
  if (res.ok) return res.text();
  if (fallbackUrl && fallbackUrl !== url) {
    const fallback = await fetch(fallbackUrl);
    if (fallback.ok) return fallback.text();
  }
  throw new Error(`Could not load ${url}`);
}

function localizedContentUrl(relativePath) {
  const primary = contentPath(relativePath);
  const english = `./content/en/${String(relativePath || "").replace(/^\.\//, "")}`;
  return { primary, fallback: primary === english ? null : english };
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

function sanitizeHtml(html) {
  if (window.DOMPurify) {
    // Keep GFM task-list checkboxes so enhanceChecklists can wire them up.
    return DOMPurify.sanitize(html, {
      ADD_ATTR: ["checked", "disabled"],
    });
  }
  return html;
}

function renderMarkdown(target, md, { checklistScope } = {}) {
  // Prefer marked if present; fallback to basic preformatted text
  if (window.marked) {
    marked.setOptions({
      gfm: true,
      breaks: false,
    });
    target.innerHTML = sanitizeHtml(marked.parse(md));
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
    const guideUrl = localizedContentUrl("guide.md");
    const raw = await loadText(guideUrl.primary, { fallbackUrl: guideUrl.fallback });
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
        ${prev ? `<a class="pager-prev" href="${chapterHref(prev.id)}" data-chapter-id="${prev.id}"><span>${t("learn.prev")}</span>${prev.title}</a>` : ""}
        ${next ? `<a class="pager-next" href="${chapterHref(next.id)}" data-chapter-id="${next.id}"><span>${t("learn.next")}</span>${next.title}</a>` : ""}
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
      if (titleEl) {
        titleEl.removeAttribute("data-i18n");
        titleEl.textContent = chapter.title;
      }
      if (progressEl) {
        progressEl.removeAttribute("data-i18n");
        progressEl.textContent = t("learn.chapterOf", { n: index + 1, total: chapters.length });
      }
      document.title = `${chapter.title} — rean-docker`;
      window.ReanSeo?.sync({
        title: document.title,
        description: t("learn.description"),
        path: `learn.html?c=${encodeURIComponent(chapter.id)}`,
        type: "article",
      });
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
    bodyEl.innerHTML = `<div class="error"><strong>${t("learn.loadError")}</strong><br>${err.message}<br><br>${t("learn.serveHint")}</div>`;
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

  const LABS = labsLocalized();

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
      ${prev ? `<a class="pager-prev" href="${labHref(prev.id)}" data-lab-id="${prev.id}"><span>${t("lab.prev")}</span>${prev.title}</a>` : ""}
      ${next ? `<a class="pager-next" href="${labHref(next.id)}" data-lab-id="${next.id}"><span>${t("lab.next")}</span>${next.title}</a>` : ""}
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
    const labUrl = localizedContentUrl(`labs/${id}.md`);
    const md = await loadText(labUrl.primary, { fallbackUrl: labUrl.fallback });
    cache.set(id, md);
    return md;
  };

  const applyLab = async (lab, index) => {
    setActiveNav(lab.id);
    if (titleEl) {
      titleEl.removeAttribute("data-i18n");
      titleEl.textContent = lab.title;
    }
    if (progressEl) {
      progressEl.removeAttribute("data-i18n");
      progressEl.textContent = t("lab.of", { n: index + 1, total: LABS.length, level: lab.level });
    }
    document.title = `${lab.title} — rean-docker`;
    const num = lab.id.slice(0, 2);
    window.ReanSeo?.sync({
      title: document.title,
      description: t(`labs.${num}.desc`),
      path: `lab.html?id=${encodeURIComponent(lab.id)}`,
      type: "article",
    });
    renderPager(index);

    try {
      const md = await loadLabMarkdown(lab.id);
      renderMarkdown(bodyEl, md, { checklistScope: `lab:${lab.id}` });
      bodyEl.querySelector("h1")?.remove();
    } catch (err) {
      bodyEl.innerHTML = `<div class="error"><strong>${t("lab.loadError")}</strong><br>${err.message}<br><br>${t("lab.serveHint")}</div>`;
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

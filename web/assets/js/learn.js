/* Chapter & lab markdown reader */
const t = (key, vars) => (window.ReanI18n ? window.ReanI18n.t(key, vars) : key);
const contentPath = (path) =>
  window.ReanI18n ? window.ReanI18n.contentPath(path) : `./content/en/${path}`;

const CHAPTERS = window.ReanRoutes?.CHAPTERS || [];
const LAB_DEFS = window.ReanRoutes?.LAB_DEFS || [];

const chapterTitle = (id) => t(`chapter.${id}`);
const labsLocalized = () =>
  LAB_DEFS.map((lab) => ({
    id: lab.id,
    title: t(`labMeta.${lab.id}`),
    level: t(lab.levelKey),
    minutes: lab.minutes,
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
  const base = `./learn.html?c=${encodeURIComponent(id)}`;
  return window.ReanI18n?.localeHref?.(base) ?? base;
}

function labHref(id) {
  const base = `./lab.html?id=${encodeURIComponent(id)}`;
  return window.ReanI18n?.localeHref?.(base) ?? base;
}

const GH_EDIT_BASE = "https://github.com/bunsalcoder/rean-docker/edit/develop/";

function currentLocale() {
  return window.ReanI18n?.locale || document.documentElement.dataset.locale || "en";
}

function setEditSource(kind, id) {
  const link = document.querySelector("[data-edit-source]");
  if (!link) return;
  const locale = currentLocale();
  let path = "README.md";
  if (kind === "learn") {
    path = locale === "km" ? "web/content/km/guide.md" : "docs/DOCKER_FROM_ZERO_TO_HERO.md";
  } else if (kind === "lab" && id) {
    path =
      locale === "km"
        ? `web/content/km/labs/${id}.md`
        : `labs/${id}/README.md`;
  }
  link.href = `${GH_EDIT_BASE}${path}`;
  link.textContent = t("edit.onGitHub");
}

function splitGuide(markdown) {
  if (!window.ReanGuide?.splitSections) {
    throw new Error("ReanGuide.splitSections unavailable — load guide.js before learn.js");
  }
  return window.ReanGuide.splitSections(markdown, CHAPTERS, {
    clipIntroAtToc: true,
    stripLeadingHeading: true,
  }).map((s) => ({
    id: s.id,
    title: chapterTitle(s.id),
    body: s.body,
  }));
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
    btn.setAttribute("aria-label", t("copy"));
    btn.addEventListener("click", async () => {
      const text = pre.querySelector("code")?.textContent || pre.textContent;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = t("copied");
        btn.setAttribute("aria-label", t("copied"));
        setTimeout(() => {
          btn.textContent = t("copy");
          btn.setAttribute("aria-label", t("copy"));
        }, 1400);
      } catch {
        btn.textContent = t("copyFailed");
        btn.setAttribute("aria-label", t("copyFailed"));
      }
    });
    wrap.appendChild(btn);
  });
}

const GUIDE_CACHE_PREFIX = "rean-docker:guide-cache:";
const GUIDE_CACHE_TTL_MS = 30 * 60 * 1000;

async function loadText(url, { fallbackUrl, cache = false } = {}) {
  if (cache) {
    try {
      const raw = sessionStorage.getItem(GUIDE_CACHE_PREFIX + url);
      const hit = raw ? JSON.parse(raw) : null;
      if (
        hit?.text &&
        Number.isFinite(hit.at) &&
        Date.now() - hit.at < GUIDE_CACHE_TTL_MS
      ) {
        return hit.text;
      }
    } catch {
      /* private mode / corrupt */
    }
  }

  const res = await fetch(url);
  if (res.ok) {
    const text = await res.text();
    if (cache) {
      try {
        sessionStorage.setItem(
          GUIDE_CACHE_PREFIX + url,
          JSON.stringify({ text, at: Date.now() })
        );
      } catch {
        /* quota / private mode */
      }
    }
    return text;
  }
  if (fallbackUrl && fallbackUrl !== url) {
    return loadText(fallbackUrl, { cache });
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

function syncChecklistProgress(scope, boxes) {
  const total = boxes.length;
  let done = 0;
  boxes.forEach((input) => {
    if (input.checked) done += 1;
  });
  window.ReanProgress?.record(scope, done, total);
}

function enhanceChecklists(root, scope) {
  const boxes = root.querySelectorAll('li > input[type="checkbox"]');
  if (!boxes.length) return;

  let rawSaved = {};
  try {
    rawSaved = JSON.parse(localStorage.getItem(checklistStorageKey(scope)) || "{}");
  } catch {
    rawSaved = {};
  }

  const guide = window.ReanGuide;
  const saved = guide?.normalizeChecklistSaved
    ? guide.normalizeChecklistSaved(rawSaved, boxes.length)
    : rawSaved;

  const persistIndexOnly = () => {
    const indexOnly = {};
    boxes.forEach((input, index) => {
      const key = guide?.checklistIndexKey
        ? guide.checklistIndexKey(index)
        : `i:${index}`;
      indexOnly[key] = Boolean(input.checked);
      saved[key] = indexOnly[key];
    });
    Object.keys(saved).forEach((k) => {
      if (!/^i:\d+$/.test(k)) delete saved[k];
    });
    try {
      localStorage.setItem(checklistStorageKey(scope), JSON.stringify(indexOnly));
    } catch {
      /* ignore quota / private mode */
    }
  };

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

    // Index keys survive EN↔KM; legacy text keys still resolve same-locale.
    const key = guide?.checklistIndexKey
      ? guide.checklistIndexKey(index)
      : `i:${index}`;
    input.checked = guide?.resolveChecklistChecked
      ? guide.resolveChecklistChecked(saved, li, index)
      : Boolean(saved[key]);
    li.classList.toggle("is-done", input.checked);
    saved[key] = input.checked;

    input.addEventListener("change", () => {
      saved[key] = input.checked;
      persistIndexOnly();
      li.classList.toggle("is-done", input.checked);
      syncChecklistProgress(scope, boxes);
    });
  });

  // Rewrite any legacy text-key blob to stable index keys on first load.
  persistIndexOnly();
  syncChecklistProgress(scope, boxes);
}

function sanitizeHtml(html) {
  if (window.DOMPurify) {
    // Keep GFM task-list checkboxes so enhanceChecklists can wire them up.
    // details/summary are used for Expected output / Common error callouts.
    return DOMPurify.sanitize(html, {
      ADD_ATTR: ["checked", "disabled", "open"],
      ADD_TAGS: ["details", "summary"],
    });
  }
  // Fail closed: never inject unsanitized Markdown HTML if DOMPurify is missing.
  return String(html || "").replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
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
  window.ReanGuide?.enhanceCallouts?.(target);
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

  // Restore drawer after EN↔KM reload (narrow viewports).
  const restore = window.ReanI18n?.takeUiRestore?.();
  if (restore?.sidebarOpen && window.matchMedia("(max-width: 900px)").matches) {
    open();
  }
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
    const raw = await loadText(guideUrl.primary, {
      fallbackUrl: guideUrl.fallback,
      cache: true,
    });
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
      setEditSource("learn", chapter.id);
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
        return `<li><a href="${chapterHref(c.id)}" data-chapter-id="${c.id}"><small class="side-nav-index">${n}</small>${c.title}</a></li>`;
      })
      .join("");

    window.ReanProgress?.decorateChapterNav?.(navEl);

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
      const base = t("lab.of", { n: index + 1, total: LABS.length, level: lab.level });
      progressEl.textContent = lab.minutes
        ? `${base} · ${t("labs.duration", { n: lab.minutes })}`
        : base;
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
      setEditSource("lab", lab.id);
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
      `<li><a href="${labHref(l.id)}" data-lab-id="${l.id}">${l.title}<br><span class="side-nav-meta">${l.level}</span></a></li>`
  ).join("");

  window.ReanProgress?.decorateLabNav?.(navEl);

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

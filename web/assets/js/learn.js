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

/**
 * Legacy `#chapter` / `#lab-id` hashes still open the right page, then rewrite
 * to the shareable `?c=` / `?id=` form (and strip a leftover hash when query wins).
 */
function normalizeLegacyHashRoute(queryKey, hrefForId) {
  const fromQuery = getParam(queryKey);
  if (fromQuery) {
    if (location.hash) {
      history.replaceState(history.state, "", `${location.pathname}${location.search}`);
    }
    return;
  }
  const raw = location.hash.replace(/^#/, "").trim();
  if (!raw) return;
  let id = raw;
  try {
    id = decodeURIComponent(raw);
  } catch {
    /* keep raw */
  }
  if (!id) return;
  history.replaceState(history.state, "", hrefForId(id));
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

function readerProgressLabel(id, chapters) {
  const num = window.ReanGuide?.handbookChapterNumber?.(id) || "";
  if (num) {
    const total = chapters.filter((c) => window.ReanGuide.handbookChapterNumber(c.id)).length;
    return t("learn.chapterOf", { n: String(Number(num)), total });
  }
  const key = `learn.meta.${id}`;
  const label = t(key);
  return label === key ? "" : label;
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
        setTimeout(() => {
          btn.textContent = t("copy");
          btn.setAttribute("aria-label", t("copy"));
        }, 1400);
      }
    });
    wrap.appendChild(btn);
  });
}

const GUIDE_CACHE_PREFIX = "rean-docker:guide-cache:";
const GUIDE_CACHE_TTL_MS = 10 * 60 * 1000;

function guideCacheKey(url) {
  const ver = window.ReanRoutes?.version ?? 0;
  return `${GUIDE_CACHE_PREFIX}v${ver}:${url}`;
}

function readGuideCache(url) {
  try {
    const raw = sessionStorage.getItem(guideCacheKey(url));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeGuideCache(url, payload) {
  try {
    sessionStorage.setItem(guideCacheKey(url), JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

async function isGuideCacheFresh(url, hit) {
  if (!hit?.text) return false;
  try {
    const head = await fetch(url, { method: "HEAD", cache: "no-cache" });
    if (head.ok) {
      const etag = head.headers.get("etag");
      const lm = head.headers.get("last-modified");
      if (etag && hit.etag && etag === hit.etag) return true;
      if (lm && hit.lm && lm === hit.lm) return true;
      // Validators present but mismatched (or missing on the hit) → refetch.
      if (etag || lm) return false;
    }
  } catch {
    /* offline / HEAD unsupported */
  }
  return Number.isFinite(hit.at) && Date.now() - hit.at < GUIDE_CACHE_TTL_MS;
}

async function loadText(url, { fallbackUrl, cache = false } = {}) {
  if (cache) {
    const hit = readGuideCache(url);
    if (hit?.text && (await isGuideCacheFresh(url, hit))) {
      return hit.text;
    }
  }

  const res = await fetch(url, { cache: "no-cache" });
  if (res.ok) {
    const text = await res.text();
    if (cache) {
      writeGuideCache(url, {
        text,
        at: Date.now(),
        etag: res.headers.get("etag"),
        lm: res.headers.get("last-modified"),
      });
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

function enhanceChecklists(root, scope) {
  if (window.ReanGuide?.enhanceChecklists) {
    window.ReanGuide.enhanceChecklists(root, scope);
    return;
  }
  // Intro / reference pages with no shared helper — still mark visited.
  if (!root?.querySelector?.('li > input[type="checkbox"]')) {
    window.ReanProgress?.record(scope, 1, 1);
  }
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

  if (!sidebar.id) sidebar.id = "reader-sidebar";
  toggle.setAttribute("aria-controls", sidebar.id);

  const inertTargets = () =>
    [document.querySelector(".site-header"), document.querySelector(".content-pane"), document.querySelector(".site-footer")].filter(
      Boolean
    );

  const setBackgroundInert = (on) => {
    inertTargets().forEach((el) => {
      if (on) el.setAttribute("inert", "");
      else el.removeAttribute("inert");
    });
  };

  const focusableIn = (root) =>
    root.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

  const close = ({ restoreFocus = false } = {}) => {
    if (!sidebar.classList.contains("is-open")) return;
    sidebar.classList.remove("is-open");
    backdrop?.classList.remove("is-on");
    toggle.setAttribute("aria-expanded", "false");
    setBackgroundInert(false);
    if (restoreFocus) toggle.focus();
  };

  const open = () => {
    sidebar.classList.add("is-open");
    backdrop?.classList.add("is-on");
    toggle.setAttribute("aria-expanded", "true");
    setBackgroundInert(true);
    const first = focusableIn(sidebar)[0];
    if (first && window.matchMedia("(max-width: 900px)").matches) {
      first.focus({ preventScroll: true });
    }
  };

  toggle.addEventListener("click", () => {
    if (sidebar.classList.contains("is-open")) close({ restoreFocus: true });
    else open();
  });
  backdrop?.addEventListener("click", () => close({ restoreFocus: true }));
  // Delegate so links added after init still close the drawer
  sidebar.addEventListener("click", (event) => {
    if (event.target.closest("a")) close({ restoreFocus: true });
  });
  document.addEventListener("keydown", (event) => {
    if (!sidebar.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      close({ restoreFocus: true });
      return;
    }
    if (event.key !== "Tab" || !window.matchMedia("(max-width: 900px)").matches) return;
    const nodes = [...focusableIn(sidebar)];
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  // Restore drawer after EN↔KM reload (narrow viewports).
  const restore = window.ReanI18n?.takeUiRestore?.();
  if (restore?.sidebarOpen && window.matchMedia("(max-width: 900px)").matches) {
    open();
  }
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isTypingTarget(target) {
  const tag = (target?.tagName || "").toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || Boolean(target?.isContentEditable);
}

/**
 * ArrowLeft / [ → previous; ArrowRight / ] → next.
 * Skips when typing, a dialog is open, or modifiers are held.
 */
function setupPagerKeys({ getPrevId, getNextId, goTo }) {
  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (isTypingTarget(event.target)) return;
    if (document.querySelector("dialog[open]")) return;

    let id = null;
    if (event.key === "ArrowLeft" || event.key === "[") {
      id = getPrevId?.();
    } else if (event.key === "ArrowRight" || event.key === "]") {
      id = getNextId?.();
    } else {
      return;
    }
    if (!id) return;
    event.preventDefault();
    goTo(id, { push: true, animate: true });
  });
}

function pagerKeysHintHtml() {
  return `<p class="pager-keys"><kbd>←</kbd> <kbd>→</kbd> <span>${t("a11y.pagerKeys")}</span></p>`;
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}

function focusReaderTitle(titleEl) {
  const heading = titleEl || document.querySelector(".content-pane > h1");
  if (!heading) return;
  if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
  heading.focus({ preventScroll: true });
}

function renderMissingRoute(bodyEl, titleEl, progressEl, pagerEl, { title, hint, href, cta }) {
  if (titleEl) {
    titleEl.removeAttribute("data-i18n");
    titleEl.textContent = title;
  }
  if (progressEl) {
    progressEl.removeAttribute("data-i18n");
    progressEl.textContent = "";
  }
  if (pagerEl) pagerEl.innerHTML = "";
  clearPairCta();
  clearLabNote();
  document.title = `${title} — rean-docker`;
  bodyEl.innerHTML = `<div class="error"><strong>${escapeHtml(title)}</strong><br>${escapeHtml(hint)}<br><br><a class="btn btn-primary" href="${escapeHtml(href)}">${escapeHtml(cta)}</a></div>`;
  focusReaderTitle(titleEl);
}

/**
 * What a chapter/lab navigation should do. Pure: no history writes, no DOM.
 * `push: true` on the same id replaces the current entry instead of pushing.
 */
function planNavigation({ currentIndex, requestedId, resolveIndex, push = false }) {
  const index = resolveIndex(requestedId);
  if (index < 0) {
    return { action: "missing", index: -1, push: Boolean(push), replace: false, hadItem: false };
  }
  if (index === currentIndex) {
    return {
      action: "same",
      index,
      push: false,
      replace: Boolean(push),
      hadItem: currentIndex >= 0,
    };
  }
  return {
    action: "show",
    index,
    push: Boolean(push),
    replace: false,
    hadItem: currentIndex >= 0,
  };
}

/** Monotonic token so a newer show() cancels an in-flight leave animation or fetch. */
function createTransitionGate() {
  let token = 0;
  return {
    begin() {
      token += 1;
      return token;
    },
    isCurrent(value) {
      return value === token;
    },
  };
}

/** Scroll the sidebar itself so the current item is visible without moving the page. */
function revealActiveNav(link) {
  const sidebar = link.closest(".sidebar");
  if (!sidebar) return;
  const linkBox = link.getBoundingClientRect();
  const sideBox = sidebar.getBoundingClientRect();
  if (linkBox.top < sideBox.top) {
    sidebar.scrollTop -= sideBox.top - linkBox.top;
  } else if (linkBox.bottom > sideBox.bottom) {
    sidebar.scrollTop += linkBox.bottom - sideBox.bottom;
  }
}

function setActiveNav(navEl, attr, id) {
  let active = null;
  navEl.querySelectorAll(`a[${attr}]`).forEach((a) => {
    const on = Boolean(id) && a.getAttribute(attr) === id;
    a.classList.toggle("is-active", on);
    if (on) {
      a.setAttribute("aria-current", "page");
      active = a;
    } else {
      a.removeAttribute("aria-current");
    }
  });
  if (active) revealActiveNav(active);
}

function renderPagerLinks(pagerEl, { prev, next, hrefFor, attr, prevLabel, nextLabel }) {
  if (!pagerEl) return;
  const link = (item, className, label) => {
    if (!item) return "";
    const href = escapeHtml(hrefFor(item.id));
    const id = escapeHtml(item.id);
    return (
      `<a class="${className}" href="${href}" ${attr}="${id}">` +
      `<span>${escapeHtml(label)}</span>${escapeHtml(item.title)}</a>`
    );
  };
  pagerEl.innerHTML =
    `${link(prev, "pager-prev", prevLabel)}` +
    `${link(next, "pager-next", nextLabel)}` +
    pagerKeysHintHtml();
}

const READER_OUT_MS = 280;

/**
 * Shared Learn/Lab transition: history, leave/enter motion, and cancellation.
 * `applyItem` may be async (lab markdown). Pass `isCurrent` through and bail
 * after any await so a newer navigation does not get overwritten.
 */
function createReader({ items, bodyEl, hrefFor, stateFor, applyItem, onMissing }) {
  let currentIndex = -1;
  const gate = createTransitionGate();
  const paneEl = bodyEl.closest(".content-pane");

  const clearMotion = () => {
    bodyEl.classList.remove("is-leaving", "is-switching");
    bodyEl.style.animation = "";
    paneEl?.classList.remove("is-chapter-leaving", "is-chapter-switching");
  };

  const playIn = () => {
    clearMotion();
    void bodyEl.offsetWidth;
    bodyEl.classList.add("is-switching");
    paneEl?.classList.add("is-chapter-switching");
  };

  const show = async (id, { push = false, animate = true } = {}) => {
    const plan = planNavigation({
      currentIndex,
      requestedId: id,
      resolveIndex: (wanted) => items.findIndex((item) => item.id === wanted),
      push,
    });

    if (plan.action === "missing") {
      if (plan.push) history.pushState(stateFor(id), "", hrefFor(id));
      currentIndex = -1;
      clearMotion();
      onMissing(id);
      return;
    }

    const item = items[plan.index];
    if (plan.action === "same") {
      if (plan.replace) history.replaceState(stateFor(item.id), "", hrefFor(item.id));
      return;
    }

    const token = gate.begin();
    const hadItem = plan.hadItem;
    currentIndex = plan.index;

    if (plan.push) history.pushState(stateFor(item.id), "", hrefFor(item.id));

    scrollToTop();

    const shouldAnimate = animate && !prefersReducedMotion();
    if (shouldAnimate && hadItem) {
      clearMotion();
      bodyEl.classList.add("is-leaving");
      paneEl?.classList.add("is-chapter-leaving");
      await new Promise((resolve) => setTimeout(resolve, READER_OUT_MS));
      if (!gate.isCurrent(token)) return;
    }

    await applyItem(item, plan.index, {
      focusTitle: hadItem,
      isCurrent: () => gate.isCurrent(token),
    });
    if (!gate.isCurrent(token)) return;

    if (shouldAnimate) playIn();
    else clearMotion();
  };

  return {
    show,
    index: () => currentIndex,
  };
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function clearPairCta() {
  const el = document.querySelector("[data-pair-cta]");
  if (!el) return;
  el.hidden = true;
  el.innerHTML = "";
}

function clearLabNote() {
  const el = document.querySelector("[data-lab-note]");
  if (!el) return;
  el.hidden = true;
  el.textContent = "";
}

function renderLabNote(labId) {
  const el = document.querySelector("[data-lab-note]");
  if (!el) return;
  const key = window.ReanRoutes?.LAB_NOTES?.[labId];
  if (!key) {
    clearLabNote();
    return;
  }
  el.hidden = false;
  el.textContent = t(key);
}

function renderPairCta({ kind, id }) {
  const el = document.querySelector("[data-pair-cta]");
  if (!el) return;

  const routes = window.ReanRoutes || {};
  const pairs = Array.isArray(routes.PAIRS) ? routes.PAIRS : [];

  if (kind === "chapter") {
    const labId = routes.CHAPTER_TO_LAB?.[id];
    if (!labId) {
      clearPairCta();
      return;
    }
    const pair = pairs.find((p) => String(p.chapter) === String(id) && p.lab === labId);
    const num = labId.slice(0, 2);
    const href = labHref(labId);
    const linkText = t("pair.labTitle", {
      n: num,
      title: t(`labMeta.${labId}`),
    });
    const hintKey = pair?.practiceHintKey;
    const hint = hintKey ? `<span class="pair-cta-hint">${escapeHtml(t(hintKey))}</span>` : "";
    el.hidden = false;
    el.innerHTML = `<span class="pair-cta-label">${escapeHtml(t("pair.practice"))}</span><a href="${escapeHtml(href)}">${escapeHtml(linkText)}</a>${hint}`;
    return;
  }

  if (kind === "lab") {
    const chapterIds =
      routes.LAB_TO_CHAPTERS?.[id] ||
      (routes.LAB_TO_CHAPTER?.[id] ? [routes.LAB_TO_CHAPTER[id]] : []);
    if (!chapterIds.length) {
      clearPairCta();
      return;
    }
    const links = chapterIds
      .map((chapterId, index) => {
        const href = chapterHref(chapterId);
        const linkText = t("pair.chapterTitle", {
          n: chapterId,
          title: t(`chapter.${chapterId}`),
        });
        const sep =
          index > 0 ? `<span class="pair-cta-sep" aria-hidden="true">·</span>` : "";
        return `${sep}<a href="${escapeHtml(href)}">${escapeHtml(linkText)}</a>`;
      })
      .join("");
    el.hidden = false;
    el.innerHTML = `<span class="pair-cta-label">${escapeHtml(t("pair.theory"))}</span>${links}`;
    return;
  }

  clearPairCta();
}

async function initLearnPage() {
  const navEl = document.querySelector("[data-chapter-nav]");
  const bodyEl = document.querySelector("[data-chapter-body]");
  const titleEl = document.querySelector("[data-chapter-title]");
  const progressEl = document.querySelector("[data-progress]");
  const pagerEl = document.querySelector("[data-pager]");
  if (!navEl || !bodyEl) return;

  setupSidebarToggle();
  normalizeLegacyHashRoute("c", chapterHref);

  try {
    const guideUrl = localizedContentUrl("guide.md");
    const raw = await loadText(guideUrl.primary, {
      fallbackUrl: guideUrl.fallback,
      cache: true,
    });
    // Strip TOC-only section noise at top but keep intro via how-to-use
    const chapters = splitGuide(raw);
    if (!chapters.length) throw new Error("No chapters found");

    const renderPager = (index) => {
      renderPagerLinks(pagerEl, {
        prev: chapters[index - 1],
        next: chapters[index + 1],
        hrefFor: chapterHref,
        attr: "data-chapter-id",
        prevLabel: t("learn.prev"),
        nextLabel: t("learn.next"),
      });
    };

    const applyChapter = (chapter, index, { focusTitle = false, isCurrent = () => true } = {}) => {
      if (!isCurrent()) return;
      setActiveNav(navEl, "data-chapter-id", chapter.id);
      if (titleEl) {
        titleEl.removeAttribute("data-i18n");
        titleEl.textContent = chapter.title;
      }
      if (progressEl) {
        progressEl.removeAttribute("data-i18n");
        progressEl.textContent = readerProgressLabel(chapter.id, chapters);
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
      renderPairCta({ kind: "chapter", id: chapter.id });
      clearLabNote();
      renderPager(index);
      if (focusTitle) focusReaderTitle(titleEl);
    };

    const showMissingChapter = (requestedId) => {
      setActiveNav(navEl, "data-chapter-id", "");
      renderMissingRoute(bodyEl, titleEl, progressEl, pagerEl, {
        title: t("learn.notFound"),
        hint: t("learn.notFoundHint"),
        href: chapterHref(chapters[0].id),
        cta: t("learn.openFirst"),
      });
      window.ReanSeo?.sync({
        title: document.title,
        description: t("learn.description"),
        path: `learn.html?c=${encodeURIComponent(requestedId || "")}`,
        type: "article",
      });
    };

    const reader = createReader({
      items: chapters,
      bodyEl,
      hrefFor: chapterHref,
      stateFor: (id) => ({ c: id }),
      applyItem: applyChapter,
      onMissing: showMissingChapter,
    });

    navEl.innerHTML = chapters
      .map((c) => {
        const href = escapeHtml(chapterHref(c.id));
        const id = escapeHtml(c.id);
        const n = window.ReanGuide?.handbookChapterNumber?.(c.id) || "";
        const indexHtml = n ? `<small class="side-nav-index">${n}</small>` : "";
        return (
          `<li><a href="${href}" data-chapter-id="${id}">` +
          `${indexHtml}${escapeHtml(c.title)}</a></li>`
        );
      })
      .join("");

    window.ReanProgress?.decorateChapterNav?.(navEl);

    navEl.addEventListener("click", (event) => {
      const link = event.target.closest("a[data-chapter-id]");
      if (!link) return;
      event.preventDefault();
      reader.show(link.dataset.chapterId, { push: true, animate: true });
    });

    pagerEl?.addEventListener("click", (event) => {
      const link = event.target.closest("a[data-chapter-id]");
      if (!link) return;
      event.preventDefault();
      reader.show(link.dataset.chapterId, { push: true, animate: true });
    });

    setupPagerKeys({
      getPrevId: () => chapters[reader.index() - 1]?.id || null,
      getNextId: () => chapters[reader.index() + 1]?.id || null,
      goTo: (id, opts) => reader.show(id, opts),
    });

    window.addEventListener("popstate", () => {
      reader.show(getRouteId("c") || chapters[0].id, { push: false, animate: true });
    });

    reader.show(getRouteId("c") || chapters[0].id, { push: false, animate: true });
  } catch (err) {
    bodyEl.innerHTML = `<div class="error"><strong>${escapeHtml(t("learn.loadError"))}</strong><br>${escapeHtml(err.message)}<br><br>${escapeHtml(t("learn.serveHint"))}</div>`;
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
  normalizeLegacyHashRoute("id", labHref);

  const cache = new Map();
  const LABS = labsLocalized();

  const renderPager = (index) => {
    renderPagerLinks(pagerEl, {
      prev: LABS[index - 1],
      next: LABS[index + 1],
      hrefFor: labHref,
      attr: "data-lab-id",
      prevLabel: t("lab.prev"),
      nextLabel: t("lab.next"),
    });
  };

  const loadLabMarkdown = async (id) => {
    if (cache.has(id)) return cache.get(id);
    const labUrl = localizedContentUrl(`labs/${id}.md`);
    const md = await loadText(labUrl.primary, { fallbackUrl: labUrl.fallback });
    cache.set(id, md);
    return md;
  };

  const applyLab = async (lab, index, { focusTitle = false, isCurrent = () => true } = {}) => {
    if (!isCurrent()) return;
    setActiveNav(navEl, "data-lab-id", lab.id);
    if (titleEl) {
      titleEl.removeAttribute("data-i18n");
      titleEl.textContent = lab.title;
    }
    if (progressEl) {
      progressEl.removeAttribute("data-i18n");
      const base = t("lab.of", { n: lab.id.slice(0, 2), level: lab.level });
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
    renderPairCta({ kind: "lab", id: lab.id });
    renderLabNote(lab.id);

    try {
      const md = await loadLabMarkdown(lab.id);
      if (!isCurrent()) return;
      renderMarkdown(bodyEl, md, { checklistScope: `lab:${lab.id}` });
      bodyEl.querySelector("h1")?.remove();
      setEditSource("lab", lab.id);
    } catch (err) {
      if (!isCurrent()) return;
      bodyEl.innerHTML =
        `<div class="error"><strong>${escapeHtml(t("lab.loadError"))}</strong><br>` +
        `${escapeHtml(err.message)}<br><br>${escapeHtml(t("lab.serveHint"))}</div>`;
    }
    if (focusTitle) focusReaderTitle(titleEl);
  };

  const showMissingLab = (requestedId) => {
    setActiveNav(navEl, "data-lab-id", "");
    renderMissingRoute(bodyEl, titleEl, progressEl, pagerEl, {
      title: t("lab.notFound"),
      hint: t("lab.notFoundHint"),
      href: labHref(LABS[0].id),
      cta: t("lab.openFirst"),
    });
    window.ReanSeo?.sync({
      title: document.title,
      description: t("lab.description"),
      path: `lab.html?id=${encodeURIComponent(requestedId || "")}`,
      type: "article",
    });
  };

  const reader = createReader({
    items: LABS,
    bodyEl,
    hrefFor: labHref,
    stateFor: (id) => ({ id }),
    applyItem: applyLab,
    onMissing: showMissingLab,
  });

  navEl.innerHTML = LABS.map(
    (l) =>
      `<li><a href="${escapeHtml(labHref(l.id))}" data-lab-id="${escapeHtml(l.id)}">` +
      `${escapeHtml(l.title)}<br><span class="side-nav-meta">${escapeHtml(l.level)}</span></a></li>`
  ).join("");

  window.ReanProgress?.decorateLabNav?.(navEl);

  navEl.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-lab-id]");
    if (!link) return;
    event.preventDefault();
    reader.show(link.dataset.labId, { push: true, animate: true });
  });

  pagerEl?.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-lab-id]");
    if (!link) return;
    event.preventDefault();
    reader.show(link.dataset.labId, { push: true, animate: true });
  });

  setupPagerKeys({
    getPrevId: () => LABS[reader.index() - 1]?.id || null,
    getNextId: () => LABS[reader.index() + 1]?.id || null,
    goTo: (id, opts) => reader.show(id, opts),
  });

  window.addEventListener("popstate", () => {
    reader.show(getRouteId("id") || LABS[0].id, { push: false, animate: true });
  });

  reader.show(getRouteId("id") || LABS[0].id, { push: false, animate: true });
}

window.ReanReader = {
  planNavigation,
  createTransitionGate,
};

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page === "learn") initLearnPage();
  if (document.body.dataset.page === "lab") initLabPage();
});

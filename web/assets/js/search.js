(() => {
  const t = (key, vars) => (window.ReanI18n ? window.ReanI18n.t(key, vars) : key);
  const contentPath = (path) =>
    window.ReanI18n ? window.ReanI18n.contentPath(path) : `./content/en/${path}`;

  const CHAPTER_MATCHERS = window.ReanRoutes?.CHAPTERS || [];

  const LAB_IDS = window.ReanRoutes?.LAB_IDS || [];

  let indexPromise = null;
  let dialog = null;
  let input = null;
  let resultsEl = null;
  let statusEl = null;
  let activeIndex = -1;

  const loadText = async (url, fallbackUrl) => {
    const res = await fetch(url);
    if (res.ok) return res.text();
    if (fallbackUrl && fallbackUrl !== url) {
      const fallback = await fetch(fallbackUrl);
      if (fallback.ok) return fallback.text();
    }
    throw new Error(`Could not load ${url}`);
  };

  const localized = (relativePath) => {
    const primary = contentPath(relativePath);
    const english = `./content/en/${String(relativePath || "").replace(/^\.\//, "")}`;
    return { primary, fallback: primary === english ? null : english };
  };

  const stripMd = (md) =>
    String(md || "")
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`[^`]+`/g, " ")
      .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
      .replace(/\[[^\]]*]\([^)]+\)/g, " ")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/[*_>#|-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const splitGuide = (markdown) => {
    const sections = window.ReanGuide?.splitSections
      ? window.ReanGuide.splitSections(markdown, CHAPTER_MATCHERS)
      : [];
    return sections.map((s) => ({
      type: "chapter",
      id: s.id,
      title: t(`chapter.${s.id}`),
      href:
        window.ReanI18n?.localeHref?.(`./learn.html?c=${encodeURIComponent(s.id)}`) ??
        `./learn.html?c=${encodeURIComponent(s.id)}`,
      text: stripMd(s.body),
    }));
  };

  const hydrateDoc = (raw) => {
    const id = raw.id;
    if (raw.type === "lab") {
      return {
        type: "lab",
        id,
        title: t(`labMeta.${id}`),
        href:
          window.ReanI18n?.localeHref?.(`./lab.html?id=${encodeURIComponent(id)}`) ??
          `./lab.html?id=${encodeURIComponent(id)}`,
        text: raw.text || "",
      };
    }
    return {
      type: "chapter",
      id,
      title: t(`chapter.${id}`),
      href:
        window.ReanI18n?.localeHref?.(`./learn.html?c=${encodeURIComponent(id)}`) ??
        `./learn.html?c=${encodeURIComponent(id)}`,
      text: raw.text || "",
    };
  };

  const loadPrebuiltIndex = async () => {
    const locale = window.ReanI18n?.locale || "en";
    const url = `./assets/search-index-${locale}.json`;
    const fallbackUrl = locale === "en" ? null : "./assets/search-index-en.json";
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.docs) && data.docs.length) {
          return data.docs.map(hydrateDoc);
        }
      }
    } catch {
      /* fall through */
    }
    if (fallbackUrl) {
      try {
        const res = await fetch(fallbackUrl);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.docs) && data.docs.length) {
            return data.docs.map(hydrateDoc);
          }
        }
      } catch {
        /* fall through to markdown build */
      }
    }
    return null;
  };

  const buildIndexFromMarkdown = async () => {
    const docs = [];
    const guideUrl = localized("guide.md");
    try {
      const guide = await loadText(guideUrl.primary, guideUrl.fallback);
      docs.push(...splitGuide(guide));
    } catch {
      /* offline / file:// */
    }

    await Promise.all(
      LAB_IDS.map(async (id) => {
        const labUrl = localized(`labs/${id}.md`);
        try {
          const md = await loadText(labUrl.primary, labUrl.fallback);
          docs.push({
            type: "lab",
            id,
            title: t(`labMeta.${id}`),
            href:
              window.ReanI18n?.localeHref?.(`./lab.html?id=${encodeURIComponent(id)}`) ??
              `./lab.html?id=${encodeURIComponent(id)}`,
            text: stripMd(md),
          });
        } catch {
          /* missing lab copy */
        }
      })
    );
    return docs;
  };

  const buildIndex = async () => {
    const prebuilt = await loadPrebuiltIndex();
    if (prebuilt?.length) return prebuilt;
    return buildIndexFromMarkdown();
  };

  const ensureIndex = () => {
    if (!indexPromise) indexPromise = buildIndex();
    return indexPromise;
  };

  const flattenAlts = (termGroups) => termGroups.flat();

  const scoreDoc = (doc, termGroups) => {
    const hay = `${doc.title} ${doc.text}`.toLowerCase();
    const title = doc.title.toLowerCase();
    let score = 0;
    for (const alts of termGroups) {
      let best = 0;
      let matched = false;
      for (const alt of alts) {
        if (alt.length < 2 || !hay.includes(alt)) continue;
        matched = true;
        let local = 0;
        if (title.includes(alt)) local += 8;
        local += Math.min(hay.split(alt).length - 1, 6);
        // Prefer more specific aliases (e.g. "docker compose" over "compose").
        local += Math.min(alt.length, 12) * 0.05;
        best = Math.max(best, local);
      }
      if (!matched) return 0;
      score += best;
    }
    return score;
  };

  const snippetFor = (doc, termGroups) => {
    const lower = doc.text.toLowerCase();
    let at = -1;
    for (const alt of flattenAlts(termGroups)) {
      const i = lower.indexOf(alt);
      if (i !== -1 && (at === -1 || i < at)) at = i;
    }
    if (at < 0) return doc.text.slice(0, 140);
    const start = Math.max(0, at - 48);
    const end = Math.min(doc.text.length, at + 120);
    const slice = `${start > 0 ? "…" : ""}${doc.text.slice(start, end)}${end < doc.text.length ? "…" : ""}`;
    return slice;
  };

  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const escapeAttr = escapeHtml;

  const highlight = (text, termGroups) => {
    let out = escapeHtml(text);
    // Longer alts first so “docker compose” marks before “compose”.
    const alts = flattenAlts(termGroups).sort((a, b) => b.length - a.length);
    alts.forEach((term) => {
      if (term.length < 2) return;
      const re = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
      out = out.replace(re, "<mark>$1</mark>");
    });
    return out;
  };

  const expandTerms = (query) =>
    window.ReanGuide?.expandSearchTerms
      ? window.ReanGuide.expandSearchTerms(query)
      : String(query || "")
          .toLowerCase()
          .split(/\s+/)
          .map((s) => s.trim())
          .filter((s) => s.length >= 2)
          .map((s) => [s]);

  const search = (docs, query) => {
    const termGroups = expandTerms(query);
    if (!termGroups.length) return [];
    return docs
      .map((doc) => ({ doc, score: scoreDoc(doc, termGroups), termGroups }))
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title))
      .slice(0, 12);
  };

  const syncCombobox = () => {
    if (!input || !resultsEl) return;
    const items = resultsEl.querySelectorAll("[data-search-item]");
    const open = items.length > 0;
    input.setAttribute("aria-expanded", open ? "true" : "false");
    items.forEach((el, i) => {
      const selected = i === activeIndex;
      el.classList.toggle("is-active", selected);
      el.setAttribute("aria-selected", selected ? "true" : "false");
      if (selected) {
        input.setAttribute("aria-activedescendant", el.id);
        el.scrollIntoView({ block: "nearest" });
      }
    });
    if (activeIndex < 0) input.removeAttribute("aria-activedescendant");
  };

  const setActive = (index) => {
    activeIndex = index;
    syncCombobox();
  };

  const renderResults = (rows, query) => {
    activeIndex = -1;
    if (!resultsEl || !statusEl) return;
    if (!query.trim()) {
      resultsEl.innerHTML = "";
      statusEl.textContent = t("search.hint");
      syncCombobox();
      return;
    }
    if (!rows.length) {
      resultsEl.innerHTML = "";
      statusEl.textContent = t("search.empty");
      syncCombobox();
      return;
    }
    statusEl.textContent = t("search.count", { n: rows.length });
    resultsEl.innerHTML = rows
      .map(({ doc, termGroups }, i) => {
        const kind = escapeHtml(
          doc.type === "lab" ? t("search.kindLab") : t("search.kindChapter")
        );
        const snip = highlight(snippetFor(doc, termGroups), termGroups);
        const optionId = `rean-search-opt-${i}`;
        return `<li role="presentation">
          <a href="${escapeAttr(doc.href)}" id="${optionId}" role="option" aria-selected="false" data-search-item data-index="${i}">
            <span class="search-kind">${kind}</span>
            <span class="search-title">${highlight(doc.title, termGroups)}</span>
            <span class="search-snippet">${snip}</span>
          </a>
        </li>`;
      })
      .join("");
    syncCombobox();
  };

  const runQuery = async () => {
    if (!input) return;
    const query = input.value;
    statusEl.textContent = t("search.loading");
    try {
      const docs = await ensureIndex();
      renderResults(search(docs, query), query);
    } catch {
      statusEl.textContent = t("search.error");
      resultsEl.innerHTML = "";
    }
  };

  const open = () => {
    if (!dialog) return;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    input?.focus();
    input?.select();
    ensureIndex();
    runQuery();
  };

  const close = () => {
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  };

  const mountDialog = () => {
    if (dialog) return;
    dialog = document.createElement("dialog");
    dialog.className = "search-dialog";
    dialog.setAttribute("aria-labelledby", "rean-search-title");
    dialog.innerHTML = `
      <div class="search-shell">
        <div class="search-head">
          <h2 id="rean-search-title"></h2>
          <button type="button" class="search-close" data-search-close aria-label="">×</button>
        </div>
        <label class="search-field">
          <span class="visually-hidden" data-search-title-sr></span>
          <input
            type="search"
            data-search-input
            role="combobox"
            aria-autocomplete="list"
            aria-expanded="false"
            aria-controls="rean-search-listbox"
            autocomplete="off"
            spellcheck="false"
            placeholder=""
          />
        </label>
        <p class="search-status" data-search-status id="rean-search-status" role="status" aria-live="polite"></p>
        <ul class="search-results" data-search-results id="rean-search-listbox" role="listbox" aria-labelledby="rean-search-title"></ul>
        <p class="search-kbd"><kbd>/</kbd> <span data-search-open-hint></span></p>
      </div>`;
    document.body.appendChild(dialog);
    input = dialog.querySelector("[data-search-input]");
    resultsEl = dialog.querySelector("[data-search-results]");
    statusEl = dialog.querySelector("[data-search-status]");

    const titleEl = dialog.querySelector("#rean-search-title");
    if (titleEl) titleEl.textContent = t("search.title");
    const titleSr = dialog.querySelector("[data-search-title-sr]");
    if (titleSr) titleSr.textContent = t("search.title");
    const closeBtn = dialog.querySelector("[data-search-close]");
    if (closeBtn) closeBtn.setAttribute("aria-label", t("search.close"));
    if (input) {
      input.placeholder = t("search.placeholder");
      input.setAttribute("aria-describedby", "rean-search-status");
    }
    if (statusEl) statusEl.textContent = t("search.hint");
    const openHint = dialog.querySelector("[data-search-open-hint]");
    if (openHint) openHint.textContent = t("search.openHint");

    closeBtn?.addEventListener("click", close);
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) close();
    });
    input?.addEventListener("input", () => {
      window.clearTimeout(input._reanSearchTimer);
      input._reanSearchTimer = window.setTimeout(runQuery, 120);
    });
    input?.addEventListener("keydown", (event) => {
      const items = resultsEl?.querySelectorAll("[data-search-item]") || [];
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActive(Math.min(items.length - 1, activeIndex + 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActive(Math.max(0, activeIndex - 1));
      } else if (event.key === "Enter" && activeIndex >= 0) {
        event.preventDefault();
        items[activeIndex]?.click();
      } else if (event.key === "Escape") {
        close();
      }
    });
  };

  const refreshLabels = () => {
    if (!dialog) return;
    const title = dialog.querySelector("#rean-search-title");
    if (title) title.textContent = t("search.title");
    const titleSr = dialog.querySelector("[data-search-title-sr]");
    if (titleSr) titleSr.textContent = t("search.title");
    const closeBtn = dialog.querySelector("[data-search-close]");
    if (closeBtn) closeBtn.setAttribute("aria-label", t("search.close"));
    if (input) input.placeholder = t("search.placeholder");
    const openHint = dialog.querySelector("[data-search-open-hint]");
    if (openHint) openHint.textContent = t("search.openHint");
    indexPromise = null;
    runQuery();
  };

  const init = () => {
    mountDialog();
    document.querySelectorAll("[data-search-open]").forEach((btn) => {
      btn.addEventListener("click", open);
      btn.setAttribute("aria-label", t("search.open"));
      btn.setAttribute("title", t("search.open"));
    });

    document.addEventListener("keydown", (event) => {
      const tag = (event.target?.tagName || "").toLowerCase();
      const typing =
        tag === "input" || tag === "textarea" || event.target?.isContentEditable;
      if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        open();
        return;
      }
      if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        open();
      }
    });
  };

  window.ReanSearch = { open, close, refreshLabels };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

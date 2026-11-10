/* Shared handbook splitting + checklist key helpers (learn + search). */
(() => {
  const TOC_LINE = (line) =>
    /^## Table of contents$/m.test(line) || line.trim() === "## តារាងខ្លឹមសារ";

  /**
   * Split a full guide.md into chapter sections using CHAPTERS matchers.
   * @param {string} markdown
   * @param {Array<{ id: string, match: RegExp }>} chapters
   * @param {{ clipIntroAtToc?: boolean, stripLeadingHeading?: boolean }} [opts]
   * @returns {Array<{ id: string, body: string, start: number, end: number }>}
   */
  function splitSections(markdown, chapters, opts = {}) {
    const { clipIntroAtToc = false, stripLeadingHeading = false } = opts;
    const list = Array.isArray(chapters) ? chapters : [];
    const lines = String(markdown || "").split("\n");
    const starts = [];

    lines.forEach((line, index) => {
      list.forEach((ch, ci) => {
        if (ch?.match?.test?.(line)) {
          starts.push({ ci, index, id: ch.id });
        }
      });
    });

    starts.sort((a, b) => a.index - b.index);

    return starts.map((s, i) => {
      let end = i + 1 < starts.length ? starts[i + 1].index : lines.length;
      if (clipIntroAtToc && list[s.ci]?.id === "how-to-use") {
        const tocAt = lines.findIndex((line, idx) => idx > s.index && TOC_LINE(line));
        if (tocAt !== -1) end = tocAt;
      }
      let body = lines.slice(s.index, end).join("\n").trim();
      if (stripLeadingHeading) {
        body = body.replace(/^##\s.+\n+/, "");
      }
      return { id: list[s.ci].id, body, start: s.index, end };
    });
  }

  function checklistIndexKey(index) {
    return `i:${Number(index) || 0}`;
  }

  function checklistLegacyKey(li, index) {
    const text = (li?.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
    return text || `item-${index}`;
  }

  /**
   * Prefer index keys (`i:0`). If an older export only has text keys and the
   * count matches, migrate positionally so EN↔KM switches keep progress.
   */
  function normalizeChecklistSaved(saved, itemCount) {
    const raw = saved && typeof saved === "object" ? saved : {};
    const keys = Object.keys(raw);
    if (!keys.length || !itemCount) return {};

    const hasIndex = keys.some((k) => /^i:\d+$/.test(k));
    if (hasIndex) {
      const out = {};
      for (let i = 0; i < itemCount; i += 1) {
        const key = checklistIndexKey(i);
        if (Object.prototype.hasOwnProperty.call(raw, key)) {
          out[key] = Boolean(raw[key]);
        }
      }
      return out;
    }

    if (keys.length === itemCount) {
      const out = {};
      keys.forEach((k, i) => {
        out[checklistIndexKey(i)] = Boolean(raw[k]);
      });
      return out;
    }

    // Partial legacy: keep text keys for same-locale fallback during resolve.
    return { ...raw };
  }

  function resolveChecklistChecked(saved, li, index) {
    const idxKey = checklistIndexKey(index);
    if (Object.prototype.hasOwnProperty.call(saved, idxKey)) {
      return Boolean(saved[idxKey]);
    }
    const legacy = checklistLegacyKey(li, index);
    if (Object.prototype.hasOwnProperty.call(saved, legacy)) {
      return Boolean(saved[legacy]);
    }
    return false;
  }

  function checklistStorageKey(scope) {
    return `rean-docker:checklist:${scope}`;
  }

  function syncChecklistProgress(scope, boxes, opts) {
    const total = boxes.length;
    let done = 0;
    boxes.forEach((input) => {
      if (input.checked) done += 1;
    });
    window.ReanProgress?.record(scope, done, total, opts);
  }

  /**
   * Enable GFM task-list checkboxes and persist ticks (SPA + static pages).
   * Checklist-free pages record a 1/1 visit so "next" can advance.
   */
  function enhanceChecklists(root, scope) {
    if (!root || !scope) return;
    const boxes = root.querySelectorAll('li > input[type="checkbox"]');
    if (!boxes.length) {
      window.ReanProgress?.record(scope, 1, 1);
      return;
    }

    let rawSaved = {};
    try {
      rawSaved = JSON.parse(localStorage.getItem(checklistStorageKey(scope)) || "{}");
    } catch {
      rawSaved = {};
    }

    const saved = normalizeChecklistSaved(rawSaved, boxes.length);

    const persistIndexOnly = () => {
      const indexOnly = {};
      boxes.forEach((input, index) => {
        const key = checklistIndexKey(index);
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

      const key = checklistIndexKey(index);
      input.checked = resolveChecklistChecked(saved, li, index);
      li.classList.toggle("is-done", input.checked);
      saved[key] = input.checked;

      if (input.dataset.reanChecklistBound === "1") return;
      input.dataset.reanChecklistBound = "1";
      input.addEventListener("change", () => {
        saved[key] = input.checked;
        persistIndexOnly();
        li.classList.toggle("is-done", input.checked);
        syncChecklistProgress(scope, boxes, { source: "tick" });
      });
    });

    persistIndexOnly();
    syncChecklistProgress(scope, boxes);
  }

  /**
   * Turn labeled blockquotes into callout / details widgets.
   * Recognizes EN + KM strong labels: Tip, Hint, Expected output, Common error, Pitfall.
   */
  function enhanceCallouts(root) {
    if (!root) return;

    const KIND = [
      {
        re: /^(expected\s*output|លទ្ធផលដែលរំពឹងទុក)\s*:?\s*$/i,
        kind: "expected",
        collapsible: true,
      },
      {
        re: /^(common\s*error|កំហុសទូទៅ)\s*:?\s*$/i,
        kind: "error",
        collapsible: true,
      },
      {
        re: /^(hint|tip|គន្លឹះ|ណែនាំ)\s*:?\s*$/i,
        kind: "hint",
        collapsible: false,
      },
      {
        re: /^(pitfall|អន្ទាក់)\s*:?\s*$/i,
        kind: "pitfall",
        collapsible: false,
      },
    ];

    root.querySelectorAll("blockquote").forEach((bq) => {
      if (bq.closest(".md-callout")) return;
      const first = bq.querySelector("p");
      if (!first) return;
      const strong = first.querySelector(":scope > strong");
      if (!strong) return;

      const label = (strong.textContent || "").replace(/\s+/g, " ").trim();
      const titleText = label.replace(/:$/, "").trim();
      const match = KIND.find((row) => row.re.test(titleText));
      if (!match) return;

      strong.remove();
      if (!(first.textContent || "").trim() && !first.querySelector("*")) {
        first.remove();
      }

      if (match.collapsible) {
        const details = document.createElement("details");
        details.className = `md-callout md-callout-${match.kind}`;
        const summary = document.createElement("summary");
        summary.className = "md-callout-title";
        summary.textContent = titleText;
        const body = document.createElement("div");
        body.className = "md-callout-body";
        while (bq.firstChild) body.appendChild(bq.firstChild);
        details.appendChild(summary);
        details.appendChild(body);
        bq.replaceWith(details);
        return;
      }

      const note = document.createElement("aside");
      note.className = `md-callout md-callout-${match.kind}`;
      note.setAttribute("role", "note");
      const title = document.createElement("p");
      title.className = "md-callout-title";
      title.textContent = titleText;
      const body = document.createElement("div");
      body.className = "md-callout-body";
      body.appendChild(title);
      while (bq.firstChild) body.appendChild(bq.firstChild);
      note.appendChild(body);
      bq.replaceWith(note);
    });
  }

  /**
   * Expand a search query into terms, applying Docker synonym groups so
   * “compose” also hits “docker compose” / “docker-compose”, etc.
   * @returns {string[][]} each inner array is OR-alternatives for one AND-term
   */
  function expandSearchTerms(query) {
    const STOP = new Set([
      "a",
      "an",
      "the",
      "and",
      "or",
      "to",
      "of",
      "in",
      "on",
      "for",
      "with",
      "from",
      "your",
      "how",
      "what",
      "why",
    ]);

    // Longer phrases first. Canon is the group id used for synonym lookup.
    const PHRASES = [
      ["docker-compose", "compose"],
      ["docker compose", "compose"],
      ["multi-stage", "multistage"],
      ["multi stage", "multistage"],
      ["bind-mount", "volume"],
      ["bind mount", "volume"],
      ["health check", "healthcheck"],
      ["github actions", "cicd"],
      ["ci/cd", "cicd"],
    ];

    const GROUPS = {
      compose: ["compose", "docker compose", "docker-compose"],
      volume: ["volume", "volumes", "bind mount", "bind-mount", "named volume"],
      network: ["network", "networks", "bridge network", "service name"],
      dockerfile: ["dockerfile", "docker file"],
      healthcheck: ["healthcheck", "health check", "/health"],
      secret: ["secret", "secrets", "buildkit"],
      multistage: ["multi-stage", "multistage", "multi stage", "slim image"],
      cicd: ["ci", "cd", "ci/cd", "github actions", "pipeline", "workflow"],
      wsl: ["wsl", "wsl2", "windows"],
      image: ["image", "images", "from scratch", "digest"],
      container: ["container", "containers"],
    };

    let q = String(query || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
    if (!q) return [];

    for (const [phrase, canon] of PHRASES) {
      if (q.includes(phrase)) {
        q = q.split(phrase).join(` ${canon} `);
      }
    }

    const rawTerms = q
      .split(/\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 2 && !STOP.has(s));

    const altsFor = (term) => {
      if (GROUPS[term]) return GROUPS[term];
      for (const group of Object.values(GROUPS)) {
        if (group.includes(term)) return group;
      }
      return [term];
    };

    const groups = [];
    const seen = new Set();
    for (const term of rawTerms) {
      const alts = altsFor(term);
      const key = alts[0];
      if (seen.has(key)) continue;
      seen.add(key);
      groups.push([...new Set(alts.map((a) => a.toLowerCase()))]);
    }
    return groups;
  }

  function plainInline(text) {
    return String(text || "")
      .replace(/\[([^\]]*)\]\([^)]+\)/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/\s+/g, " ")
      .trim();
  }

  function clipSummary(text, max = 160) {
    const clean = String(text || "").replace(/\s+/g, " ").trim();
    if (clean.length <= max) return clean;
    const cut = clean.slice(0, max);
    const space = cut.lastIndexOf(" ");
    const base = (space > 80 ? cut.slice(0, space) : cut).replace(/[.,;:]$/, "").trim();
    return `${base}…`;
  }

  /**
   * One-line chapter blurb for link previews.
   * Skip lab headings, code fences, and table chrome. Keep hyphens.
   * A table-only section uses the first data rows. A command-only section uses fence comments.
   */
  function chapterSummary(md) {
    const source = String(md || "");
    const withoutFences = source.replace(/```[\s\S]*?```/g, "\n");
    const prose = [];
    for (const raw of withoutFences.split(/\n{2,}/)) {
      const lines = raw.split("\n").map((line) => line.trim()).filter(Boolean);
      if (!lines.length) continue;
      if (lines.every((line) => /^#{1,6}\s/.test(line))) continue;
      if (lines.every((line) => /^(-{3,}|\*{3,}|_{3,})$/.test(line))) continue;
      if (lines.every((line) => /^\|/.test(line))) continue;
      const parts = lines
        .map((line) =>
          plainInline(
            line
              .replace(/^>\s?/, "")
              .replace(/^[-*]\s+\[[ xX]\]\s+/, "")
              .replace(/^[-*]\s+/, "")
              .replace(/^\d+\.\s+/, "")
          )
        )
        .filter(Boolean);
      const listish = lines.every((line) => /^([-*]|\d+\.)\s+/.test(line));
      const joiner = listish && parts.some((part) => !/[.!?។]$/.test(part)) ? ". " : " ";
      const text = parts.join(joiner);
      if (!text) continue;
      if (text.length < 80 && !/[.!?។]/.test(text)) continue;
      prose.push(text);
    }
    if (prose.length) return clipSummary(prose[0]);

    const rows = [];
    for (const line of source.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("|")) continue;
      const cells = trimmed.split("|").map((cell) => plainInline(cell)).filter(Boolean);
      if (!cells.length || cells.every((cell) => /^:?-{3,}:?$/.test(cell))) continue;
      rows.push(cells);
    }
    if (rows.length >= 2) {
      const bits = rows.slice(1, 4).map((cells) =>
        cells.length > 1 ? `${cells[0]}: ${cells.slice(1).join(", ")}` : cells[0]
      );
      return clipSummary(bits.join(". "));
    }

    const fence = source.match(/```[\s\S]*?```/);
    if (fence) {
      const comments = [];
      for (const line of fence[0].split("\n")) {
        const match = line.match(/^\s*#\s+(.+)$/);
        if (!match) continue;
        const label = plainInline(match[1]);
        // Section labels, not commented-out commands (`# cosign verify …`).
        if (!/^[A-Z0-9\u1780-\u17FF]/.test(label)) continue;
        comments.push(label);
      }
      if (comments.length >= 2) return clipSummary(comments.join(", "));
    }
    return "";
  }

  /** Handbook chapter numbers are the ids "1"…"20". Front matter and appendix are not numbered. */
  function handbookChapterNumber(id) {
    const raw = String(id ?? "");
    if (!/^\d+$/.test(raw)) return "";
    return raw.padStart(2, "0");
  }

  window.ReanGuide = {
    handbookChapterNumber,
    chapterSummary,
    splitSections,
    checklistIndexKey,
    checklistLegacyKey,
    normalizeChecklistSaved,
    resolveChecklistChecked,
    checklistStorageKey,
    enhanceChecklists,
    enhanceCallouts,
    expandSearchTerms,
  };
})();

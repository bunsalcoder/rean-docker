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

  window.ReanGuide = {
    splitSections,
    checklistIndexKey,
    checklistLegacyKey,
    normalizeChecklistSaved,
    resolveChecklistChecked,
    enhanceCallouts,
    expandSearchTerms,
  };
})();

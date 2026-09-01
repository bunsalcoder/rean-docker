(() => {
  const PROGRESS_KEY = "rean-docker:progress";
  const LAB_IDS = window.ReanRoutes?.LAB_IDS || [];
  const CHAPTER_IDS = () => (window.ReanRoutes?.CHAPTERS || []).map((ch) => ch.id);

  const t = (key, vars) => (window.ReanI18n ? window.ReanI18n.t(key, vars) : key);

  const localeHref = (href) => window.ReanI18n?.localeHref?.(href) ?? href;

  const readAll = () => {
    try {
      return JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}") || {};
    } catch {
      return {};
    }
  };

  const writeAll = (data) => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
    } catch {
      /* private mode / quota */
    }
  };

  const record = (scope, done, total) => {
    if (!scope || !Number.isFinite(total) || total < 1) return;
    const safeDone = Math.max(0, Math.min(Number(done) || 0, total));
    const data = readAll();
    data[scope] = { done: safeDone, total, updatedAt: Date.now() };
    writeAll(data);
    window.dispatchEvent(
      new CustomEvent("rean:progress", { detail: { scope, done: safeDone, total } })
    );
  };

  const entry = (scope) => {
    const row = readAll()[scope];
    if (!row || !row.total) return null;
    return {
      done: Number(row.done) || 0,
      total: Number(row.total) || 0,
      complete: (Number(row.done) || 0) >= (Number(row.total) || 0),
    };
  };

  const labEntries = () =>
    LAB_IDS.map((id) => {
      const stats = entry(`lab:${id}`);
      return {
        id,
        num: id.slice(0, 2),
        title: t(`labMeta.${id}`),
        href: localeHref(`./lab.html?id=${encodeURIComponent(id)}`),
        done: stats?.done || 0,
        total: stats?.total || 0,
        started: Boolean(stats),
        complete: Boolean(stats?.complete),
      };
    });

  const chapterEntries = () =>
    CHAPTER_IDS().map((id, index) => {
      const stats = entry(`learn:${id}`);
      return {
        id,
        num: String(index + 1).padStart(2, "0"),
        title: t(`chapter.${id}`),
        href: localeHref(`./learn.html?c=${encodeURIComponent(id)}`),
        done: stats?.done || 0,
        total: stats?.total || 0,
        started: Boolean(stats),
        complete: Boolean(stats?.complete),
      };
    });

  const summarizeLabs = () => {
    const labs = labEntries();
    const started = labs.filter((l) => l.started).length;
    const complete = labs.filter((l) => l.complete).length;
    const next = labs.find((l) => !l.complete) || null;
    return { labs, started, complete, total: labs.length, next };
  };

  const summarizeChapters = () => {
    const chapters = chapterEntries();
    const started = chapters.filter((c) => c.started).length;
    const complete = chapters.filter((c) => c.complete).length;
    const next = chapters.find((c) => !c.complete) || null;
    return { chapters, started, complete, total: chapters.length, next };
  };

  const pct = (done, total) => {
    if (!total) return 0;
    return Math.round((100 * done) / total);
  };

  const renderMeter = ({ complete, total, labelKey, ariaKey }) => {
    const fill = pct(complete, total);
    return `
      <div class="progress-meter" role="img" aria-label="${t(ariaKey, { complete, total })}">
        <div class="progress-meter-track">
          <div class="progress-meter-fill" style="width:${fill}%"></div>
        </div>
        <p class="progress-meter-label">${t(labelKey, { complete, total })}</p>
      </div>`;
  };

  const renderHome = (root) => {
    if (!root) return;
    const labStats = summarizeLabs();
    const chapterStats = summarizeChapters();
    const { labs, complete: labsComplete, total: labsTotal, next: nextLab, started: labsStarted } =
      labStats;
    const {
      chapters,
      complete: chaptersComplete,
      total: chaptersTotal,
      next: nextChapter,
      started: chaptersStarted,
    } = chapterStats;

    if (!labsStarted && !chaptersStarted) {
      root.innerHTML = `
        <div class="progress-empty">
          <p>${t("progress.empty")}</p>
          <div class="cta-row">
            <a class="btn btn-primary" href="${localeHref("./learn.html")}">${t("progress.startLearn")}</a>
            <a class="btn btn-ghost" href="${localeHref("./labs.html")}">${t("progress.startLabs")}</a>
          </div>
        </div>`;
      return;
    }

    const nextBlocks = [];
    if (nextChapter && chaptersStarted) {
      nextBlocks.push(`<a class="progress-next" href="${nextChapter.href}">
           <span class="eyebrow">${t("progress.nextChapter")}</span>
           <strong>${nextChapter.num} · ${nextChapter.title}</strong>
           <span class="progress-next-meta">${
             nextChapter.started
               ? t("progress.partial", { done: nextChapter.done, total: nextChapter.total })
               : t("progress.notStarted")
           }</span>
         </a>`);
    }
    if (nextLab && labsStarted) {
      nextBlocks.push(`<a class="progress-next" href="${nextLab.href}">
           <span class="eyebrow">${t("progress.nextLab")}</span>
           <strong>${nextLab.num} · ${nextLab.title}</strong>
           <span class="progress-next-meta">${
             nextLab.started
               ? t("progress.partial", { done: nextLab.done, total: nextLab.total })
               : t("progress.notStarted")
           }</span>
         </a>`);
    }

    const doneMsg =
      chaptersComplete === chaptersTotal && labsComplete === labsTotal
        ? `<p class="progress-done-msg">${t("progress.allDoneBoth")}</p>`
        : chaptersComplete === chaptersTotal && chaptersStarted
          ? `<p class="progress-done-msg">${t("progress.allChaptersDone")}</p>`
          : labsComplete === labsTotal && labsStarted
            ? `<p class="progress-done-msg">${t("progress.allDone")}</p>`
            : "";

    root.innerHTML = `
      <div class="progress-summary progress-summary-dual">
        ${chaptersStarted ? renderMeter({
          complete: chaptersComplete,
          total: chaptersTotal,
          labelKey: "progress.chaptersCount",
          ariaKey: "progress.chaptersAria",
        }) : ""}
        ${labsStarted ? renderMeter({
          complete: labsComplete,
          total: labsTotal,
          labelKey: "progress.labsCount",
          ariaKey: "progress.labsAria",
        }) : ""}
        ${nextBlocks.join("") || doneMsg}
      </div>
      ${
        labsStarted
          ? `<ol class="progress-lab-dots" aria-label="${t("progress.labsLegend")}">
        ${labs
          .map(
            (lab) => `<li>
              <a href="${lab.href}" class="${lab.complete ? "is-complete" : lab.started ? "is-started" : ""}" title="${lab.title}">
                <span class="visually-hidden">${lab.num} ${lab.title}${
              lab.complete
                ? ` — ${t("progress.complete")}`
                : lab.started
                  ? ` — ${t("progress.partial", { done: lab.done, total: lab.total })}`
                  : ` — ${t("progress.notStarted")}`
            }</span>
                <span aria-hidden="true">${lab.num}</span>
              </a>
            </li>`
          )
          .join("")}
      </ol>`
          : ""
      }`;
  };

  const decorateSideNav = (nav, entries, idAttr) => {
    if (!nav) return;
    const byId = Object.fromEntries(entries.map((row) => [row.id, row]));
    nav.querySelectorAll(`a[${idAttr}]`).forEach((link) => {
      const id = link.getAttribute(idAttr);
      const row = byId[id];
      link.classList.remove("is-complete", "is-started");
      if (!row?.started) return;
      link.classList.add(row.complete ? "is-complete" : "is-started");
    });
  };

  const decorateChapterNav = (nav) => decorateSideNav(nav, chapterEntries(), "data-chapter-id");

  const decorateLabNav = (nav) => decorateSideNav(nav, labEntries(), "data-lab-id");

  const decorateLabGrid = (grid) => {
    if (!grid) return;
    const byId = Object.fromEntries(labEntries().map((l) => [l.id, l]));
    grid.querySelectorAll("a[href*='lab.html']").forEach((link) => {
      let id = "";
      try {
        id = new URL(link.href, location.href).searchParams.get("id") || "";
      } catch {
        id = "";
      }
      const lab = byId[id];
      link.classList.remove("is-complete", "is-started");
      link.querySelector(".lab-progress")?.remove();
      if (!lab?.started) return;
      link.classList.add(lab.complete ? "is-complete" : "is-started");
      const badge = document.createElement("span");
      badge.className = "lab-progress";
      badge.textContent = lab.complete
        ? t("progress.complete")
        : t("progress.partial", { done: lab.done, total: lab.total });
      const host = link.querySelector("div") || link;
      host.appendChild(badge);
    });
  };

  const renderLabsPanel = (root) => {
    if (!root) return;
    const { complete, total, started, next } = summarizeLabs();
    if (!started) {
      root.hidden = true;
      root.innerHTML = "";
      return;
    }
    root.hidden = false;
    const fill = pct(complete, total);
    root.innerHTML = `
      <div class="progress-summary is-compact">
        <div class="progress-meter" role="img" aria-label="${t("progress.labsAria", {
          complete,
          total,
        })}">
          <div class="progress-meter-track">
            <div class="progress-meter-fill" style="width:${fill}%"></div>
          </div>
          <p class="progress-meter-label">${t("progress.labsCount", {
            complete,
            total,
          })}</p>
        </div>
        ${
          next
            ? `<a class="btn btn-ghost" href="${next.href}">${t("progress.continue")} ${next.num}</a>`
            : `<p class="progress-done-msg">${t("progress.allDone")}</p>`
        }
      </div>`;
  };

  const init = () => {
    const home = document.querySelector("[data-progress-home]");
    if (home) renderHome(home);

    const labsPanel = document.querySelector("[data-progress-labs]");
    if (labsPanel) renderLabsPanel(labsPanel);

    const grid = document.querySelector(".lab-grid");
    if (grid) decorateLabGrid(grid);

    decorateChapterNav(document.querySelector("[data-chapter-nav]"));
    decorateLabNav(document.querySelector("[data-lab-nav]"));
  };

  window.ReanProgress = {
    record,
    entry,
    labEntries,
    chapterEntries,
    summarizeLabs,
    summarizeChapters,
    decorateChapterNav,
    decorateLabNav,
    init,
    LAB_IDS,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.addEventListener("rean:progress", () => init());
})();

(() => {
  const PROGRESS_KEY = "rean-docker:progress";
  const LAB_IDS = [
    "01-isolation-basics",
    "02-hello",
    "03-dockerfile",
    "04-env-secrets",
    "05-compose",
    "06-networks",
    "07-volumes",
    "08-multi-stage",
    "09-production",
    "10-debugging",
    "11-security",
    "12-ci-cd",
    "13-capstone",
  ];

  const t = (key, vars) => (window.ReanI18n ? window.ReanI18n.t(key, vars) : key);

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
        href: `./lab.html?id=${encodeURIComponent(id)}`,
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

  const pct = (done, total) => {
    if (!total) return 0;
    return Math.round((100 * done) / total);
  };

  const renderHome = (root) => {
    if (!root) return;
    const { labs, complete, total, next, started } = summarizeLabs();
    const fill = pct(complete, total);

    if (!started) {
      root.innerHTML = `
        <div class="progress-empty">
          <p>${t("progress.empty")}</p>
          <div class="cta-row">
            <a class="btn btn-primary" href="./learn.html">${t("progress.startLearn")}</a>
            <a class="btn btn-ghost" href="./labs.html">${t("progress.startLabs")}</a>
          </div>
        </div>`;
      return;
    }

    const nextBlock = next
      ? `<a class="progress-next" href="${next.href}">
           <span class="eyebrow">${t("progress.next")}</span>
           <strong>${next.num} · ${next.title}</strong>
           <span class="progress-next-meta">${
             next.started
               ? t("progress.partial", { done: next.done, total: next.total })
               : t("progress.notStarted")
           }</span>
         </a>`
      : `<p class="progress-done-msg">${t("progress.allDone")}</p>`;

    root.innerHTML = `
      <div class="progress-summary">
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
        ${nextBlock}
      </div>
      <ol class="progress-lab-dots" aria-label="${t("progress.labsLegend")}">
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
      </ol>`;
  };

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
  };

  window.ReanProgress = {
    record,
    entry,
    labEntries,
    summarizeLabs,
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

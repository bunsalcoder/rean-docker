(() => {
  const LOCALE_KEY = "rean-locale";
  const LOCALES = ["en", "km"];
  const DEFAULT_LOCALE = "en";

  const EN = {
    "nav.home": "Home",
    "nav.learn": "Learn",
    "nav.labs": "Labs",
    "nav.cheatsheet": "Cheat sheet",
    "nav.menu": "Menu",
    "a11y.skip": "Skip to content",
    "notFound.title": "Not found — rean-docker",
    "notFound.description": "This page is not in the rean-docker learning site.",
    "notFound.heading": "Page not found",
    "notFound.body": "That URL is not part of the rean-docker site.",
    "lang.group": "Language",
    "theme.toDark": "Switch to dark theme",
    "theme.toLight": "Switch to light theme",
    "home.title": "rean-docker — Learn Docker from zero to hero",
    "home.description":
      "rean-docker is a hands-on path to learn Docker — from first containers to Compose, volumes, networks, production practices, and deploy/CI/CD.",
    "home.lead":
      "Hands-on Docker from first container to production — chapters, commands, and labs you run yourself.",
    "home.ctaLearn": "Start learning",
    "home.ctaLabs": "Open labs",
    "home.pathEyebrow": "The path",
    "home.pathTitle": "Twenty chapters. Thirteen labs. One clear route.",
    "home.pathLead": "Read a chapter, then practice. The site mirrors the handbook in this repository.",
    "home.meta.beginner": "Beginner",
    "home.meta.beginnerLab01": "Beginner · Lab 01",
    "home.meta.beginnerLab02": "Beginner · Lab 02",
    "home.meta.beginnerLab03": "Beginner · Lab 03",
    "home.meta.intermediateLab04": "Intermediate · Lab 04",
    "home.meta.intermediateLab05": "Intermediate · Lab 05",
    "home.meta.advancedLab09": "Advanced · Lab 09",
    "home.meta.specialLab12": "Special · Lab 12",
    "home.path.01": "Why Docker exists",
    "home.path.02": "Containerization (foundations)",
    "home.path.05": "Your first containers",
    "home.path.07": "Write a Dockerfile",
    "home.path.10": "Environment, secrets, and config",
    "home.path.11": "Compose multi-service apps",
    "home.path.13": "Production habits",
    "home.path.17": "Deploy with Docker & CI/CD",
    "home.howEyebrow": "How it works",
    "home.howTitle": "Type the commands. Don’t only read them.",
    "home.howLeadBefore": "Each lesson maps to files under ",
    "home.howLeadAfter":
      " in the repo. Use this site as your guide, and your terminal as the workout room.",
    "home.howCta": "Browse labs",
    "home.footer": "Learn Docker · phone, tablet, and desktop",
    "labs.title": "Labs — rean-docker",
    "labs.description": "Hands-on Docker labs for the rean-docker learning path.",
    "labs.eyebrow": "Practice",
    "labs.heading": "Labs",
    "labs.intro":
      "Work through these in order. Lab numbers match the path: 01 isolation, 02 workflow, 03 Dockerfile, 04 env/secrets, then Compose and the rest. Each lab lives under labs/ — open a terminal next to this page.",
    "labs.back": "Back to curriculum",
    "labs.01.title": "Isolation basics",
    "labs.01.desc": "Beginner: see process, file, network, and memory isolation.",
    "labs.02.title": "Hello containers",
    "labs.02.desc": "Run, publish ports, read logs, clean up.",
    "labs.03.title": "Your first Dockerfile",
    "labs.03.desc": "Build and run a small Node API image.",
    "labs.04.title": "Env, secrets, and config",
    "labs.04.desc": "Pass config at runtime; see why secrets must not live in image layers.",
    "labs.05.title": "Compose stack",
    "labs.05.desc": "API + Postgres + Redis with healthchecks and .env config.",
    "labs.06.title": "Networks & DNS",
    "labs.06.desc": "Reach services by container name.",
    "labs.07.title": "Volumes & persistence",
    "labs.07.desc": "Keep database data after containers die.",
    "labs.08.title": "Multi-stage builds",
    "labs.08.desc": "Compare fat vs slim production images.",
    "labs.09.title": "Production practices",
    "labs.09.desc": "Healthchecks, limits, read-only rootfs, dropped capabilities.",
    "labs.10.title": "Debugging",
    "labs.10.desc": "logs, inspect, and a Compose hostname bug you fix.",
    "labs.11.title": "Security essentials",
    "labs.11.desc": "Non-root, BuildKit secrets, and image scanning.",
    "labs.12.title": "Deploy & CI/CD",
    "labs.12.desc": "Special: validate, smoke-test, tag, and ship with Compose + Actions.",
    "labs.13.title": "Capstone",
    "labs.13.desc": "Build your own API + Postgres + Redis stack.",
    "learn.title": "Learn — rean-docker",
    "learn.description": "Read the rean-docker Docker curriculum chapter by chapter.",
    "learn.chapters": "Chapters",
    "learn.curriculum": "Curriculum",
    "learn.loading": "Loading…",
    "learn.loadingShort": "Loading",
    "learn.fetching": "Fetching handbook…",
    "learn.chapterOf": "Chapter {n} of {total}",
    "learn.prev": "Previous",
    "learn.next": "Next",
    "learn.loadError": "Could not load lessons.",
    "learn.serveHint":
      "Serve the web/ folder over HTTP (for example npx serve web), then open the site from that URL.",
    "lab.title": "Lab — rean-docker",
    "lab.description": "Hands-on Docker lab instructions for rean-docker.",
    "lab.sidebar": "Labs",
    "lab.all": "All labs",
    "lab.menu": "Labs menu",
    "lab.eyebrow": "Hands-on",
    "lab.fetching": "Fetching lab…",
    "lab.of": "Lab {n} of {total} · {level}",
    "lab.prev": "Previous lab",
    "lab.next": "Next lab",
    "lab.loadError": "Could not load lab.",
    "lab.serveHint": "Serve the web/ folder over HTTP.",
    "lab.level.beginner": "Beginner",
    "lab.level.intermediate": "Intermediate",
    "lab.level.advanced": "Advanced",
    "lab.level.special": "Special",
    "copy": "Copy",
    "copied": "Copied",
    "copyFailed": "Failed",
    "chapter.how-to-use": "How to use this guide",
    "chapter.1": "What problem does Docker solve?",
    "chapter.2": "Containerization foundations",
    "chapter.3": "Core mental model",
    "chapter.4": "Install & verify",
    "chapter.5": "Your first containers",
    "chapter.6": "Images deeply explained",
    "chapter.7": "Dockerfile — build your own images",
    "chapter.8": "Volumes — keep data alive",
    "chapter.9": "Networks — how containers talk",
    "chapter.10": "Environment, secrets, and config",
    "chapter.11": "Docker Compose — multi-container apps",
    "chapter.12": "Multi-stage builds & image size",
    "chapter.13": "Production-minded practices",
    "chapter.14": "Debugging & troubleshooting",
    "chapter.15": "Security essentials",
    "chapter.16": "Advanced topics",
    "chapter.17": "Deploy with Docker & CI/CD",
    "chapter.18": "Capstone project",
    "chapter.19": "Cheat sheet",
    "chapter.20": "Learning path checklist",
    "labMeta.01-isolation-basics": "Isolation basics",
    "labMeta.02-hello": "Hello containers",
    "labMeta.03-dockerfile": "Your first Dockerfile",
    "labMeta.04-env-secrets": "Env, secrets, and config",
    "labMeta.05-compose": "Compose stack",
    "labMeta.06-networks": "Networks & DNS",
    "labMeta.07-volumes": "Volumes & persistence",
    "labMeta.08-multi-stage": "Multi-stage builds",
    "labMeta.09-production": "Production practices",
    "labMeta.10-debugging": "Debugging",
    "labMeta.11-security": "Security essentials",
    "labMeta.12-ci-cd": "Deploy & CI/CD",
    "labMeta.13-capstone": "Capstone",
    "progress.eyebrow": "Your progress",
    "progress.title": "Pick up where you left off",
    "progress.lead": "Checklist ticks on Learn and Lab pages stay on this device.",
    "progress.empty": "Open a lab and tick its success criteria — progress will show up here.",
    "progress.startLearn": "Start learning",
    "progress.startLabs": "Browse labs",
    "progress.next": "Continue with",
    "progress.continue": "Continue",
    "progress.partial": "{done}/{total}",
    "progress.notStarted": "Not started",
    "progress.complete": "Done",
    "progress.allDone": "All lab checklists complete. Nice work.",
    "progress.labsCount": "{complete} of {total} labs complete",
    "progress.labsAria": "Lab progress: {complete} of {total} complete",
    "progress.labsLegend": "Lab completion map",
    "search.title": "Search",
    "search.open": "Search chapters and labs",
    "search.close": "Close search",
    "search.placeholder": "Search Docker topics, commands, labs…",
    "search.hint": "Try “compose”, “volume”, or “healthcheck”.",
    "search.loading": "Searching…",
    "search.empty": "No matches. Try another word.",
    "search.error": "Could not load content for search. Serve the site over HTTP.",
    "search.count": "{n} results",
    "search.kindChapter": "Chapter",
    "search.kindLab": "Lab",
    "search.openHint": "or Ctrl/⌘ K to open search",
  };

  const STRINGS = {
    en: EN,
    km: { ...EN, ...(window.REAN_I18N_KM || {}) },
  };

  const normalize = (value) => (LOCALES.includes(value) ? value : null);

  const detectBrowserLocale = () => {
    const languages = Array.isArray(navigator.languages) ? navigator.languages : [navigator.language];
    for (const lang of languages) {
      if (!lang) continue;
      const base = String(lang).toLowerCase().split("-")[0];
      if (base === "km") return "km";
      if (base === "en") return "en";
    }
    return DEFAULT_LOCALE;
  };

  const readStored = () => {
    try {
      return normalize(localStorage.getItem(LOCALE_KEY));
    } catch {
      return null;
    }
  };

  const resolveLocale = () => readStored() || detectBrowserLocale() || DEFAULT_LOCALE;

  let currentLocale = resolveLocale();

  const t = (key, vars = {}) => {
    const table = STRINGS[currentLocale] || STRINGS.en;
    let text = table[key] ?? STRINGS.en[key] ?? key;
    Object.entries(vars).forEach(([name, value]) => {
      text = text.replaceAll(`{${name}}`, String(value));
    });
    return text;
  };

  const contentPath = (relativePath) => {
    const clean = String(relativePath || "").replace(/^\.\//, "").replace(/^\/+/, "");
    return `./content/${currentLocale}/${clean}`;
  };

  const applyDocumentMeta = () => {
    document.documentElement.lang = currentLocale === "km" ? "km" : "en";
    document.documentElement.dataset.locale = currentLocale;
  };

  const applyStaticStrings = () => {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      el.textContent = t(key);
    });

    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      const spec = el.getAttribute("data-i18n-attr");
      if (!spec) return;
      spec.split(";").forEach((part) => {
        const [attr, key] = part.split(":").map((s) => s.trim());
        if (attr && key) el.setAttribute(attr, t(key));
      });
    });

    const titleKey = document.body?.dataset?.i18nTitle;
    if (titleKey) document.title = t(titleKey);

    const desc = document.querySelector('meta[name="description"]');
    const descKey = document.body?.dataset?.i18nDescription;
    if (desc && descKey) desc.setAttribute("content", t(descKey));

    window.ReanSeo?.sync();
  };

  const reduceMotion = () =>
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const syncLangSwitch = (locale = currentLocale) => {
    document.querySelectorAll(".lang-switch").forEach((group) => {
      group.querySelectorAll("[data-set-lang]").forEach((btn) => {
        const lang = btn.getAttribute("data-set-lang");
        const active = lang === locale;
        btn.setAttribute("aria-pressed", String(active));
        btn.classList.toggle("is-active", active);
      });
    });
  };

  const apply = () => {
    // Refresh km pack if the km script loaded after this file
    STRINGS.km = { ...EN, ...(window.REAN_I18N_KM || {}) };
    applyDocumentMeta();
    applyStaticStrings();
    syncLangSwitch();
  };

  const setLocale = (next, { reload = true } = {}) => {
    const locale = normalize(next) || DEFAULT_LOCALE;
    currentLocale = locale;
    try {
      localStorage.setItem(LOCALE_KEY, locale);
    } catch {
      /* private mode */
    }
    if (reload) {
      const switches = document.querySelectorAll(".lang-switch");
      switches.forEach((group) => {
        group.setAttribute("data-pending", locale);
      });
      syncLangSwitch(locale);

      if (reduceMotion() || !switches.length) {
        applyDocumentMeta();
        location.reload();
        return;
      }

      // Let the thumb spring across before the page swaps language content
      window.setTimeout(() => {
        applyDocumentMeta();
        location.reload();
      }, 380);
      return;
    }
    applyDocumentMeta();
    apply();
    window.dispatchEvent(new CustomEvent("rean:localechange", { detail: { locale } }));
  };

  const initLangSwitch = () => {
    document.querySelectorAll("[data-set-lang]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.getAttribute("data-set-lang");
        if (!lang || lang === currentLocale) return;
        setLocale(lang, { reload: true });
      });
    });
  };

  window.ReanI18n = {
    LOCALES,
    get locale() {
      return currentLocale;
    },
    t,
    contentPath,
    apply,
    setLocale,
    initLangSwitch,
  };

  applyDocumentMeta();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      apply();
      initLangSwitch();
    });
  } else {
    apply();
    initLangSwitch();
  }
})();

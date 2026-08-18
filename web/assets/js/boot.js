(() => {
  // Must load synchronously in <head> (no defer/async) so theme/locale apply
  // before first paint, and <rean-header> is defined before the parser hits it.
  try {
    const storedTheme = localStorage.getItem("rean-theme");
    const theme =
      storedTheme === "light" || storedTheme === "dark"
        ? storedTheme
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    document.documentElement.dataset.theme = theme;
    const metaScheme = document.querySelector('meta[name="color-scheme"]');
    const metaColor = document.querySelector('meta[name="theme-color"]');
    if (metaScheme) metaScheme.content = theme;
    if (metaColor) metaColor.content = theme === "dark" ? "#0b1622" : "#f2f6fa";
  } catch (_) {
    document.documentElement.dataset.theme = "light";
  }

  try {
    const storedLocale = localStorage.getItem("rean-locale");
    let locale = storedLocale === "km" || storedLocale === "en" ? storedLocale : null;
    if (!locale) {
      const langs = Array.isArray(navigator.languages) ? navigator.languages : [navigator.language];
      locale = langs.some((l) => String(l || "").toLowerCase().startsWith("km")) ? "km" : "en";
    }
    document.documentElement.lang = locale === "km" ? "km" : "en";
    document.documentElement.dataset.locale = locale;
  } catch (_) {
    document.documentElement.lang = "en";
    document.documentElement.dataset.locale = "en";
  }

  if (typeof customElements === "undefined" || customElements.get("rean-header")) return;

  customElements.define(
    "rean-header",
    class extends HTMLElement {
      connectedCallback() {
        if (this.dataset.mounted) return;
        this.dataset.mounted = "true";
        this.innerHTML = `
      <div class="wrap">
        <a class="logo" href="./index.html">rean<span>-docker</span></a>
        <nav class="nav" data-nav>
          <a href="./index.html" data-i18n="nav.home">Home</a>
          <a href="./learn.html" data-i18n="nav.learn">Learn</a>
          <a href="./labs.html" data-i18n="nav.labs">Labs</a>
          <a href="./learn.html?c=19" data-i18n="nav.cheatsheet">Cheat sheet</a>
        </nav>
        <div class="header-actions">
          <div class="lang-switch" role="group" data-i18n-attr="aria-label:lang.group">
            <button type="button" data-set-lang="en" aria-pressed="false">EN</button>
            <button type="button" data-set-lang="km" aria-pressed="false">ខ្មែរ</button>
          </div>
          <button class="theme-toggle" type="button" data-theme-toggle aria-label="Switch to dark theme" aria-pressed="false">
            <svg class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
              <mask id="theme-icon-mask" class="theme-icon-mask">
                <rect width="24" height="24" fill="#fff" />
                <circle class="theme-icon-hole" cx="12" cy="12" r="8" fill="#000" />
              </mask>
              <circle class="theme-icon-core" cx="12" cy="12" r="5" mask="url(#theme-icon-mask)" />
              <g class="theme-icon-rays">
                <line x1="12" y1="1.5" x2="12" y2="3.5" />
                <line x1="12" y1="20.5" x2="12" y2="22.5" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1.5" y1="12" x2="3.5" y2="12" />
                <line x1="20.5" y1="12" x2="22.5" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </g>
            </svg>
          </button>
          <button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" data-i18n-attr="aria-label:nav.menu" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>`;
      }
    }
  );
})();

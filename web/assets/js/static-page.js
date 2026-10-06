(() => {
  // Nested static chapter/lab pages: force locale from filename before boot.js,
  // and send EN/ខ្មែរ switches to the twin HTML file (content is baked in).
  const file = (location.pathname.split("/").pop() || "").split("?")[0];
  const isKm = file.endsWith(".km.html");
  const locale = isKm ? "km" : "en";

  try {
    localStorage.setItem("rean-locale", locale);
  } catch {
    /* private mode */
  }

  document.documentElement.lang = locale === "km" ? "km" : "en";
  document.documentElement.dataset.locale = locale;

  const bindLangSwitch = () => {
    const twin = document.body?.dataset?.staticTwin;
    const pageLocale = document.body?.dataset?.staticLocale;
    if (!twin || !pageLocale) return;

    document.querySelectorAll("[data-set-lang]").forEach((btn) => {
      btn.addEventListener(
        "click",
        (event) => {
          const want = btn.getAttribute("data-set-lang");
          if (!want || want === pageLocale) return;
          event.preventDefault();
          event.stopImmediatePropagation();
          try {
            localStorage.setItem("rean-locale", want);
          } catch {
            /* private mode */
          }
          location.href = twin;
        },
        true
      );
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindLangSwitch, { once: true });
  } else {
    bindLangSwitch();
  }
})();

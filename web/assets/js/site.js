(() => {
  const header = document.querySelector(".site-header");
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NAV_INDICATOR_KEY = "rean-nav-indicator";
  const THEME_KEY = "rean-theme";
  const THEME_COLOR = { light: "#f2f6fa", dark: "#0b1622" };
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  const resolveTheme = () => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === "light" || stored === "dark") return stored;
    } catch {
      /* private mode */
    }
    return prefersDark.matches ? "dark" : "light";
  };

  const applyTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
    const metaScheme = document.querySelector('meta[name="color-scheme"]');
    const metaColor = document.querySelector('meta[name="theme-color"]');
    if (metaScheme) metaScheme.content = theme;
    if (metaColor) metaColor.content = THEME_COLOR[theme] || THEME_COLOR.light;
    if (themeToggle) {
      const next = theme === "dark" ? "light" : "dark";
      const label =
        window.ReanI18n?.t(next === "dark" ? "theme.toDark" : "theme.toLight") ||
        `Switch to ${next} theme`;
      themeToggle.setAttribute("aria-label", label);
      themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
    }
  };

  applyTheme(resolveTheme());

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* private mode */
      }
      applyTheme(next);
    });
  }

  const onPrefersChange = () => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === "light" || stored === "dark") return;
    } catch {
      /* private mode */
    }
    applyTheme(prefersDark.matches ? "dark" : "light");
  };

  if (typeof prefersDark.addEventListener === "function") {
    prefersDark.addEventListener("change", onPrefersChange);
  } else if (typeof prefersDark.addListener === "function") {
    prefersDark.addListener(onPrefersChange);
  }

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      });
    });
  }

  // Mark current nav item (query-aware for cheat sheet)
  const path = location.pathname.replace(/index\.html$/, "");
  const pageC = new URLSearchParams(location.search).get("c");
  const navLinks = Array.from(document.querySelectorAll(".nav a"));
  const hasSpecificChapterLink = (chapterId) =>
    navLinks.some((other) => {
      const href = other.getAttribute("href");
      if (!href) return false;
      return new URL(href, location.href).searchParams.get("c") === chapterId;
    });

  navLinks.forEach((a) => {
    a.removeAttribute("aria-current");
    const href = a.getAttribute("href");
    if (!href) return;
    const target = new URL(href, location.href);
    const samePath =
      target.pathname.replace(/index\.html$/, "") === path ||
      (path.endsWith("/web/") && href.includes("index.html"));
    if (!samePath) return;
    const linkC = target.searchParams.get("c");
    if (linkC && pageC !== linkC) return;
    // Generic Learn should not win over a dedicated chapter deep-link (e.g. Cheat sheet)
    if (!linkC && pageC != null && hasSpecificChapterLink(pageC)) return;
    a.setAttribute("aria-current", "page");
  });

  // Flying underline: one transform-only slide after each page load
  const initNavIndicator = () => {
    if (!nav || window.matchMedia("(max-width: 720px)").matches) return;

    let indicator = nav.querySelector(".nav-indicator");
    if (!indicator) {
      indicator = document.createElement("span");
      indicator.className = "nav-indicator";
      indicator.setAttribute("aria-hidden", "true");
      nav.appendChild(indicator);
    }

    const measure = (link) => {
      if (!link) return null;
      const navRect = nav.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      return {
        left: linkRect.left - navRect.left,
        width: Math.max(linkRect.width, 1),
      };
    };

    const setTransform = (pos) => {
      indicator.style.transform = `translate3d(${pos.left}px, 0, 0) scaleX(${pos.width})`;
    };

    const apply = (pos, { instant = false } = {}) => {
      if (!pos) {
        indicator.classList.remove("is-ready");
        return;
      }
      if (instant || reduceMotion) {
        indicator.style.transition = "none";
        setTransform(pos);
        indicator.classList.add("is-ready");
        void indicator.offsetWidth;
        indicator.style.transition = "";
        return;
      }
      indicator.classList.add("is-ready");
      setTransform(pos);
    };

    const save = (pos) => {
      if (!pos) return;
      try {
        sessionStorage.setItem(NAV_INDICATOR_KEY, JSON.stringify(pos));
      } catch {
        /* private mode */
      }
    };

    const readSaved = () => {
      try {
        const raw = sessionStorage.getItem(NAV_INDICATOR_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    };

    const current = nav.querySelector('a[aria-current="page"]');
    const next = measure(current);
    const prev = readSaved();
    const shouldFly =
      prev &&
      next &&
      !reduceMotion &&
      (Math.abs(prev.left - next.left) > 1 || Math.abs(prev.width - next.width) > 1);

    if (shouldFly) {
      // Sit at the previous tab instantly, then one uninterrupted glide
      apply(prev, { instant: true });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => apply(next));
      });
    } else {
      apply(next, { instant: true });
    }
    save(next);

    // Only remember origin — do not animate mid-navigation (that causes the hitch)
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("pointerdown", () => {
        const from = measure(nav.querySelector('a[aria-current="page"]'));
        if (from) save(from);
      });
    });

    let resizeTimer = 0;
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (window.matchMedia("(max-width: 720px)").matches) return;
        const pos = measure(nav.querySelector('a[aria-current="page"]'));
        apply(pos, { instant: true });
        save(pos);
      }, 80);
    });
  };

  initNavIndicator();

  // Below-fold reveals: armed after leaving the hero, then one soft staggered pass per section
  const revealBlocks = document.querySelectorAll(".reveal-block");
  if (!revealBlocks.length) return;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealBlocks.forEach((el) => el.classList.add("is-in"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.22, rootMargin: "0px 0px -10% 0px" }
  );

  let armed = false;
  const armReveals = () => {
    if (armed) return;
    armed = true;
    revealBlocks.forEach((el) => {
      const top = el.getBoundingClientRect().top;
      // Already mid-viewport while scrolling — play immediately so motion is seen
      if (top < window.innerHeight * 0.8) {
        el.classList.add("is-in");
      } else {
        io.observe(el);
      }
    });
  };

  // Stay quiet on the hero; start listening once the user scrolls away
  const onRevealScroll = () => {
    if (window.scrollY < 56) return;
    armReveals();
    window.removeEventListener("scroll", onRevealScroll);
  };
  window.addEventListener("scroll", onRevealScroll, { passive: true });
})();

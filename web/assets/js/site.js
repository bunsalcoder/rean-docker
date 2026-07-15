(() => {
  const header = document.querySelector(".site-header");
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NAV_INDICATOR_KEY = "rean-nav-indicator";

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
  document.querySelectorAll(".nav a").forEach((a) => {
    a.removeAttribute("aria-current");
    const href = a.getAttribute("href");
    if (!href) return;
    const target = new URL(href, location.href);
    const samePath =
      target.pathname.replace(/index\.html$/, "") === path ||
      (path.endsWith("/web/") && href.includes("index.html"));
    if (!samePath) return;
    const linkC = target.searchParams.get("c");
    const pageC = new URLSearchParams(location.search).get("c");
    if (linkC && pageC !== linkC) return;
    if (!linkC && pageC === "17") return;
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

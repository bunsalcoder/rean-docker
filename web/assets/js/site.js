(() => {
  const header = document.querySelector(".site-header");
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");

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

  // Below-fold reveals: armed after leaving the hero, then one soft staggered pass per section
  const revealBlocks = document.querySelectorAll(".reveal-block");
  if (!revealBlocks.length) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

#!/usr/bin/env node
/**
 * Generate crawlable EN/KM HTML for each chapter and lab under web/learn/ and web/lab/.
 * Requires: cd web && npm ci --ignore-scripts  (uses marked from web/package.json)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const WEB = path.join(ROOT, "web");
const SITE = "https://bunsalcoder.github.io/rean-docker";

// Resolve marked from web/node_modules (run via: cd web && node .../generate_static_pages.mjs)
const require = createRequire(path.join(WEB, "package.json"));
const { marked } = require("marked");

const CSP =
  "default-src 'self'; base-uri 'self'; form-action 'self'; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'";

marked.setOptions({ gfm: true, breaks: false });
const renderer = new marked.Renderer();
renderer.html = ({ text }) =>
  String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
marked.use({ renderer });

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function loadJson(file) {
  return JSON.parse(read(file));
}

/** Pull "key": "value" pairs (handles simple escapes). */
function parseStringMap(source) {
  const map = Object.create(null);
  const re = /"([^"]+)":\s*"((?:\\.|[^"\\])*)"/g;
  let m;
  while ((m = re.exec(source))) {
    map[m[1]] = m[2]
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  }
  return map;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/'/g, "&#39;");
}

function chapterStarts(lines, locale) {
  const howTo =
    locale === "km"
      ? /^## របៀបប្រើមគ្គុទ្ទេសក៍នេះ$/
      : /^## How to use this guide$/;
  const toc =
    locale === "km" ? /^## តារាងខ្លឹមសារ$/ : /^## Table of contents$/;
  const starts = [];
  for (let i = 0; i < lines.length; i++) {
    if (howTo.test(lines[i])) {
      starts.push({ id: "how-to-use", index: i });
      continue;
    }
    const m = lines[i].match(/^## (\d+)\. /);
    if (m) starts.push({ id: m[1], index: i });
  }
  starts.sort((a, b) => a.index - b.index);

  return starts.map((s, i) => {
    let end = i + 1 < starts.length ? starts[i + 1].index : lines.length;
    if (s.id === "how-to-use") {
      const tocAt = lines.findIndex((line, idx) => idx > s.index && toc.test(line));
      if (tocAt !== -1) end = tocAt;
    }
    let body = lines.slice(s.index, end).join("\n").trim();
    body = body.replace(/^##\s.+\n+/, "");
    return { id: s.id, body };
  });
}

function splitGuide(markdown, locale) {
  return chapterStarts(markdown.split("\n"), locale);
}

function staticName(id, locale) {
  return locale === "km" ? `${id}.km.html` : `${id}.html`;
}

function absUrl(relPath) {
  return `${SITE}/${relPath}`;
}

function firstParagraph(md) {
  const text = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_`\[\]()-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";
  const cut = text.slice(0, 160);
  return cut.length < text.length ? `${cut.trim()}…` : cut;
}

function renderPage({
  kind,
  id,
  locale,
  title,
  description,
  bodyHtml,
  spaHref,
  twinHref,
  prev,
  next,
  eyebrow,
  ctaLabel,
  prevLabel,
  nextLabel,
}) {
  const file = staticName(id, locale);
  const dir = kind === "chapter" ? "learn" : "lab";
  const pagePath = `${dir}/${file}`;
  const enPath = `${dir}/${staticName(id, "en")}`;
  const kmPath = `${dir}/${staticName(id, "km")}`;
  const canonical = absUrl(pagePath);
  const lang = locale === "km" ? "km" : "en";
  const fullTitle = `${title} — rean-docker`;

  const pager = [
    prev
      ? `<a class="pager-prev" href="${escapeAttr(prev.href)}"><span>${escapeHtml(prevLabel)}</span>${escapeHtml(prev.title)}</a>`
      : "",
    next
      ? `<a class="pager-next" href="${escapeAttr(next.href)}"><span>${escapeHtml(nextLabel)}</span>${escapeHtml(next.title)}</a>`
      : "",
  ].join("\n        ");

  return `<!DOCTYPE html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <base href="../" />
    <meta http-equiv="Content-Security-Policy" content="${CSP}" />
    <meta name="color-scheme" content="light dark" />
    <meta name="theme-color" content="#f2f6fa" />
    <link rel="manifest" href="./site.webmanifest" />
    <title>${escapeHtml(fullTitle)}</title>
    <meta name="description" content="${escapeAttr(description)}" />
    <link rel="canonical" href="${escapeAttr(canonical)}" />
    <link rel="alternate" hreflang="en" href="${escapeAttr(absUrl(enPath))}" />
    <link rel="alternate" hreflang="km" href="${escapeAttr(absUrl(kmPath))}" />
    <link rel="alternate" hreflang="x-default" href="${escapeAttr(absUrl(enPath))}" />
    <meta property="og:site_name" content="rean-docker" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeAttr(fullTitle)}" />
    <meta property="og:description" content="${escapeAttr(description)}" />
    <meta property="og:url" content="${escapeAttr(canonical)}" />
    <meta property="og:image" content="${escapeAttr(absUrl("assets/img/hero-harbor.jpg"))}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(fullTitle)}" />
    <meta name="twitter:description" content="${escapeAttr(description)}" />
    <meta name="twitter:image" content="${escapeAttr(absUrl("assets/img/hero-harbor.jpg"))}" />
    <link rel="icon" href="./assets/img/favicon.svg" type="image/svg+xml" />
    <link rel="icon" href="./assets/img/favicon.ico" sizes="any" />
    <link rel="apple-touch-icon" href="./assets/img/apple-touch-icon.png" />
    <link rel="stylesheet" href="./assets/css/site.css" />
    <script src="./assets/js/static-page.js"></script>
    <script src="./assets/js/boot.js"></script>
  </head>
  <body
    class="bg-mesh"
    data-page="static-${kind}"
    data-static-locale="${escapeAttr(locale)}"
    data-static-twin="${escapeAttr(twinHref)}"
  >
    <a class="skip-link" href="#main">Skip to content</a>
    <rean-header class="site-header" role="banner"></rean-header>

    <main class="content-pane wrap" id="main" tabindex="-1" style="max-width: 48rem; margin: 0 auto; padding: 1.5rem 1.25rem 3rem">
      <p class="eyebrow">${escapeHtml(eyebrow)}</p>
      <h1>${escapeHtml(title)}</h1>
      <p class="cta-row" style="margin: 1rem 0 1.5rem">
        <a class="btn btn-primary" href="${escapeAttr(spaHref)}">${escapeHtml(ctaLabel)}</a>
      </p>
      <div class="md-body">
${bodyHtml}
      </div>
      <nav class="pager" style="margin-top: 2rem">
        ${pager}
      </nav>
    </main>

    <footer class="site-footer">
      <div class="wrap">
        <span class="brand">rean-docker</span>
      </div>
    </footer>

    <script defer src="./assets/js/i18n-km.js"></script>
    <script defer src="./assets/js/i18n.js"></script>
    <script defer src="./assets/js/routes.js"></script>
    <script defer src="./assets/js/site.js"></script>
  </body>
</html>
`;
}

function wipeHtmlDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  for (const name of fs.readdirSync(dir)) {
    if (name.endsWith(".html")) fs.unlinkSync(path.join(dir, name));
  }
}

function main() {
  const routes = loadJson(path.join(WEB, "assets/routes.json"));
  const chapterIds = routes.chapters.map((c) => String(c.id));
  const labIds = routes.labs.map((l) => String(l.id));

  const enMap = parseStringMap(read(path.join(WEB, "assets/js/i18n.js")));
  const kmMap = { ...enMap, ...parseStringMap(read(path.join(WEB, "assets/js/i18n-km.js"))) };

  const learnDir = path.join(WEB, "learn");
  const labDir = path.join(WEB, "lab");
  wipeHtmlDir(learnDir);
  wipeHtmlDir(labDir);

  let written = 0;

  for (const locale of ["en", "km"]) {
    const strings = locale === "km" ? kmMap : enMap;
    const guide = read(path.join(WEB, "content", locale, "guide.md"));
    const chapters = splitGuide(guide, locale);
    const byId = new Map(chapters.map((c) => [c.id, c]));

    const ordered = chapterIds.map((id) => {
      const ch = byId.get(id);
      if (!ch) throw new Error(`Missing chapter ${id} in ${locale} guide`);
      const title = strings[`chapter.${id}`] || id;
      return { id, title, body: ch.body };
    });

    for (let i = 0; i < ordered.length; i++) {
      const ch = ordered[i];
      const prev = i > 0 ? ordered[i - 1] : null;
      const next = i + 1 < ordered.length ? ordered[i + 1] : null;
      const file = staticName(ch.id, locale);
      // Twin is same-directory for JS (location.href ignores <base>).
      const twin = `./${staticName(ch.id, locale === "km" ? "en" : "km")}`;
      const spa =
        locale === "km"
          ? `./learn.html?c=${encodeURIComponent(ch.id)}&lang=km`
          : `./learn.html?c=${encodeURIComponent(ch.id)}`;
      const description =
        firstParagraph(ch.body) ||
        strings["learn.description"] ||
        "rean-docker Docker curriculum";

      const html = renderPage({
        kind: "chapter",
        id: ch.id,
        locale,
        title: ch.title,
        description,
        bodyHtml: marked.parse(ch.body),
        spaHref: spa,
        twinHref: twin,
        prev: prev
          ? { href: `./learn/${staticName(prev.id, locale)}`, title: prev.title }
          : null,
        next: next
          ? { href: `./learn/${staticName(next.id, locale)}`, title: next.title }
          : null,
        eyebrow: strings["learn.curriculum"] || "Curriculum",
        ctaLabel:
          locale === "km" ? "បើកអ្នកអានអន្តរកម្ម" : "Open interactive reader",
        prevLabel: strings["learn.prev"] || "Previous",
        nextLabel: strings["learn.next"] || "Next",
      });
      fs.writeFileSync(path.join(learnDir, file), html, "utf8");
      written += 1;
    }

    const labs = labIds.map((id) => {
      const mdPath = path.join(WEB, "content", locale, "labs", `${id}.md`);
      let md = read(mdPath);
      // Match SPA: drop leading H1 (page already shows title)
      md = md.replace(/^#\s.+\n+/, "");
      const title = strings[`labMeta.${id}`] || id;
      const num = id.slice(0, 2);
      const description =
        strings[`labs.${num}.desc`] || firstParagraph(md) || title;
      return { id, title, body: md, description };
    });

    for (let i = 0; i < labs.length; i++) {
      const lab = labs[i];
      const prev = i > 0 ? labs[i - 1] : null;
      const next = i + 1 < labs.length ? labs[i + 1] : null;
      const file = staticName(lab.id, locale);
      const twin = `./${staticName(lab.id, locale === "km" ? "en" : "km")}`;
      const spa =
        locale === "km"
          ? `./lab.html?id=${encodeURIComponent(lab.id)}&lang=km`
          : `./lab.html?id=${encodeURIComponent(lab.id)}`;

      const html = renderPage({
        kind: "lab",
        id: lab.id,
        locale,
        title: lab.title,
        description: lab.description,
        bodyHtml: marked.parse(lab.body),
        spaHref: spa,
        twinHref: twin,
        prev: prev
          ? { href: `./lab/${staticName(prev.id, locale)}`, title: prev.title }
          : null,
        next: next
          ? { href: `./lab/${staticName(next.id, locale)}`, title: next.title }
          : null,
        eyebrow: strings["lab.eyebrow"] || "Hands-on",
        ctaLabel:
          locale === "km" ? "បើកអ្នកអានអន្តរកម្ម" : "Open interactive reader",
        prevLabel: strings["lab.prev"] || "Previous lab",
        nextLabel: strings["lab.next"] || "Next lab",
      });
      fs.writeFileSync(path.join(labDir, file), html, "utf8");
      written += 1;
    }
  }

  console.log(
    `Wrote ${written} static pages under web/learn/ and web/lab/ (${chapterIds.length} chapters + ${labIds.length} labs × 2 locales)`
  );
}

main();

#!/usr/bin/env node
/**
 * Node smoke tests for shared guide/checklist helpers (no browser deps).
 * Loads web/assets/js/guide.js in a minimal window shim.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const GUIDE_JS = join(ROOT, "web/assets/js/guide.js");
const ROUTES_JSON = join(ROOT, "web/assets/routes.json");

let fail = 0;

function assert(cond, msg) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    fail = 1;
  } else {
    console.log(`OK:    ${msg}`);
  }
}

function loadGuide() {
  const window = {};
  const sandbox = { window, console };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(readFileSync(GUIDE_JS, "utf8"), sandbox, { filename: "guide.js" });
  return sandbox.window.ReanGuide;
}

/** Mirror scripts/rean_routes.py chapter_match_pattern + routes.js RegExp flags. */
function mockChaptersFromRoutes() {
  const data = JSON.parse(readFileSync(ROUTES_JSON, "utf8"));
  return (data.chapters || []).map((ch) => {
    const id = String(ch.id);
    let source = ch.match;
    if (!source) {
      if (/^\d+$/.test(id)) source = `^## ${id}\\. `;
      else throw new Error(`Chapter ${id} needs match in routes.json`);
    }
    return { id, match: new RegExp(source, "m") };
  });
}

const Guide = loadGuide();
assert(Guide && typeof Guide.splitSections === "function", "ReanGuide.splitSections exported");
assert(typeof Guide.checklistIndexKey === "function", "checklistIndexKey exported");
assert(typeof Guide.normalizeChecklistSaved === "function", "normalizeChecklistSaved exported");
assert(typeof Guide.enhanceCallouts === "function", "enhanceCallouts exported");

const chapters = mockChaptersFromRoutes();
assert(chapters.length >= 2, `routes.json chapters loaded (${chapters.length})`);

const sample = [
  "## How to use this guide",
  "",
  "Intro body.",
  "",
  "## Table of contents",
  "",
  "- skip",
  "",
  "## 1. What problem does Docker solve?",
  "",
  "Chapter one body with **compose**.",
  "",
  "## 2. Containerization basics",
  "",
  "Chapter two body.",
].join("\n");

const clipped = Guide.splitSections(sample, chapters, {
  clipIntroAtToc: true,
  stripLeadingHeading: true,
});
assert(clipped.length >= 2, `splitSections returns chapters (got ${clipped.length})`);
const intro = clipped.find((s) => s.id === "how-to-use");
assert(Boolean(intro), "how-to-use section present");
assert(!/Table of contents/.test(intro.body), "how-to-use clipped before TOC");
assert(!/^## /.test((intro.body.split("\n")[0] || "").trim()), "leading heading stripped for reader");

const full = Guide.splitSections(sample, chapters);
const ch1 = full.find((s) => s.id === "1");
assert(ch1 && /compose/.test(ch1.body), "search-mode body keeps chapter content");

assert(Guide.checklistIndexKey(0) === "i:0", "index key i:0");
assert(Guide.checklistIndexKey(3) === "i:3", "index key i:3");

const migrated = Guide.normalizeChecklistSaved(
  { "you saw hello": true, "nginx returned": false, "exec worked": true },
  3
);
assert(
  migrated["i:0"] === true && migrated["i:1"] === false && migrated["i:2"] === true,
  "legacy text keys migrate by position"
);

const indexed = Guide.normalizeChecklistSaved({ "i:0": true, "i:1": false }, 2);
assert(indexed["i:0"] === true && indexed["i:1"] === false, "index keys preserved");

const partial = Guide.normalizeChecklistSaved({ "only one legacy": true }, 3);
assert(
  partial["only one legacy"] === true && !Object.prototype.hasOwnProperty.call(partial, "i:0"),
  "mismatched legacy count kept for same-locale fallback"
);

assert(Guide.resolveChecklistChecked({ "i:1": true }, null, 1) === true, "resolve prefers index key");
assert(
  Guide.resolveChecklistChecked(
    { "nginx returned http 200 on port 8080": true },
    { textContent: "Nginx returned HTTP 200 on port 8080" },
    1
  ) === true,
  "resolve falls back to legacy text key"
);

const guideSrc = readFileSync(GUIDE_JS, "utf8");
assert(/Expected output|លទ្ធផលដែលរំពឹងទុក/.test(guideSrc), "callout labels include Expected output (EN/KM)");
assert(/Common error|កំហុសទូទៅ/.test(guideSrc), "callout labels include Common error (EN/KM)");

assert(typeof Guide.expandSearchTerms === "function", "expandSearchTerms exported");
const composeTerms = Guide.expandSearchTerms("compose");
assert(
  composeTerms.length === 1 && composeTerms[0].includes("docker compose"),
  "compose expands to docker compose alias"
);
const phraseTerms = Guide.expandSearchTerms("docker compose volume");
assert(
  phraseTerms.some((g) => g.includes("compose")) && phraseTerms.some((g) => g.includes("volume")),
  "phrase docker compose collapses then ANDs with volume"
);
const emptyTerms = Guide.expandSearchTerms("  the and  ");
assert(emptyTerms.length === 0, "stopwords alone yield no terms");
const ciTerms = Guide.expandSearchTerms("ci");
assert(ciTerms.length === 1 && ciTerms[0].includes("github actions"), "ci expands via synonym group");

const home = readFileSync(join(ROOT, "web/index.html"), "utf8");
assert(home.includes("home.startTitle") && home.includes("start-steps"), "home has first-30-minutes onboarding");
const searchJs = readFileSync(join(ROOT, "web/assets/js/search.js"), "utf8");
assert(searchJs.includes('role="combobox"'), "search input uses combobox pattern");
assert(searchJs.includes("aria-activedescendant"), "search tracks aria-activedescendant");

if (fail) {
  console.error("Frontend logic checks failed.");
  process.exit(1);
}
console.log("Frontend logic checks passed.");

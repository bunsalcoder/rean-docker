#!/usr/bin/env node
/**
 * Browser checks for the reader flows the Node sandbox does not exercise:
 * sidebar focus trap, search keyboard, locale switch, and progress import.
 */
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

function assert(cond, msg) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    throw new Error(msg);
  }
  console.log(`OK:    ${msg}`);
}

function startServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn("python3", ["scripts/serve_web.py", "--port", "0"], {
      cwd: ROOT,
      env: { ...process.env, PYTHONUNBUFFERED: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let buf = "";
    const timer = setTimeout(() => {
      proc.kill("SIGTERM");
      reject(new Error("timed out waiting for the site server"));
    }, 8000);
    const onData = (chunk) => {
      buf += chunk.toString();
      const match = buf.match(/http:\/\/127\.0\.0\.1:(\d+)/);
      if (!match) return;
      clearTimeout(timer);
      proc.stdout.off("data", onData);
      resolve({ proc, base: `http://127.0.0.1:${match[1]}` });
    };
    proc.stdout.on("data", onData);
    proc.stderr.on("data", () => {});
    proc.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`site server exited ${code} before it was ready`));
    });
  });
}

async function withPage(browser, viewport, run) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  try {
    await run(page);
  } finally {
    await context.close();
  }
}

async function checkPathIndex(page, base) {
  await page.goto(`${base}/labs.html`, { waitUntil: "networkidle" });
  const card = page.locator('a[href*="id=14-advanced"]');
  assert((await card.locator(".num").textContent())?.trim() === "12", "Lab 14 card shows path step 12");
  assert(
    (await card.locator("[data-lab-folder]").textContent())?.trim() === "Lab 14",
    "Lab 14 card keeps the folder name"
  );
  const ci = page.locator('a[href*="id=12-ci-cd"]');
  assert((await ci.locator(".num").textContent())?.trim() === "13", "Lab 12 card shows path step 13");
  assert(
    (await ci.locator("[data-lab-folder]").textContent())?.trim() === "Lab 12",
    "Lab 12 card keeps the folder name"
  );

  await page.goto(`${base}/lab.html?id=14-advanced`, { waitUntil: "networkidle" });
  await page.waitForFunction(() =>
    (document.querySelector("[data-progress]")?.textContent || "").includes("Step 12 of 14")
  );
  const pill = (await page.locator("[data-progress]").textContent()) || "";
  assert(
    pill.includes("Step 12 of 14") && pill.includes("Lab 14"),
    "lab reader names the path step and the folder lab"
  );
  const side = page.locator('[data-lab-id="14-advanced"]');
  assert((await side.locator(".side-nav-index").textContent())?.trim() === "12", "sidebar shows path step 12");
  assert(
    ((await side.locator(".side-nav-meta").textContent()) || "").includes("Lab 14"),
    "sidebar meta keeps Lab 14"
  );
}

async function checkSidebarTrap(page, base) {
  await page.goto(`${base}/lab.html?id=01-isolation-basics`, { waitUntil: "networkidle" });
  await page.locator("[data-lab-nav] a[data-lab-id]").first().waitFor();
  const toggle = page.locator("[data-side-toggle]");
  await toggle.click();
  await page.waitForFunction(
    () => document.querySelector("[data-side-toggle]")?.getAttribute("aria-expanded") === "true"
  );
  const openedInside = await page.evaluate(() =>
    Boolean(document.querySelector("[data-sidebar]")?.contains(document.activeElement))
  );
  assert(openedInside, "opening the lab drawer moves focus into the sidebar");

  await page.evaluate(() => {
    const sidebar = document.querySelector("[data-sidebar]");
    const nodes = [...sidebar.querySelectorAll("a[href], button:not([disabled])")];
    nodes.at(-1)?.focus();
  });
  await page.keyboard.press("Tab");
  const wrapped = await page.evaluate(() => {
    const sidebar = document.querySelector("[data-sidebar]");
    const first = sidebar.querySelector("a[href], button:not([disabled])");
    return document.activeElement === first;
  });
  assert(wrapped, "Tab on the last sidebar control wraps to the first");

  await page.keyboard.press("Escape");
  await page.waitForFunction(
    () => document.querySelector("[data-side-toggle]")?.getAttribute("aria-expanded") === "false"
  );
  const restored = await page.evaluate(() => document.activeElement?.matches("[data-side-toggle]"));
  assert(restored, "Escape closes the drawer and restores focus to the menu button");
}

async function checkSearchKeys(page, base) {
  await page.goto(`${base}/learn.html`, { waitUntil: "networkidle" });
  const opener = page.locator("[data-search-open]");
  await opener.click();
  const input = page.locator("[data-search-input]");
  await input.waitFor();
  await input.fill("volume");
  await page.locator("[data-search-item]").first().waitFor();
  await input.press("ArrowDown");
  const active = await input.getAttribute("aria-activedescendant");
  assert(Boolean(active), "ArrowDown sets the search combobox active descendant");
  const selected = await page.locator(`[id="${active}"]`).getAttribute("aria-selected");
  assert(selected === "true", "the active search option is aria-selected");
  await input.press("Escape");
  await page.waitForFunction(() => !document.querySelector("dialog.search-dialog")?.open);
  await page.waitForFunction(() => document.activeElement?.matches("[data-search-open]"));
  assert(true, "Escape closes search and returns focus to the opener");
}

async function checkLocaleSwitch(page, base) {
  await page.goto(`${base}/labs.html`, { waitUntil: "networkidle" });
  await page.locator('[data-set-lang="km"]').click();
  await page.waitForURL(/[?&]lang=km/, { timeout: 8000 });
  await page.locator("h1", { hasText: "លំហាត់" }).waitFor({ timeout: 8000 });
  const heading = ((await page.locator("h1").textContent()) || "").trim();
  assert(heading === "លំហាត់", "Khmer locale reloads the labs heading");
  const folder = (
    (await page.locator('a[href*="id=14-advanced"] [data-lab-folder]').textContent()) || ""
  ).trim();
  assert(folder === "លំហាត់ 14", "Khmer path card still names folder lab 14");
}

async function checkProgressImport(page, base) {
  await page.goto(`${base}/index.html`, { waitUntil: "networkidle" });
  const input = page.locator("[data-progress-file]");
  await input.waitFor({ state: "attached" });
  await input.setInputFiles({
    name: "rean-docker-progress.json",
    mimeType: "application/json",
    buffer: Buffer.from(
      JSON.stringify({
        version: 1,
        exportedAt: "2026-11-16T00:00:00.000Z",
        progress: {
          "lab:14-advanced": { done: 1, total: 1, updatedAt: 1 },
        },
        checklists: {},
      })
    ),
  });
  await page.getByText("1 of 14 labs complete").waitFor();
  assert(true, "progress import restores a lab on this device");
  const dot = page.locator(".progress-lab-dots a").nth(11);
  assert(
    (await dot.locator('[aria-hidden="true"]').textContent())?.trim() === "12",
    "progress map uses path step 12 for Lab 14"
  );
  const hidden = (await dot.locator(".visually-hidden").textContent()) || "";
  assert(hidden.includes("Lab 14"), "progress map still names folder Lab 14");
}

async function main() {
  const { proc, base } = await startServer();
  let browser;
  let fail = 0;
  try {
    browser = await chromium.launch();
    const narrow = { width: 390, height: 800 };
    const desktop = { width: 1280, height: 800 };
    await withPage(browser, desktop, (page) => checkPathIndex(page, base));
    await withPage(browser, narrow, (page) => checkSidebarTrap(page, base));
    await withPage(browser, desktop, (page) => checkSearchKeys(page, base));
    await withPage(browser, desktop, (page) => checkLocaleSwitch(page, base));
    await withPage(browser, desktop, (page) => checkProgressImport(page, base));
  } catch (err) {
    fail = 1;
    console.error(err instanceof Error ? err.message : err);
  } finally {
    await browser?.close();
    proc.kill("SIGTERM");
  }
  if (fail) process.exit(1);
  console.log("reader browser checks passed");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

const path = require("path");
const fs = require("fs");
const { chromium } = require("playwright");

const OUT = "C:/Desktop/💻 Dev Corner/Projects/CODING/CODINGWITHMIRA/EliLain_College_PROJECT/apps/web/e2e_screenshots";
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });

  // -- DESKTOP LTR (1440x900) ------------------------------------------
  const desktopLtr = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "en-US", colorScheme: "dark" });
  const d = await desktopLtr.newPage();
  await d.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
  await d.waitForTimeout(2000);
  await d.screenshot({ path: path.join(OUT, "desktop_home_ltr.png"), fullPage: false });
  console.log("desktop home LTR done");

  await d.click('a[href="/laptops"]');
  await d.waitForTimeout(2000);
  await d.screenshot({ path: path.join(OUT, "desktop_catalog_ltr.png"), fullPage: false });
  console.log("desktop catalog LTR done");

  await d.goto("http://127.0.0.1:5173/upgrade", { waitUntil: "networkidle" });
  await d.waitForTimeout(2000);
  await d.screenshot({ path: path.join(OUT, "desktop_upgrade_ltr.png"), fullPage: false });
  console.log("desktop upgrade LTR done");

  await d.goto("http://127.0.0.1:5173/upgrade-or-replace", { waitUntil: "networkidle" });
  await d.waitForTimeout(2000);
  await d.screenshot({ path: path.join(OUT, "desktop_calc_ltr.png"), fullPage: false });
  console.log("desktop calc LTR done");

  await d.goto("http://127.0.0.1:5173/compare", { waitUntil: "networkidle" });
  await d.waitForTimeout(2000);
  await d.screenshot({ path: path.join(OUT, "desktop_compare_ltr.png"), fullPage: false });
  console.log("desktop compare LTR done");

  await desktopLtr.close();

  // -- MOBILE LTR (390x844) -------------------------------------------
  const mobileLtr = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "en-US", colorScheme: "dark" });
  const m = await mobileLtr.newPage();
  await m.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
  await m.waitForTimeout(2000);
  await m.screenshot({ path: path.join(OUT, "mobile_home_ltr.png"), fullPage: false });
  console.log("mobile home LTR done");

  await m.click('a[href="/laptops"]');
  await m.waitForTimeout(2000);
  await m.screenshot({ path: path.join(OUT, "mobile_catalog_ltr.png"), fullPage: false });
  console.log("mobile catalog LTR done");

  await m.goto("http://127.0.0.1:5173/upgrade", { waitUntil: "networkidle" });
  await m.waitForTimeout(2000);
  await m.screenshot({ path: path.join(OUT, "mobile_upgrade_ltr.png"), fullPage: false });
  console.log("mobile upgrade LTR done");

  await m.goto("http://127.0.0.1:5173/upgrade-or-replace", { waitUntil: "networkidle" });
  await m.waitForTimeout(2000);
  await m.screenshot({ path: path.join(OUT, "mobile_calc_ltr.png"), fullPage: false });
  console.log("mobile calc LTR done");

  await m.goto("http://127.0.0.1:5173/compare", { waitUntil: "networkidle" });
  await m.waitForTimeout(2000);
  await m.screenshot({ path: path.join(OUT, "mobile_compare_ltr.png"), fullPage: false });
  console.log("mobile compare LTR done");

  await mobileLtr.close();

  // -- DESKTOP RTL (1440x900) Arabic ---------------------------------
  const desktopRtl = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "ar-EG", colorScheme: "dark" });
  const r = await desktopRtl.newPage();
  await r.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
  await r.waitForTimeout(2000);
  // Switch to Arabic via locale button
  await r.click('button[aria-pressed="false"]');
  await r.waitForTimeout(2000);
  await r.screenshot({ path: path.join(OUT, "desktop_home_rtl.png"), fullPage: false });
  console.log("desktop home RTL done");

  await r.goto("http://127.0.0.1:5173/laptops", { waitUntil: "networkidle" });
  await r.waitForTimeout(2000);
  await r.screenshot({ path: path.join(OUT, "desktop_catalog_rtl.png"), fullPage: false });
  console.log("desktop catalog RTL done");

  await r.goto("http://127.0.0.1:5173/upgrade", { waitUntil: "networkidle" });
  await r.waitForTimeout(2000);
  await r.screenshot({ path: path.join(OUT, "desktop_upgrade_rtl.png"), fullPage: false });
  console.log("desktop upgrade RTL done");

  await r.goto("http://127.0.0.1:5173/upgrade-or-replace", { waitUntil: "networkidle" });
  await r.waitForTimeout(2000);
  await r.screenshot({ path: path.join(OUT, "desktop_calc_rtl.png"), fullPage: false });
  console.log("desktop calc RTL done");

  await r.goto("http://127.0.0.1:5173/compare", { waitUntil: "networkidle" });
  await r.waitForTimeout(2000);
  await r.screenshot({ path: path.join(OUT, "desktop_compare_rtl.png"), fullPage: false });
  console.log("desktop compare RTL done");

  await desktopRtl.close();

  // -- MOBILE RTL (390x844) Arabic ------------------------------------
  const mobileRtl = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "ar-EG", colorScheme: "dark" });
  const mr = await mobileRtl.newPage();
  await mr.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
  await mr.waitForTimeout(2000);
  await mr.click('button[aria-pressed="false"]');
  await mr.waitForTimeout(2000);
  await mr.screenshot({ path: path.join(OUT, "mobile_home_rtl.png"), fullPage: false });
  console.log("mobile home RTL done");

  await mr.goto("http://127.0.0.1:5173/laptops", { waitUntil: "networkidle" });
  await mr.waitForTimeout(2000);
  await mr.screenshot({ path: path.join(OUT, "mobile_catalog_rtl.png"), fullPage: false });
  console.log("mobile catalog RTL done");

  await mr.goto("http://127.0.0.1:5173/upgrade-or-replace", { waitUntil: "networkidle" });
  await mr.waitForTimeout(2000);
  await mr.screenshot({ path: path.join(OUT, "mobile_calc_rtl.png"), fullPage: false });
  console.log("mobile calc RTL done");

  await mobileRtl.close();

  // -- INTERACTION CHECKS --------------------------------------------
  console.log("\n=== INTERACTION CHECKS ===");
  
  // Catalog: test filters
  const intCheck = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "en-US", colorScheme: "dark" });
  const ic = await intCheck.newPage();
  await ic.goto("http://127.0.0.1:5173/laptops", { waitUntil: "networkidle" });
  await ic.waitForTimeout(2000);
  
  // Check filter button exists on desktop
  const filterBtnExists = await ic.locator('button').filter({ hasText: /filters/i }).count();
  console.log("filter button exists (desktop):", filterBtnExists > 0 ? "YES" : "NO");
  
  // Test search input
  const searchInput = await ic.$('#catalog-q');
  console.log("search input exists:", !!searchInput);
  
  // Test RAM filter buttons
  const ramBtns = await ic.locator('[aria-pressed]').count();
  console.log("RAM filter buttons:", ramBtns);
  
  // Test brand checkboxes (visual check - hidden input)
  const brandChecks = await ic.locator('input[type="checkbox"][aria-label]').count();
  console.log("brand checkbox inputs:", brandChecks);
  
  // Test price slider
  const priceRange = await ic.$('input[type="range"]');
  console.log("price range input exists:", !!priceRange);
  
  // Verify calculator form fields
  await ic.goto("http://127.0.0.1:5173/upgrade-or-replace", { waitUntil: "networkidle" });
  await ic.waitForTimeout(2000);
  const calcFields = await ic.locator('.uc-field input').count();
  console.log("calculator fields:", calcFields);
  
  // Verify compare page table exists
  await ic.goto("http://127.0.0.1:5173/compare", { waitUntil: "networkidle" });
  await ic.waitForTimeout(2000);
  const compareTable = await ic.$('table');
  console.log("compare table exists:", !!compareTable);
  
  // Check for console errors
  const consoleErrors = [];
  ic.on("console", msg => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  await ic.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });
  await ic.waitForTimeout(2000);
  console.log("console errors on load:", consoleErrors.length > 0 ? consoleErrors : "none");
  
  // Check contrast via JS
  const contrastInfo = await ic.evaluate(() => {
    const tokens = getComputedStyle(document.documentElement);
    return {
      bg: tokens.getPropertyValue('--color-graphite-950').trim(),
      text: tokens.getPropertyValue('--color-graphite-100').trim(),
      signal: tokens.getPropertyValue('--color-signal').trim(),
      font: tokens.getPropertyValue('--font-sans').trim(),
    };
  });
  console.log("design tokens:", JSON.stringify(contrastInfo, null, 2));
  
  // Check RTL attributes
  const rtlInfo = await ic.evaluate(() => {
    const html = document.documentElement;
    return { dir: html.dir, lang: html.lang };
  });
  console.log("initial dir/lang:", rtlInfo);
  
  // Switch to Arabic and check dir
  await ic.click('button[aria-pressed="false"]');
  await ic.waitForTimeout(1500);
  const rtlAfter = await ic.evaluate(() => ({ dir: document.documentElement.dir, lang: document.documentElement.lang }));
  console.log("after AR switch:", rtlAfter);
  
  await intCheck.close();
  await browser.close();
  console.log("\n=== ALL SCREENSHOTS AND CHECKS COMPLETE ===");
})();

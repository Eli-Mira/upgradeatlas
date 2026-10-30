"""
Comprehensive frontend E2E audit for UpgradeAtlas.
Desktop (1440x900) + Mobile (390x844), LTR + RTL.
Screenshots saved to e2e_screenshots/.
"""
import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright

BASE = "http://127.0.0.1:5173"
OUT = Path(__file__).parent / "e2e_screenshots"
OUT.mkdir(exist_ok=True)

async def screenshot(page, filename, full_page=False):
    await page.screenshot(path=str(OUT / filename), full_page=full_page)
    print(f"  ✓ {filename}")

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        configs = [
            # (name_prefix, viewport, locale)
            ("desktop_ltr", {"width": 1440, "height": 900}, "en-US"),
            ("mobile_ltr",  {"width": 390,  "height": 844}, "en-US"),
            ("desktop_rtl", {"width": 1440, "height": 900}, "ar-EG"),
            ("mobile_rtl",  {"width": 390,  "height": 844}, "ar-EG"),
        ]

        pages_by_locale = {}
        for prefix, vp, locale in configs:
            ctx = await browser.new_context(viewport=vp, locale=locale, color_scheme="dark")
            page = await ctx.new_page()
            pages_by_locale[prefix] = (ctx, page, locale)

        routes = ["/", "/laptops", "/upgrade", "/upgrade-or-replace", "/compare"]
        route_labels = ["home", "catalog", "upgrade", "calc", "compare"]

        # ── Navigate and screenshot ──────────────────────────────────────
        results = {}

        for prefix, (ctx, page, locale) in pages_by_locale.items():
            print(f"\n── {prefix} ──")
            # Force RTL for Arabic locales
            if locale == "ar-EG":
                # Set direction via JS before navigation
                await page.add_init_script("""
                    document.documentElement.dir = 'rtl';
                    document.documentElement.lang = 'ar';
                """)

            for route, label in zip(routes, route_labels):
                await page.goto(f"{BASE}{route}", wait_until="networkidle", timeout=30000)
                await page.wait_for_timeout(2000)
                fname = f"{prefix}_{label}.png"
                await screenshot(page, fname)

                # Collect data for audit
                info = await page.evaluate("""() => {
                    const html = document.documentElement;
                    const css = getComputedStyle(html);
                    return {
                        dir: html.dir,
                        lang: html.lang,
                        bgColor: css.backgroundColor,
                        color: css.color,
                        fontFamily: css.fontFamily,
                        hasHero3D: !!document.querySelector('canvas'),
                        hasNav: !!document.querySelector('nav'),
                        hasFooter: !!document.querySelector('footer'),
                        url: location.href,
                        title: document.title,
                    };
                }""")
                key = f"{prefix}_{label}"
                results[key] = info

                # Check console for errors
                errors = await page.evaluate("""() => {
                    return window.__auditErrors || [];
                }""")

        # ── Interaction checks (desktop LTR) ────────────────────────────
        print("\n── Interaction Checks (desktop_ltr) ──")
        _, dpage, _ = pages_by_locale["desktop_ltr"]

        # Catalog filters
        await dpage.goto(f"{BASE}/laptops", wait_until="networkidle")
        await dpage.wait_for_timeout(1500)

        filter_checks = await dpage.evaluate("""() => {
            const checks = {};

            // Search
            const searchInput = document.querySelector('#catalog-q');
            checks.searchInput = !!searchInput;
            checks.searchPlaceholder = searchInput?.placeholder || '';

            // RAM buttons
            const ramBtns = Array.from(document.querySelectorAll('[aria-pressed]')).filter(b => /\\d+.*GB|الكل/i.test(b.textContent));
            checks.ramFilters = ramBtns.length;

            // Brand checkboxes
            const brandChecks = document.querySelectorAll('input[type="checkbox"][aria-label]');
            checks.brandChecks = brandChecks.length;

            // Price range
            const priceRange = document.querySelector('input[type="range"]');
            checks.priceRange = !!priceRange;

            // Use case filters
            const useCaseChecks = document.querySelectorAll('input[type="checkbox"][aria-label]');
            checks.useCaseChecks = useCaseChecks.length;

            // Compare tray
            checks.compareTray = !!document.querySelector('[class*="fixed"]');

            return checks;
        }""")
        results["interactions_catalog"] = filter_checks

        # Calculator
        await dpage.goto(f"{BASE}/upgrade-or-replace", wait_until="networkidle")
        await dpage.wait_for_timeout(1500)
        calc_checks = await dpage.evaluate("""() => {
            const fields = document.querySelectorAll('.uc-field input');
            return {
                fieldCount: fields.length,
                fieldNames: Array.from(fields).map(f => f.name),
                calculateBtn: !!document.querySelector('.uc-actions button'),
                resultSection: !!document.querySelector('.uc-results'),
            };
        }""")
        results["interactions_calc"] = calc_checks

        # Compare
        await dpage.goto(f"{BASE}/compare", wait_until="networkidle")
        await dpage.wait_for_timeout(1500)
        compare_checks = await dpage.evaluate("""() => {
            return {
                tableExists: !!document.querySelector('table'),
                captionExists: !!document.querySelector('caption'),
                headerRows: document.querySelectorAll('thead th').length,
            };
        }""")
        results["interactions_compare"] = compare_checks

        # RTL switch check
        await dpage.goto(f"{BASE}/", wait_until="networkidle")
        await dpage.wait_for_timeout(1000)
        rtl_switch = await dpage.evaluate("""() => {
            const arBtn = document.querySelector('button[lang="ar"]');
            const enBtn = document.querySelector('button[lang="en"]');
            return {
                arBtn: !!arBtn,
                enBtn: !!enBtn,
                currentDir: document.documentElement.dir,
                currentLang: document.documentElement.lang,
            };
        }""")
        results["rtl_switcher"] = rtl_switch

        # Switch to Arabic and verify
        arBtn = await dpage.query_selector('button[lang="ar"]')
        if arBtn:
            await arBtn.click()
            await dpage.wait_for_timeout(1500)
            after_switch = await dpage.evaluate("""() => ({
                dir: document.documentElement.dir,
                lang: document.documentElement.lang,
            })""")
            results["rtl_after_switch"] = after_switch

        # Contrast audit via computed styles
        print("\n── Contrast & Token Audit ──")
        contrast_data = await dpage.evaluate("""() => {
            // Helper to parse hex color to RGB
            function hexToRgb(hex) {
                const r = parseInt(hex.slice(1,3), 16);
                const g = parseInt(hex.slice(3,5), 16);
                const b = parseInt(hex.slice(5,7), 16);
                return {r, g, b};
            }
            function luminance(r, g, b) {
                const [rs, gs, bs] = [r, g, b].map(c => {
                    c /= 255;
                    return c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4);
                });
                return 0.2126*rs + 0.7152*gs + 0.0722*bs;
            }
            function contrastRatio(l1, l2) {
                const lighter = Math.max(l1, l2);
                const darker = Math.min(l1, l2);
                return (lighter + 0.05) / (darker + 0.05);
            }

            const css = getComputedStyle(document.documentElement);
            const tokens = {
                'graphite-950': '#0a0b0d',
                'graphite-900': '#101216',
                'graphite-800': '#1a1e24',
                'graphite-700': '#232830',
                'graphite-600': '#2e353f',
                'graphite-500': '#3d4552',
                'graphite-400': '#5a6472',
                'graphite-300': '#8b95a3',
                'graphite-200': '#b9c1cc',
                'graphite-100': '#dde2e8',
                'graphite-50': '#f2f4f7',
                'signal': '#e5484d',
                'positive': '#3dd68c',
            };

            const checks = {};
            for (const [name, hex] of Object.entries(tokens)) {
                const {r, g, b} = hexToRgb(hex);
                checks[name] = { hex, luminance: luminance(r, g, b), rgb: `${r},${g},${b}` };
            }

            // Key contrast pairs
            const pairs = [
                ['graphite-950 bg', 'graphite-100 text', 'graphite-950', 'graphite-100'],
                ['graphite-900 bg', 'graphite-300 text', 'graphite-900', 'graphite-300'],
                ['graphite-900 bg', 'graphite-400 text', 'graphite-900', 'graphite-400'],
                ['graphite-950 bg', 'signal text', 'graphite-950', 'signal'],
                ['graphite-950 bg', 'graphite-500 text', 'graphite-950', 'graphite-500'],
            ];

            checks.contrastPairs = pairs.map(([labelA, labelB, cA, cB]) => {
                const lA = checks[cA]?.luminance ?? 0;
                const lB = checks[cB]?.luminance ?? 0;
                const ratio = contrastRatio(lA, lB);
                const aaNormal = ratio >= 4.5;
                const aaLarge = ratio >= 3.0;
                return { pair: labelA + '/'+ labelB, ratio: ratio.toFixed(2), aaNormal, aaLarge };
            });

            return checks;
        }""")
        results["contrast_audit"] = contrast_data

        # Typography audit
        print("\n── Typography Audit ──")
        typo_data = await dpage.evaluate("""() => {
            const checks = {
                h1Size: null,
                h2Size: null,
                h3Size: null,
                bodySize: null,
                fontFamily: getComputedStyle(document.body).fontFamily,
                fontArabic: null,
            };

            const h1 = document.querySelector('h1');
            if (h1) checks.h1Size = getComputedStyle(h1).fontSize;

            const h2 = document.querySelector('h2');
            if (h2) checks.h2Size = getComputedStyle(h2).fontSize;

            const h3 = document.querySelector('h3');
            if (h3) checks.h3Size = getComputedStyle(h3).fontSize;

            checks.bodySize = getComputedStyle(document.body).fontSize;

            return checks;
        }""")
        results["typography"] = typo_data

        # RTL verification
        print("\n── RTL Verification ──")
        rtl_data = await dpage.evaluate("""() => {
            const checks = {};

            // Check all visible text for hardcoded LTR issues
            const allElements = Array.from(document.querySelectorAll('*'));
            let rtlTextCount = 0;
            let ltrTokenCount = 0;

            allElements.forEach(el => {
                if (el.children.length > 0) return;
                const text = el.textContent?.trim();
                if (!text || text.length < 2) return;
                // Check for Arabic text
                if (/[\u0600-\u06FF]/.test(text)) {
                    rtlTextCount++;
                }
                // Check for LTR token class
                if (el.classList.contains('ltr-token')) {
                    ltrTokenCount++;
                }
            });

            checks.rtlTextElements = rtlTextCount;
            checks.ltrTokenElements = ltrTokenCount;
            checks.htmlDir = document.documentElement.dir;
            checks.htmlLang = document.documentElement.lang;

            // Check Nav RTL behavior
            const nav = document.querySelector('nav');
            if (nav) {
                const navItems = nav.querySelectorAll('li > a');
                checks.navItemsCount = navItems.length;
                checks.navOverflow = nav.scrollWidth > nav.clientWidth;
            }

            // Check if calculator inputs are LTR
            const calcInputs = document.querySelectorAll('.uc-field input');
            checks.calcInputsLtr = Array.from(calcInputs).every(i => i.getAttribute('dir') === 'ltr');

            return checks;
        }""")
        results["rtl_checks"] = rtl_data

        # Switch to Arabic and re-check
        await dpage.click('button[lang="ar"]')
        await dpage.wait_for_timeout(1500)
        rtl_ar_data = await dpage.evaluate("""() => {
            const checks = {};
            checks.htmlDir = document.documentElement.dir;
            checks.htmlLang = document.documentElement.lang;
            checks.bodyFont = getComputedStyle(document.body).fontFamily;

            // Check RTL-specific styles
            const arStyles = getComputedStyle(document.documentElement);
            checks.arLineHeight = arStyles.lineHeight;

            // Check catalog RTL
            const searchLabel = document.querySelector('label[for="catalog-q"]');
            checks.searchLabelExists = !!searchLabel;

            return checks;
        }""")
        results["rtl_arabic"] = rtl_ar_data

        # Unfinished/placeholder check
        print("\n── Unfinished/Placeholder Check ──")
        placeholder_data = await dpage.evaluate("""() => {
            const checks = {};

            // Look for TODO/FIXME/HACK comments in rendered HTML
            const comments = Array.from(document.querySelectorAll('*')).filter(el => {
                return el.innerHTML?.includes('TODO') ||
                       el.innerHTML?.includes('FIXME') ||
                       el.innerHTML?.includes('HACK') ||
                       el.innerHTML?.includes('XXX');
            });
            checks.todoComments = comments.length;

            // Look for placeholder text patterns
            const placeholders = Array.from(document.querySelectorAll('*')).filter(el => {
                const text = el.textContent?.toLowerCase() || '';
                return text.includes('coming soon') ||
                       text.includes('under construction') ||
                       text.includes('placeholder') ||
                       text.includes('tbd') ||
                       text.includes('tba');
            });
            checks.placeholderTexts = placeholders.length;

            // Check for empty states that might indicate missing data
            const emptyStates = document.querySelectorAll('[class*="empty"], [class*="loading"]');
            checks.emptyStateElements = emptyStates.length;

            return checks;
        }""")
        results["placeholders"] = placeholder_data

        # Component structure audit
        print("\n── Component Structure Audit ──")
        component_data = await dpage.evaluate("""() => {
            const checks = {};

            // Hero 3D
            checks.hero3DExists = !!document.querySelector('canvas');
            checks.hero3DVisible = document.querySelector('canvas')?.offsetWidth > 0;

            // Nav
            checks.navExists = !!document.querySelector('nav');
            checks.navLinks = document.querySelectorAll('nav a').length;

            // Footer
            checks.footerExists = !!document.querySelector('footer');
            checks.footerLinks = document.querySelectorAll('footer a').length;

            // Compare tray
            const tray = document.querySelector('[class*="fixed"]');
            checks.compareTrayVisible = tray ? tray.offsetParent !== null : false;

            // Reveal animations
            const reveals = document.querySelectorAll('[data-shown]');
            checks.revealElements = reveals.length;
            checks.revealedElements = Array.from(reveals).filter(el => el.getAttribute('data-shown') === 'true').length;

            return checks;
        }""")
        results["components"] = component_data

        # Save all results
        results_file = OUT.parent / "e2e_audit_results.json"
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        print(f"\nResults saved to: {results_file}")

        await browser.close()
        print("\n✓ E2E audit complete!")

asyncio.run(main())

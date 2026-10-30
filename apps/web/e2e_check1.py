import asyncio, json, sys
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, executable_path="C:/Users/emadg/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe")
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        await page.goto("http://127.0.0.1:5173/", wait_until="networkidle")
        await page.wait_for_timeout(2000)

        result = {}
        result["title"] = await page.title()

        # Check for red CTA button
        cta_els = await page.evaluate("""() => {
            const links = Array.from(document.querySelectorAll('a, button'));
            const reds = links.filter(el => {
                const style = window.getComputedStyle(el);
                const bg = style.backgroundColor;
                return bg && (bg.includes('rgb(220') || bg.includes('rgb(239') || bg.includes('rgb(255, 0') || bg.includes('255,0,0')) &&
                       el.textContent && el.textContent.trim().length > 3;
            });
            return reds.map(el => ({tag: el.tagName, text: el.textContent.trim().slice(0,80), bg: window.getComputedStyle(el).backgroundColor}));
        }""")
        result["red_cta"] = cta_els[:5] if cta_els else []

        # Check for stats bar
        stats_els = await page.evaluate("""() => {
            const els = Array.from(document.querySelectorAll('*'));
            const stats = els.filter(el => {
                const text = el.textContent || '';
                return /[\\d]+/.test(text) && (text.includes('%') || text.includes('k') || text.includes('K') || text.includes('M') || text.includes('million') || text.includes('users') || text.includes('students') || text.includes('courses'));
            });
            return stats.slice(0,10).map(el => ({tag: el.tagName, text: el.textContent.trim().slice(0,100)}));
        }""")
        result["stats"] = stats_els[:8] if stats_els else []

        # Check for hero section
        hero_els = await page.evaluate("""() => {
            const sections = Array.from(document.querySelectorAll('section, [class*="hero"], [class*="Hero"]'));
            return sections.slice(0,5).map(el => ({
                tag: el.tagName,
                class: el.className,
                text: el.textContent.trim().slice(0,120)
            }));
        }""")
        result["hero_sections"] = hero_els[:5]

        await browser.close()
        print("RESULT:" + json.dumps(result, indent=2))

asyncio.run(main())
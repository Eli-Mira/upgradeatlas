"""Calculator interaction test."""
import asyncio
import json
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900}, locale="en-US", color_scheme="dark")
        page = await ctx.new_page()

        errors = []
        async def on_console(msg):
            if msg.type == "error":
                errors.append(msg.text)

        page.on("console", on_console)

        await page.goto("http://127.0.0.1:5173/upgrade-or-replace", wait_until="networkidle")
        await page.wait_for_timeout(2000)

        # Fill calculator fields
        await page.fill("#ram_cost_egp", "5000")
        await page.fill("#ssd_cost_egp", "3000")
        await page.fill("#installation_cost_egp", "500")
        await page.fill("#replacement_cost_egp", "25000")

        calc_info = await page.evaluate("""() => {
            const fields = document.querySelectorAll('.uc-field input');
            return Array.from(fields).map(f => ({
                name: f.name,
                value: f.value,
                ariaInvalid: f.getAttribute('aria-invalid'),
                errorText: f.parentElement?.querySelector('.uc-error')?.textContent || null
            }));
        }""")
        print("Field states:", json.dumps(calc_info, ensure_ascii=False, indent=2))

        # Click calculate
        await page.click('.uc-actions button')
        await page.wait_for_timeout(3000)

        result_info = await page.evaluate("""() => {
            const resultSection = document.querySelector('.uc-results');
            if (!resultSection) return null;
            const rows = resultSection.querySelectorAll('.uc-dl-row');
            const verdict = resultSection.querySelector('.uc-verdict');
            const tag = resultSection.querySelector('.uc-tag');
            return {
                resultVisible: true,
                rows: Array.from(rows).map(r => ({
                    dt: r.querySelector('dt')?.textContent,
                    dd: r.querySelector('dd')?.textContent
                })),
                verdict: verdict?.textContent,
                lowerCostTag: tag?.textContent
            };
        }""")
        print("Result:", json.dumps(result_info, ensure_ascii=False, indent=2))

        # Check console errors
        await page.goto("http://127.0.0.1:5173/", wait_until="networkidle")
        await page.wait_for_timeout(2000)
        print("Console errors:", errors if errors else "none")

        # Check all pages for console errors
        all_errors = []
        for url in ["http://127.0.0.1:5173/", "http://127.0.0.1:5173/laptops", "http://127.0.0.1:5173/upgrade", "http://127.0.0.1:5173/upgrade-or-replace", "http://127.0.0.1:5173/compare"]:
            await page.goto(url, wait_until="networkidle")
            await page.wait_for_timeout(1500)
            page_errors = await page.evaluate("""() => {
                return window.__consoleErrors || [];
            }""")
            if page_errors:
                all_errors.extend(page_errors)

        print(f"Total page console errors: {len(all_errors)}")
        if all_errors:
            print("Errors:", all_errors[:5])

        await browser.close()

asyncio.run(main())

import asyncio, json, sys
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, executable_path="C:/Users/emadg/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe")
        
        # Desktop check with console errors
        desk = await browser.new_page(viewport={"width": 1440, "height": 900})
        desk_errors = []
        desk.on("console", lambda msg: desk_errors.append(f"[{msg.type}] {msg.text}") if msg.type in ("error", "warning") else None)
        desk.on("pageerror", lambda err: desk_errors.append(f"PAGE_ERROR: {err}"))
        
        await desk.goto("http://127.0.0.1:5173/", wait_until="networkidle")
        await desk.wait_for_timeout(3000)
        
        # Navigate to calculator and check for errors there too
        calc_errors = []
        desk.on("console", lambda msg: calc_errors.append(f"[{msg.type}] {msg.text}") if msg.type in ("error", "warning") else None)
        desk.on("pageerror", lambda err: calc_errors.append(f"PAGE_ERROR: {err}"))
        
        await desk.goto("http://127.0.0.1:5173/upgrade-or-replace", wait_until="networkidle")
        await desk.wait_for_timeout(2000)
        
        # Fill and submit calculator
        await desk.fill('#ram_cost_egp', '2000')
        await desk.fill('#ssd_cost_egp', '0')
        await desk.fill('#installation_cost_egp', '400')
        await desk.fill('#replacement_cost_egp', '45000')
        await desk.click('button[type="submit"]')
        await desk.wait_for_timeout(3000)
        
        calc_result = await desk.evaluate("""() => {
            const resultSection = document.querySelector('.uc-results');
            const chart = document.querySelector('.uc-chart');
            const bars = document.querySelectorAll('.uc-bar');
            return {
                result_visible: !!resultSection,
                chart_visible: !!chart && chart.offsetParent !== null,
                bar_count: bars.length,
                result_text: resultSection ? resultSection.innerText.slice(0, 400) : ''
            };
        }""")
        
        print(json.dumps({
            "desktop_console_errors": desk_errors,
            "calculator_console_errors": calc_errors,
            "calculator_result": calc_result
        }, indent=2, ensure_ascii=False))
        
        await browser.close()

asyncio.run(main())
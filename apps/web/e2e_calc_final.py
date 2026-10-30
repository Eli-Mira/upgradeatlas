import asyncio, json, sys
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, executable_path="C:/Users/emadg/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe")
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))
        
        await page.goto("http://127.0.0.1:5173/upgrade-or-replace", wait_until="networkidle")
        await page.wait_for_timeout(2000)
        
        # Fill form with values from the API spec
        await page.fill('#ram_cost_egp', '2000')
        await page.fill('#ssd_cost_egp', '0')
        await page.fill('#installation_cost_egp', '400')
        await page.fill('#replacement_cost_egp', '45000')
        
        await page.click('button[type="submit"]')
        await page.wait_for_timeout(3000)
        
        result = await page.evaluate("""() => {
            const resultSection = document.querySelector('.uc-results');
            const chart = document.querySelector('.uc-chart');
            const bars = document.querySelectorAll('.uc-bar');
            const bodyStyle = window.getComputedStyle(document.body);
            
            return {
                url: window.location.href,
                is_dark: parseInt(bodyStyle.backgroundColor.match(/\\d+/g)[0]) < 50,
                body_bg: bodyStyle.backgroundColor,
                result_visible: !!resultSection,
                chart_visible: !!chart && chart.offsetParent !== null,
                bar_count: bars.length,
                bars_info: Array.from(bars).map(b => ({
                    width: b.style.width,
                    class: b.className
                })),
                result_text: resultSection ? resultSection.innerText.slice(0, 500) : '',
                has_error: !!document.querySelector('.uc-error[role="alert"]'),
                error_text: document.querySelector('.uc-error') ? document.querySelector('.uc-error').textContent.trim().slice(0, 100) : '',
                console_errors: window.__consoleErrors || []
            };
        }""")
        
        print(json.dumps(result, indent=2, ensure_ascii=False))
        print(json.dumps({"page_errors": errors}, indent=2))
        
        await browser.close()

asyncio.run(main())
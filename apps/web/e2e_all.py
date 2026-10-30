import asyncio, json, sys
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, executable_path="C:/Users/emadg/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe")
        
        # Check desktop with verbose error capture
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        
        console_errors = []
        js_errors = []
        
        page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type in ("error", "warning") else None)
        page.on("pageerror", lambda err: js_errors.append(f"PAGE_ERROR: {err.message}"))
        
        # Check each page
        pages_to_check = [
            ("http://127.0.0.1:5173/", "Home"),
            ("http://127.0.0.1:5173/upgrade-or-replace", "Calculator")
        ]
        
        results = {}
        
        for url, name in pages_to_check:
            await page.goto(url, wait_until="networkidle")
            await page.wait_for_timeout(3000)
            
            # Take screenshot
            await page.screenshot(path=f"/tmp/{name.replace(' ', '_')}.png")
            
            page_result = await page.evaluate(f"""() => {{
                return {{
                    url: window.location.href,
                    title: document.title,
                    exists: true
                }};
            }}""")
            
            results[name] = {
                "url": url,
                "page_result": page_result,
                "console_errors": console_errors.copy(),
                "js_errors": js_errors.copy()
            }
            
            # Clear errors for next page
            console_errors.clear()
            js_errors.clear()
        
        print(json.dumps(results, indent=2, ensure_ascii=False))
        await browser.close()

asyncio.run(main())
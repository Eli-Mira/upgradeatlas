import asyncio, json, sys
from playwright.async_api import async_playwright

async def check_calculator():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, executable_path="C:/Users/emadg/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe")
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        await page.goto("http://127.0.0.1:5173/upgrade", wait_until="networkidle")
        await page.wait_for_timeout(2000)
        
        # Get full page content
        page_content = await page.evaluate("""() => {
            return {
                title: document.title,
                url: window.location.href,
                body_text: document.body.innerText.slice(0, 2000),
                all_inputs: Array.from(document.querySelectorAll('input, select, textarea')).map(el => ({
                    tag: el.tagName, type: el.type, placeholder: el.placeholder, 
                    id: el.id, name: el.name, value: el.value,
                    class: el.className
                })),
                all_buttons: Array.from(document.querySelectorAll('button')).map(el => ({
                    text: el.textContent.trim().slice(0,50), class: el.className
                })),
                all_classes: Array.from(document.querySelectorAll('[class]')).slice(0,20).map(el => ({
                    tag: el.tagName, class: el.className.slice(0,100)
                }))
            };
        }""")
        
        print(json.dumps(page_content, indent=2, ensure_ascii=False))
        
        # Try to interact with the input
        input_result = await page.evaluate("""() => {
            const input = document.querySelector('input');
            if (input) {
                input.value = 'DEMO-EX-C15-01';
                input.dispatchEvent(new Event('input', {bubbles: true}));
            }
            const btns = Array.from(document.querySelectorAll('button'));
            const submitBtn = btns.find(b => b.textContent.includes('افحص') || b.textContent.includes('submit') || b.textContent.includes('Check'));
            if (submitBtn) submitBtn.click();
            return { input_found: !!input, input_value: input ? input.value : '', submit_btn_found: !!submitBtn };
        }""")
        
        await page.wait_for_timeout(3000)
        
        after_submit = await page.evaluate("""() => {
            const hasChart = document.querySelector('canvas, .chart, .bar-chart, svg');
            const bodyBg = window.getComputedStyle(document.body).backgroundColor;
            const allText = document.body.innerText.slice(0, 1500);
            return {
                has_chart: !!hasChart,
                body_bg: bodyBg,
                text_after_submit: allText.slice(0, 800),
                canvas_count: document.querySelectorAll('canvas').length,
                has_result_area: !!document.querySelector('[class*="result"], [class*="Result"], [class*="output"], [class*="output"]')
            };
        }""")
        
        print(json.dumps(after_submit, indent=2, ensure_ascii=False))
        await browser.close()

asyncio.run(check_calculator())
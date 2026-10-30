import asyncio, json, sys
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, executable_path="C:/Users/emadg/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe")
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        
        # Navigate to calculator page
        await page.goto("http://127.0.0.1:5173/upgrade-or-replace", wait_until="networkidle")
        await page.wait_for_timeout(2000)
        
        calc_data = await page.evaluate("""() => {
            const body = document.body;
            const style = window.getComputedStyle(body);
            
            // Get all inputs
            const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="number"], select'));
            const buttons = Array.from(document.querySelectorAll('button'));
            
            // Check dark mode
            const bg = style.backgroundColor;
            const isDark = (() => {
                const parts = bg.match(/\\d+/g);
                return parts ? parseInt(parts[0]) < 50 : false;
            })();
            
            return {
                url: window.location.href,
                title: document.title,
                is_dark: isDark,
                body_bg: bg,
                body_color: style.color,
                input_count: inputs.length,
                button_count: buttons.length,
                inputs: inputs.map(i => ({
                    id: i.id, name: i.name, type: i.type, 
                    placeholder: i.placeholder, value: i.value,
                    class: i.className.slice(0,60)
                })),
                buttons: buttons.map(b => b.textContent.trim().slice(0,30)),
                has_chart: !!document.querySelector('.uc-chart, .uc-bar'),
                chart_html: document.querySelector('.uc-chart') ? document.querySelector('.uc-chart').outerHTML.slice(0, 300) : 'none'
            };
        }""")
        
        print(json.dumps(calc_data, indent=2, ensure_ascii=False))
        
        # Fill form and submit
        fill_result = await page.evaluate("""() => {
            const inputs = document.querySelectorAll('input');
            inputs.forEach(inp => {
                inp.value = '500';
                inp.dispatchEvent(new Event('input', {bubbles: true}));
            });
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('احسب') || b.textContent.includes('احسبي') || b.textContent.includes('احس'));
            if (btn) btn.click();
            return { filled: inputs.length, btn_found: !!btn };
        }""")
        
        await page.wait_for_timeout(3000)
        
        # Check result
        result_data = await page.evaluate("""() => {
            const chart = document.querySelector('.uc-chart');
            const bars = document.querySelectorAll('.uc-bar');
            const resultSection = document.querySelector('.uc-results');
            return {
                chart_visible: chart ? chart.offsetParent !== null : false,
                bar_count: bars.length,
                bars_info: Array.from(bars).map(b => ({
                    width_pct: b.style.width,
                    class: b.className
                })),
                result_visible: !!resultSection,
                has_error: !!document.querySelector('.uc-error[role="alert"]'),
                api_error_text: document.querySelector('.uc-error') ? document.querySelector('.uc-error').textContent.trim().slice(0,100) : ''
            };
        }""")
        
        print(json.dumps(result_data, indent=2, ensure_ascii=False))
        await browser.close()

asyncio.run(main())
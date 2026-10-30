import asyncio, json, sys
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, executable_path="C:/Users/emadg/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe")
        
        # Mobile detailed check
        mobile = await browser.new_page(viewport={"width": 375, "height": 814})
        await mobile.goto("http://127.0.0.1:5173/", wait_until="networkidle")
        await mobile.wait_for_timeout(2000)
        
        mobile_detail = await mobile.evaluate("""() => {
            const hero = document.querySelector('section');
            if (!hero) return {error: 'no hero section'};
            
            // Get the hero's flex layout
            const style = window.getComputedStyle(hero);
            
            // Check all children of the hero
            const children = Array.from(hero.children).map(el => {
                const s = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                return {
                    tag: el.tagName,
                    display: s.display,
                    flex_dir: s.flexDirection,
                    width: rect.width,
                    height: rect.height,
                    class: el.className.slice(0, 80)
                };
            });
            
            // Check the full page layout
            const bodyStyle = window.getComputedStyle(document.body);
            const htmlStyle = window.getComputedStyle(document.documentElement);
            
            // Check for overflow
            const bodyScrollW = document.body.scrollWidth;
            const winW = window.innerWidth;
            
            return {
                hero_flex_dir: style.flexDirection,
                hero_display: style.display,
                hero_overflow_x: style.overflowX,
                hero_overflow_y: style.overflowY,
                hero_children: children,
                body_width: bodyStyle.width,
                html_dir: htmlStyle.direction,
                body_scroll_width: bodyScrollW,
                viewport_width: winW,
                has_overflow: bodyScrollW > winW + 5,
                full_text: document.body.innerText.slice(0, 500)
            };
        }""")
        
        print(json.dumps(mobile_detail, indent=2, ensure_ascii=False))
        await browser.close()

asyncio.run(main())
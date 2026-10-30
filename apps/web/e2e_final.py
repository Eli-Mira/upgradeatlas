import asyncio, json, sys
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, executable_path="C:/Users/emadg/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe")
        
        # Mobile detail
        mobile = await browser.new_page(viewport={"width": 375, "height": 814})
        await mobile.goto("http://127.0.0.1:5173/", wait_until="networkidle")
        await mobile.wait_for_timeout(2000)
        
        mobile_detail = await mobile.evaluate("""() => {
            const hero = document.querySelector('section');
            const children = Array.from(hero?.children || []);
            
            // Check each child's layout
            const childLayouts = children.map(el => {
                const s = window.getComputedStyle(el);
                const r = el.getBoundingClientRect();
                return {
                    tag: el.tagName,
                    display: s.display,
                    flex_dir: s.flexDirection,
                    width: Math.round(r.width),
                    height: Math.round(r.height),
                    class: el.className.slice(0, 80)
                };
            });
            
            // Check if any child overflows viewport
            const overflows = children.filter(el => {
                const r = el.getBoundingClientRect();
                return r.right > window.innerWidth + 5 || r.left < -5;
            }).map(el => ({
                tag: el.tagName,
                left: Math.round(el.getBoundingClientRect().left),
                right: Math.round(el.getBoundingClientRect().right),
                width: Math.round(el.getBoundingClientRect().width)
            }));
            
            return {
                child_count: children.length,
                child_layouts: childLayouts,
                overflows: overflows,
                has_overflow: overflows.length > 0,
                body_scrollW: document.body.scrollWidth,
                viewportW: window.innerWidth
            };
        }""")
        
        print("MOBILE_DETAIL:")
        print(json.dumps(mobile_detail, indent=2, ensure_ascii=False))
        
        # Desktop detail
        desk = await browser.new_page(viewport={"width": 1440, "height": 900})
        await desk.goto("http://127.0.0.1:5173/", wait_until="networkidle")
        await desk.wait_for_timeout(2000)
        
        desk_detail = await desk.evaluate("""() => {
            const hero = document.querySelector('section');
            const children = Array.from(hero?.children || []);
            const childLayouts = children.map(el => {
                const s = window.getComputedStyle(el);
                const r = el.getBoundingClientRect();
                return {
                    tag: el.tagName,
                    display: s.display,
                    flex_dir: s.flexDirection,
                    width: Math.round(r.width),
                    height: Math.round(r.height),
                    class: el.className.slice(0, 80)
                };
            });
            
            // Check red CTA
            const ctaBtn = Array.from(document.querySelectorAll('a, button')).find(el => {
                const bg = window.getComputedStyle(el).backgroundColor;
                return bg && bg.includes('229, 72, 77') && el.textContent.trim().length > 3;
            });
            
            // Check stats bar
            const statsBar = children[1];
            const statsText = statsBar ? statsBar.textContent.trim() : '';
            
            return {
                child_count: children.length,
                child_layouts: childLayouts,
                cta_found: !!ctaBtn,
                cta_text: ctaBtn ? ctaBtn.textContent.trim() : '',
                cta_bg: ctaBtn ? window.getComputedStyle(ctaBtn).backgroundColor : '',
                stats_bar_text: statsText.slice(0, 200)
            };
        }""")
        
        print("DESKTOP_DETAIL:")
        print(json.dumps(desk_detail, indent=2, ensure_ascii=False))
        
        await browser.close()

asyncio.run(main())
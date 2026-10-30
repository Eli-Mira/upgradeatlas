import asyncio, json, sys
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, executable_path="C:/Users/emadg/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe")
        
        # Mobile hero layout detail
        mobile = await browser.new_page(viewport={"width": 375, "height": 814})
        await mobile.goto("http://127.0.0.1:5173/", wait_until="networkidle")
        await mobile.wait_for_timeout(2000)
        
        mobile_hero = await mobile.evaluate("""() => {
            const hero = document.querySelector('section');
            if (!hero) return {error: 'no hero'};
            
            // Check hero's direct child grid
            const gridEl = hero.querySelector(':scope > div:first-child');
            const gridStyle = gridEl ? window.getComputedStyle(gridEl) : null;
            
            // Check if hero has any media query responsive behavior
            // by looking at the classes
            const heroClass = hero.className;
            const gridClass = gridEl ? gridEl.className : '';
            
            // Check if the hero content and canvas are side by side or stacked
            // by checking each child's position
            const children = Array.from(hero.children);
            const childPositions = children.map((el, i) => {
                const r = el.getBoundingClientRect();
                const s = window.getComputedStyle(el);
                return {
                    index: i,
                    tag: el.tagName,
                    left: Math.round(r.left),
                    top: Math.round(r.top),
                    width: Math.round(r.width),
                    height: Math.round(r.height),
                    display: s.display,
                    position: s.position,
                    class: el.className.slice(0, 60)
                };
            });
            
            // Check hero's own computed layout
            return {
                hero_class: heroClass,
                grid_class: gridClass,
                hero_display: window.getComputedStyle(hero).display,
                hero_flex_dir: window.getComputedStyle(hero).flexDirection,
                hero_grid_template: gridStyle ? gridStyle.gridTemplateColumns : 'N/A',
                child_count: children.length,
                child_positions: childPositions,
                body_width: document.body.scrollWidth,
                viewport_width: window.innerWidth,
                overflow_x: window.getComputedStyle(document.body).overflowX
            };
        }""")
        
        print(json.dumps(mobile_hero, indent=2, ensure_ascii=False))
        
        # Also check desktop for comparison
        desk = await browser.new_page(viewport={"width": 1440, "height": 900})
        await desk.goto("http://127.0.0.1:5173/", wait_until="networkidle")
        await desk.wait_for_timeout(2000)
        
        desk_hero = await desk.evaluate("""() => {
            const hero = document.querySelector('section');
            const gridEl = hero.querySelector(':scope > div:first-child');
            const gridStyle = gridEl ? window.getComputedStyle(gridEl) : null;
            const children = Array.from(hero.children);
            const childPositions = children.map((el, i) => {
                const r = el.getBoundingClientRect();
                return {
                    index: i,
                    tag: el.tagName,
                    left: Math.round(r.left),
                    top: Math.round(r.top),
                    width: Math.round(r.width),
                    height: Math.round(r.height),
                    class: el.className.slice(0, 60)
                };
            });
            return {
                hero_class: hero.className,
                grid_class: gridEl ? gridEl.className : '',
                hero_grid_template: gridStyle ? gridStyle.gridTemplateColumns : 'N/A',
                child_count: children.length,
                child_positions: childPositions
            };
        }""")
        
        print(json.dumps(desk_hero, indent=2, ensure_ascii=False))
        await browser.close()

asyncio.run(main())
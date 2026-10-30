import asyncio, json, sys
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, executable_path="C:/Users/emadg/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe")
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        await page.goto("http://127.0.0.1:5173/", wait_until="networkidle")
        await page.wait_for_timeout(3000)
        
        hero3d_detail = await page.evaluate("""() => {
            const canvas = document.querySelector('canvas');
            if (!canvas) return {error: 'no canvas'};
            
            const ctx = canvas.getContext('webgl') || canvas.getContext('webgl2') || canvas.getContext('experimental-webgl');
            
            // Check for Three.js renderer info
            let rendererInfo = null;
            if (ctx) {
                const ext = ctx.getExtension('WEBGL_debug_renderer_info');
                if (ext) {
                    rendererInfo = {
                        unmasked_vendor: ctx.getParameter(ext.UNMASKED_VENDOR_WEBGL),
                        unmasked_renderer: ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL)
                    };
                }
            }
            
            // Check canvas parent
            const parent = canvas.parentElement;
            const parentRect = parent ? parent.getBoundingClientRect() : null;
            
            // Check if canvas has any Three.js related data attributes
            const dataset = {};
            canvas.dataset && Object.entries(canvas.dataset).forEach(([k,v]) => dataset[k] = v);
            
            // Look for any Three.js scene objects in the DOM
            const threeObjects = Array.from(document.querySelectorAll('*'))
                .filter(el => el.className && el.className.includes('three'))
                .map(el => el.tagName + '.' + el.className.slice(0,60));
            
            // Check window for Three
            const hasThree = typeof window.THREE !== 'undefined' || 
                             document.querySelector('[class*="Canvas"]') ||
                             canvas.parentElement?.className.includes('Canvas');
            
            return {
                canvas_exists: true,
                canvas_visible: canvas.offsetParent !== null,
                canvas_width: canvas.width,
                canvas_height: canvas.height,
                canvas_css_size: {width: canvas.style.width, height: canvas.style.height},
                webgl_context: !!ctx,
                renderer_info: rendererInfo,
                parent_class: parent ? parent.className : '',
                parent_rect: parentRect ? {w: parentRect.width, h: parentRect.height} : null,
                three_in_window: typeof window.THREE !== 'undefined',
                has_three_canvas_class: hasThree,
                three_dom_objects: threeObjects,
                text_content_around: document.body.innerText.slice(0, 300)
            };
        }""")
        
        print(json.dumps(hero3d_detail, indent=2, ensure_ascii=False))
        
        # Try interacting with canvas
        canvas_rect = await page.evaluate("""() => {
            const c = document.querySelector('canvas');
            if (!c) return null;
            const r = c.getBoundingClientRect();
            return {x: Math.floor(r.x + r.width/2), y: Math.floor(r.y + r.height/2)};
        }""")
        
        if canvas_rect:
            await page.mouse.move(canvas_rect['x'], canvas_rect['y'])
            await page.mouse.down()
            await page.mouse.up()
            await page.mouse.move(canvas_rect['x'] + 50, canvas_rect['y'] - 30)
            await page.wait_for_timeout(1000)
            
            after_interact = await page.evaluate("""() => {
                const canvas = document.querySelector('canvas');
                return {
                    width_after: canvas ? canvas.width : 0,
                    height_after: canvas ? canvas.height : 0,
                    visible: canvas ? canvas.offsetParent !== null : false
                };
            }""")
            print(json.dumps(after_interact, indent=2))
        
        await browser.close()

asyncio.run(main())
import asyncio, json, sys
from playwright.async_api import async_playwright

async def check_hero3d():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, executable_path="C:/Users/emadg/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe")
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        await page.goto("http://127.0.0.1:5173/", wait_until="networkidle")
        await page.wait_for_timeout(3000)
        
        # Check Hero3D interaction
        hero3d_info = await page.evaluate("""() => {
            const canvas = document.querySelector('canvas');
            const ctx = canvas ? canvas.getContext('webgl') || canvas.getContext('webgl2') || canvas.getContext('experimental-webgl') : null;
            const threeInWindow = window.THREE || window.three;
            
            // Check for any Three.js objects
            const sceneChecks = [];
            
            return {
                canvas_visible: canvas && canvas.offsetParent !== null,
                canvas_width: canvas ? canvas.width : 0,
                canvas_height: canvas ? canvas.height : 0,
                canvas_css_width: canvas ? canvas.style.width : 'none',
                canvas_css_height: canvas ? canvas.style.height : 'none',
                webgl_context: !!ctx,
                three_available: !!threeInWindow,
                canvas_parent_class: canvas && canvas.parentElement ? canvas.parentElement.className : '',
                canvas_siblings: canvas ? Array.from(canvas.parentElement?.children || []).filter(c => c !== canvas).map(c => c.tagName + '.' + c.className.slice(0,50)) : [],
                any_3d_class: Array.from(document.querySelectorAll('[class*="3D"], [class*="3d"], [class*="three"], [class*="Hero3D"]')).map(el => el.tagName + '.' + el.className.slice(0,80)),
                mouse_move_supported: canvas ? typeof canvas.addEventListener === 'function' : false,
                animation_frame_requested: window.requestAnimationFrame ? true : false
            };
        }""")
        
        print(json.dumps(hero3d_info, indent=2, ensure_ascii=False))
        
        # Try hovering over the canvas to trigger interaction
        if hero3d_info['canvas_visible']:
            canvas_rect = await page.evaluate("""() => {
                const c = document.querySelector('canvas');
                if (!c) return null;
                const r = c.getBoundingClientRect();
                return {x: r.x + r.width/2, y: r.y + r.height/2, width: r.width, height: r.height};
            }""")
            
            if canvas_rect:
                await page.mouse.move(canvas_rect['x'], canvas_rect['y'])
                await page.wait_for_timeout(1000)
                
                after_hover = await page.evaluate("""() => {
                    const canvas = document.querySelector('canvas');
                    return {
                        canvas_width_after: canvas ? canvas.width : 0,
                        canvas_height_after: canvas ? canvas.height : 0,
                        gl_renderer: null
                    };
                }""")
                print(json.dumps(after_hover, indent=2))
        
        await browser.close()

asyncio.run(check_hero3d())
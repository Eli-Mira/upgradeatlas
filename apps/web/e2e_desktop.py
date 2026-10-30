import asyncio, json, sys
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, executable_path="C:/Users/emadg/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe")
        
        # Desktop full check
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        await page.goto("http://127.0.0.1:5173/", wait_until="networkidle")
        await page.wait_for_timeout(3000)
        
        desktop_detail = await page.evaluate("""() => {
            const hero = document.querySelector('section');
            if (!hero) return {error: 'no hero'};
            
            const style = window.getComputedStyle(hero);
            const rect = hero.getBoundingClientRect();
            
            // Find all visible text elements with numbers
            const numbered = Array.from(document.querySelectorAll('*')).filter(el => {
                const text = el.textContent || '';
                return /[\\d]+/.test(text) && el.offsetParent !== null && text.trim().length < 100;
            }).map(el => ({
                tag: el.tagName,
                text: el.textContent.trim().slice(0, 60),
                class: el.className.slice(0, 60),
                visible: el.offsetParent !== null
            }));
            
            // Stats in hero
            const heroChildren = Array.from(hero.children).map(el => {
                const s = window.getComputedStyle(el);
                const r = el.getBoundingClientRect();
                return {
                    tag: el.tagName,
                    display: s.display,
                    flex_dir: s.flexDirection,
                    width: r.width,
                    height: r.height,
                    text: el.textContent.trim().slice(0, 80),
                    class: el.className.slice(0, 60)
                };
            });
            
            return {
                hero_rect: {width: rect.width, height: rect.height},
                hero_flex_dir: style.flexDirection,
                hero_display: style.display,
                hero_overflow_x: style.overflowX,
                hero_children: heroChildren,
                numbered_elements: numbered.slice(0, 10),
                full_text: document.body.innerText.slice(0, 800)
            };
        }""")
        
        print(json.dumps(desktop_detail, indent=2, ensure_ascii=False))
        
        # Console errors check
        console_msgs = []
        page.on("console", lambda msg: console_msgs.append(f"[{msg.type}] {msg.text}"))
        page.on("pageerror", lambda err: console_msgs.append(f"PAGE_ERROR: {err}"))
        
        # Reload to capture fresh errors
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(3000)
        
        print(json.dumps({"console_messages": console_msgs}, indent=2))
        
        await browser.close()

asyncio.run(main())
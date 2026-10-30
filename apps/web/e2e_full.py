import asyncio, json, sys
from playwright.async_api import async_playwright

async def run_all_checks():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, executable_path="C:/Users/emadg/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe")
        
        # ========== CHECK 1: Desktop Hero (1440x900) ==========
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        errors = []
        page.on("console", lambda msg: errors.append(f"[{msg.type}] {msg.text}") if msg.type in ("error", "warning") else None)
        page.on("pageerror", lambda err: errors.append(f"PAGE_ERROR: {err}"))
        
        await page.goto("http://127.0.0.1:5173/", wait_until="networkidle")
        await page.wait_for_timeout(3000)
        
        # Get hero section
        hero_data = await page.evaluate("""() => {
            const hero = document.querySelector('section');
            if (!hero) return null;
            const rect = hero.getBoundingClientRect();
            const style = window.getComputedStyle(hero);
            return {
                visible: rect.height > 0 && rect.width > 0,
                height: rect.height,
                width: rect.width,
                bg: style.backgroundColor,
                classes: hero.className,
                text: hero.textContent.trim().slice(0, 200)
            };
        }""")
        
        # Find all buttons/links and check for red ones
        btn_data = await page.evaluate("""() => {
            const els = Array.from(document.querySelectorAll('a, button'));
            return els.map(el => {
                const s = window.getComputedStyle(el);
                return {
                    tag: el.tagName,
                    text: el.textContent.trim().slice(0,60),
                    bg: s.backgroundColor,
                    color: s.color,
                    visible: el.offsetParent !== null,
                    class: el.className
                };
            }).filter(b => b.visible).slice(0, 10);
        }""")
        
        # Check for stats
        stats_data = await page.evaluate("""() => {
            const texts = Array.from(document.querySelectorAll('h1,h2,h3,h4,p,span,li')).map(el => ({
                tag: el.tagName,
                text: el.textContent.trim().slice(0, 80),
                visible: el.offsetParent !== null
            }));
            return texts.filter(t => t.visible).slice(0, 15);
        }""")
        
        # ========== CHECK 2: Mobile 375x814 ==========
        mobile_page = await browser.new_page(viewport={"width": 375, "height": 814})
        await mobile_page.goto("http://127.0.0.1:5173/", wait_until="networkidle")
        await mobile_page.wait_for_timeout(2000)
        
        mobile_layout = await mobile_page.evaluate("""() => {
            const hero = document.querySelector('section');
            if (!hero) return null;
            const rect = hero.getBoundingClientRect();
            const style = window.getComputedStyle(hero);
            const display = style.display;
            const flexDirection = style.flexDirection;
            const overflowX = style.overflowX;
            const bodyWidth = document.body.scrollWidth;
            const viewportWidth = window.innerWidth;
            return {
                section_visible: rect.height > 0,
                section_height: rect.height,
                display: display,
                flex_direction: flexDirection,
                overflow_x: overflowX,
                body_width: bodyWidth,
                viewport_width: viewportWidth,
                has_horizontal_overflow: bodyWidth > viewportWidth + 5
            };
        }""")
        
        mobile_buttons = await mobile_page.evaluate("""() => {
            const btns = Array.from(document.querySelectorAll('button, a'));
            return btns.filter(b => b.offsetParent !== null).map(b => ({
                text: b.textContent.trim().slice(0, 40),
                visible: true
            })).slice(0, 5);
        }""")
        
        # ========== CHECK 3: Arabic RTL ==========
        rtl_check = await page.evaluate("""() => {
            const html = document.documentElement;
            return {
                dir_attribute: html.getAttribute('dir'),
                lang_attribute: html.getAttribute('lang'),
                is_rtl: html.getAttribute('dir') === 'rtl',
                body_style: window.getComputedStyle(document.body).direction,
                has_arabic_font: document.fonts ? document.fonts.check('16px "IBM Plex Sans Arabic"') : false
            };
        }""")
        
        # Get some Arabic text content
        arabic_content = await page.evaluate("""() => {
            const h1 = document.querySelector('h1');
            const h2 = document.querySelector('h2');
            return {
                h1: h1 ? h1.textContent.trim().slice(0, 100) : '',
                h2: h2 ? h2.textContent.trim().slice(0, 100) : '',
                all_text: document.body.innerText.slice(0, 300)
            };
        }""")
        
        # ========== CHECK 4: Calculator Dark Mode ==========
        calc_page = await browser.new_page(viewport={"width": 1440, "height": 900})
        await calc_page.goto("http://127.0.0.1:5173/upgrade", wait_until="networkidle")
        await calc_page.wait_for_timeout(2000)
        
        calc_data = await calc_page.evaluate("""() => {
            const body = document.body;
            const style = window.getComputedStyle(body);
            const calcSection = document.querySelector('[class*="calculator"], [class*="Calculator"], .upgrade-calculator');
            const bg = calcSection ? window.getComputedStyle(calcSection).backgroundColor : style.backgroundColor;
            const color = style.color;
            const is_dark = parseInt(bg.split(',')[1]) < 80;
            
            // Check for form elements
            const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
            const buttons = Array.from(document.querySelectorAll('button'));
            
            return {
                body_bg: bg,
                body_color: color,
                is_dark_mode: is_dark,
                input_count: inputs.length,
                button_count: buttons.length,
                inputs: inputs.slice(0,5).map(i => ({tag: i.tagName, type: i.type, placeholder: i.placeholder})),
                buttons: buttons.slice(0,5).map(b => b.textContent.trim().slice(0,30))
            };
        }""")
        
        # Try filling and submitting calculator
        fill_result = await calc_page.evaluate("""() => {
            const inputs = document.querySelectorAll('input, select');
            let filled = 0;
            inputs.forEach(inp => {
                if (inp.type === 'number' || inp.tagName === 'SELECT') {
                    if (inp.options && inp.options.length > 0) {
                        inp.selectedIndex = Math.min(1, inp.options.length - 1);
                    } else {
                        inp.value = '1';
                    }
                    filled++;
                }
            });
            const submitBtn = Array.from(document.querySelectorAll('button')).find(b => 
                b.textContent.includes('احسب') || b.textContent.includes('calculate') || b.textContent.includes('计算') || b.textContent.includes('submit')
            );
            if (submitBtn) submitBtn.click();
            return { filled_inputs: filled, submit_clicked: !!submitBtn };
        }""")
        
        await calc_page.wait_for_timeout(2000)
        
        chart_data = await calc_page.evaluate("""() => {
            const canvas = document.querySelector('canvas');
            const svg = document.querySelector('svg');
            return {
                has_canvas: !!canvas,
                canvas_count: document.querySelectorAll('canvas').length,
                has_svg_chart: !!svg,
                svg_children: svg ? svg.children.length : 0,
                bar_elements: document.querySelectorAll('.bar, rect[height]').length
            };
        }""")
        
        # ========== CHECK 5: Console Errors ==========
        console_errors = errors
        
        # ========== CHECK 6: Hero3D Canvas ==========
        hero3d_data = await page.evaluate("""() => {
            const canvas = document.querySelector('canvas');
            const hero3d = document.querySelector('[class*="Hero3D"], [class*="hero3d"], [id*="3d"]');
            return {
                has_canvas: !!canvas,
                canvas_count: document.querySelectorAll('canvas').length,
                hero3d_exists: !!hero3d,
                hero3d_class: hero3d ? hero3d.className : '',
                canvas_visible: canvas ? canvas.offsetParent !== null : false,
                canvas_width: canvas ? canvas.width : 0,
                canvas_height: canvas ? canvas.height : 0,
                canvas_rect: canvas ? JSON.stringify(canvas.getBoundingClientRect()) : null
            };
        }""")
        
        await browser.close()
        
        print("RESULT:" + json.dumps({
            "check1_desktop_hero": {
                "title": "UpgradeAtlas",
                "hero_visible": hero_data["visible"] if hero_data else False,
                "hero_height": hero_data["height"] if hero_data else 0,
                "hero_bg": hero_data["bg"] if hero_data else "",
                "buttons": btn_data,
                "stats_samples": stats_data[:5],
            },
            "check2_mobile": {
                "layout": mobile_layout,
                "buttons": mobile_buttons,
            },
            "check3_rtl": {
                "rtl": rtl_check,
                "arabic_content": arabic_content,
            },
            "check4_calculator": {
                "dark_mode": calc_data,
                "fill_result": fill_result,
                "chart": chart_data,
            },
            "check5_console_errors": console_errors,
            "check6_hero3d": hero3d_data,
        }, indent=2, ensure_ascii=False))

asyncio.run(run_all_checks())
# motion/render.py — Playwright-driven render of studio.html into assets/*.webp
# Uses Hermes venv: C:/Users/emadg/AppData/Local/hermes/hermes-agent/venv/Scripts/python.exe
# Usage: python motion/render.py
import asyncio, base64, io, pathlib
from playwright.async_api import async_playwright
import PIL.Image as Image
from PIL import ImageStat

LAB = pathlib.Path(__file__).resolve().parent.parent
ASSETS = LAB / "assets"
ASSETS.mkdir(exist_ok=True)
URL = "http://127.0.0.1:5174/motion/studio.html"

# preset -> (resolution_str, output filename)
JOBS = [
    ("hero-desktop",   "1920x1080", "hero-desktop.webp"),
    ("hero-mobile",    "1080x1920", "hero-mobile.webp"),
    ("catalog-front",  "1920x1080", "catalog-01.webp"),
    ("catalog-top",    "1920x1080", "catalog-02.webp"),
    ("catalog-detail", "1920x1080", "catalog-03.webp"),
]


async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context()
        page = await ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        await page.goto(URL, wait_until="networkidle", timeout=20000)
        await page.wait_for_selector("#batchBtn", timeout=10000)
        await asyncio.sleep(1.0)  # let studio build
        # capture all renders via batch mode
        await page.evaluate("""
            (async () => {
                const results = {};
                const keys = Object.keys(window.__studio ? window.__studio.presets : {});
                // the batch button handles it; just invoke it
                document.getElementById('batchBtn').onclick();
            })()
        """)
        # Wait for window.__renders to appear
        await page.wait_for_function("Object.keys(window.__renders||{}).length >= 5", timeout=30000)
        renders = await page.evaluate("window.__renders")
        for preset, res, outname in JOBS:
            data_url = renders.get(preset)
            assert data_url, f'{preset}: no exported frame'
            _, b64 = data_url.split(",", 1)
            raw = base64.b64decode(b64)
            img = Image.open(io.BytesIO(raw))
            assert img.size == tuple(map(int, res.split('x'))), f'{preset}: wrong dimensions {img.size}'
            assert max(ImageStat.Stat(img.convert('RGB')).stddev) > 5, f'{preset}: blank frame rejected'
            img.save(ASSETS / outname, format="WEBP", quality=90, optimize=True)
            sz = (ASSETS / outname).stat().st_size
            print(f"  {preset}: {img.size[0]}x{img.size[1]}  {sz/1024:.1f}KB -> {outname}")
        await browser.close()
        assert not errors, f'Studio errors: {errors}'


if __name__ == "__main__":
    asyncio.run(run())

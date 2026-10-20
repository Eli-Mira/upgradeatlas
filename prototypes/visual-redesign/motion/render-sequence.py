"""Pre-render the hero product sequence.

Drives motion/product.html in a real browser, writes each frame to
assets/sequence/frame-NNN.webp with an alpha channel.

    python motion/render-sequence.py

Requires the lab dev server on http://127.0.0.1:5174.
"""
import asyncio
import base64
import io
import pathlib

import PIL.Image as Image
from PIL import ImageStat
from playwright.async_api import async_playwright

LAB = pathlib.Path(__file__).resolve().parent.parent
OUT = LAB / "assets" / "sequence"
URL = "http://127.0.0.1:5174/motion/product.html"
EXPECTED = 16


async def run() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for stale in OUT.glob("frame-*.webp"):
        stale.unlink()

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        errors: list[str] = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.on(
            "console",
            lambda m: errors.append(f"console.{m.type}: {m.text}")
            if m.type == "error"
            else None,
        )

        await page.goto(URL, wait_until="networkidle", timeout=30000)
        await page.wait_for_function("window.__frames !== undefined", timeout=20000)
        frames = await page.evaluate("window.__frames()")
        exploded = await page.evaluate("() => [window.__exploded(0), window.__exploded(1)]")
        await browser.close()

    assert not errors, f"studio errors: {errors}"
    assert len(frames) == EXPECTED, f"expected {EXPECTED} frames, got {len(frames)}"

    total = 0
    for index, data_url in enumerate(frames):
        _, b64 = data_url.split(",", 1)
        image = Image.open(io.BytesIO(base64.b64decode(b64)))
        assert image.mode == "RGBA", f"frame {index} is not RGBA"
        assert max(ImageStat.Stat(image.convert("RGB")).stddev) > 5, f"frame {index} is blank"
        target = OUT / f"frame-{index:03d}.webp"
        image.save(target, format="WEBP", quality=86, method=6)
        total += target.stat().st_size
        print(f"  frame {index:02d}: {image.size[0]}x{image.size[1]}  {target.stat().st_size/1024:.1f}KB")

    # the conceptual exploded view: assembled and separated
    for index, data_url in enumerate(exploded):
        _, b64 = data_url.split(",", 1)
        image = Image.open(io.BytesIO(base64.b64decode(b64)))
        name = "exploded-assembled" if index == 0 else "exploded-separated"
        image.save(OUT / f"{name}.webp", format="WEBP", quality=88, method=6)
        print(f"  {name}: {image.size[0]}x{image.size[1]}")

    print(f"  {len(frames)} frames, {total/1024:.0f}KB total")


if __name__ == "__main__":
    asyncio.run(run())

"""Actual keyboard/button inspection; fixture shares the delivered React component."""
from playwright.sync_api import sync_playwright, expect
from PIL import Image, ImageChops
from io import BytesIO
import re
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 900, 'height': 600})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto('http://127.0.0.1:5174/motion/inspect.html', wait_until='networkidle')
    page.get_by_role('button', name=re.compile('^Inspect concept')).click()
    canvas = page.locator('canvas')
    expect(canvas).to_be_visible(timeout=10000)
    page.wait_for_function('document.querySelector("[data-inspect-ready]")?.dataset.inspectReady === "true"')
    a = Image.open(BytesIO(canvas.screenshot())).convert('RGB')
    page.get_by_role('button', name='Rotate left', exact=True).click()
    b = Image.open(BytesIO(canvas.screenshot())).convert('RGB')
    assert ImageChops.difference(a, b).getbbox(), 'Rotate button did not change rendered image'
    page.get_by_role('button', name='Show static poster', exact=True).click()
    expect(canvas).not_to_be_visible()
    page.get_by_role('button', name=re.compile('^Inspect concept')).click()
    expect(canvas).to_be_visible()
    assert not errors, errors
    page.emulate_media(reduced_motion='reduce')
    expect(canvas).not_to_be_visible()
    expect(page.get_by_role('button', name=re.compile('^Inspect concept'))).to_have_count(0)
    browser.close()
print('PASS: inspect, rotate, return, reopen and reduced-motion fallback')

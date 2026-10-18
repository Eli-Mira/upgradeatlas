"""The concept chassis must be a thin horizontal deck, not an upright wall."""
from playwright.sync_api import sync_playwright
import json
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://127.0.0.1:5174/motion/studio.html', wait_until='networkidle')
    result = page.evaluate('''async () => {
        const {buildLaptop} = await import('/motion/laptop.js');
        const laptop = buildLaptop();
        const deck = laptop.getObjectByName('base');
        deck.geometry.computeBoundingBox();
        const b = deck.geometry.boundingBox;
        return {width:b.max.x-b.min.x, height:b.max.y-b.min.y, depth:b.max.z-b.min.z,
                ports:laptop.children.filter(c=>c.name==='port').length};
    }''')
    browser.close()
print(json.dumps(result))
assert result['height'] < result['width'] / 10, 'Chassis deck is vertical instead of horizontal'
assert result['depth'] > result['height'] * 5, 'Deck footprint has no usable depth'
assert result['ports'] >= 2, 'Created port meshes were never attached to the laptop'
print('PASS: thin horizontal deck and attached ports')

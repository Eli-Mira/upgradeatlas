"""Regression: the supplied visible canvas must contain the rendered studio."""
from pathlib import Path
import base64
import io
import json
from PIL import Image, ImageStat
from playwright.sync_api import sync_playwright

LAB = Path(__file__).resolve().parents[1]
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://127.0.0.1:5174/motion/studio.html', wait_until='networkidle')
    result = page.evaluate('''async () => {
        const {buildStudio} = await import('/motion/studio.js');
        const canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
        const studio = buildStudio({canvas, width: 960, height: 640, dpr: 1});
        studio.renderer.render(studio.scene, studio.camera);
        const result = {sameCanvas: studio.renderer.domElement === canvas,
                        data: canvas.toDataURL('image/png'),
                        meshes: 0};
        studio.scene.traverse(o => {if(o.isMesh) result.meshes++});
        studio.renderer.dispose();
        canvas.remove();
        return result;
    }''')
    browser.close()
image = Image.open(io.BytesIO(base64.b64decode(result.pop('data').split(',')[1]))).convert('RGB')
result['pixel_extrema'] = image.getextrema()
result['pixel_stddev'] = ImageStat.Stat(image).stddev
print(json.dumps(result))
assert result['sameCanvas'], 'Renderer ignores the supplied canvas; exported visible canvas remains blank'
assert max(result['pixel_stddev']) > 5, 'Studio pixels are uniform, no visible laptop rendered'
assert max(channel[1] for channel in result['pixel_extrema']) > 50, 'No readable hardware highlights'
print('PASS: supplied canvas contains non-uniform rendered studio pixels')

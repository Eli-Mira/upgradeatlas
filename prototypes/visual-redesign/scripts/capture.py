"""Render the three isolated prototypes in Chromium; evidence, not visual approval."""
from pathlib import Path
import argparse
import json
from playwright.sync_api import sync_playwright

LAB = Path(__file__).resolve().parents[1]
PAGES = {'home': '/', 'catalog': '/laptops', 'calculator': '/calculator'}
VIEWPORTS = {'desktop': {'width': 1440, 'height': 1000},
             'tablet': {'width': 834, 'height': 1112},
             'mobile': {'width': 390, 'height': 844}}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--base-url', default='http://127.0.0.1:5174')
    parser.add_argument('--label', default='iteration-1')
    args = parser.parse_args()
    if not args.label.replace('-', '').replace('_', '').isalnum():
        raise SystemExit('Use a simple alphanumeric capture label')
    target = LAB / 'screenshots' / args.label
    target.mkdir(parents=True, exist_ok=True)
    manifest = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            for locale in ('en', 'ar'):
                for screen, viewport in VIEWPORTS.items():
                    context = browser.new_context(viewport=viewport, device_scale_factor=1,
                                                  locale='ar-EG' if locale == 'ar' else 'en-EG',
                                                  reduced_motion='reduce')
                    try:
                        for name, route in PAGES.items():
                            page = context.new_page()
                            errors = []
                            page.on('pageerror', lambda error: errors.append(str(error)))
                            page.on('console', lambda message: errors.append(message.text)
                                    if message.type == 'error' else None)
                            url = f'{args.base_url.rstrip("/")}{route}?lang={locale}'
                            response = page.goto(url, wait_until='networkidle', timeout=45000)
                            page.evaluate('document.fonts.ready')
                            height = page.evaluate('document.documentElement.scrollHeight')
                            for y in range(0, height, viewport['height']):
                                page.evaluate('y => window.scrollTo(0,y)', y)
                                page.wait_for_timeout(80)
                            page.wait_for_load_state('networkidle')
                            page.evaluate('window.scrollTo(0,0)')
                            page.wait_for_function('Array.from(document.images).every(i => i.complete)', timeout=20000)
                            page.screenshot(path=str(target / f'{name}-{locale}-{screen}.png'), full_page=True)
                            state = page.evaluate('''() => ({
                                lang: document.documentElement.lang,
                                dir: document.documentElement.dir,
                                title: document.title,
                                h1: Array.from(document.querySelectorAll('h1')).map(e => e.textContent),
                                bodyWidth: document.body.scrollWidth,
                                viewportWidth: innerWidth,
                                brokenImages: Array.from(document.images).filter(i => !i.naturalWidth).map(i => i.src),
                                background: getComputedStyle(document.body).backgroundColor
                            })''')
                            row = {'page': name, 'locale': locale, 'viewport': screen,
                                   'width': viewport['width'], 'height': viewport['height'],
                                   'url': url, 'http_status': response.status if response else None,
                                   'file': (target / f'{name}-{locale}-{screen}.png').relative_to(LAB).as_posix(),
                                   'state': state, 'browser_errors': errors,
                                   'capture_motion': 'reduced; separate motion testing required'}
                            manifest.append(row)
                            (target / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
                            print(json.dumps({'captured': row['file'], 'status': row['http_status'],
                                              'lang': state['lang'], 'dir': state['dir'], 'errors': len(errors)}, ensure_ascii=False))
                            page.close()
                    finally:
                        context.close()
        finally:
            browser.close()
    files = sorted(target.glob('*.png'))
    expected = len(PAGES) * len(VIEWPORTS) * len(('en', 'ar'))
    assert len(manifest) == expected and len(files) == expected, 'Incomplete screenshot matrix'
    assert all(not row['browser_errors'] for row in manifest), 'Runtime errors in captured pages'
    assert all(row['state']['lang'] == row['locale'] and row['state']['dir'] == ('rtl' if row['locale'] == 'ar' else 'ltr') for row in manifest), 'Wrong captured locale'
    assert all(len(row['state']['h1']) == 1 and not row['state']['brokenImages'] for row in manifest), 'Missing page content/images'
    print(json.dumps({'count': len(files), 'expected': expected, 'manifest': str(target / 'manifest.json')}))


if __name__ == '__main__':
    main()

"""Required six page/locale renders: no runtime errors and actual visible content."""
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for lang in ('en', 'ar'):
        for route in ('/', '/laptops', '/calculator'):
            page = browser.new_page(viewport={'width':1440,'height':1000})
            errors=[]
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.goto(f'http://127.0.0.1:5174{route}?lang={lang}', wait_until='networkidle')
            assert not errors, f'{route}/{lang}: runtime errors {errors}'
            assert page.locator('h1').count() == 1, f'{route}/{lang}: missing/duplicate heading'
            assert page.locator('h1').inner_text().strip(), f'{route}/{lang}: empty heading'
            assert page.locator('html').get_attribute('lang') == lang
            assert page.locator('html').get_attribute('dir') == ('rtl' if lang=='ar' else 'ltr')
            if route == '/laptops':
                assert page.get_by_test_id('product-card').count() == 6
            if route == '/calculator':
                assert page.locator('input[inputmode="decimal"]').count() == 4
                assert page.get_by_test_id('cost-result').is_visible()
            print('PASS', route,lang)
            page.close()
    browser.close()
print('PASS: all six page/locale smoke controls')

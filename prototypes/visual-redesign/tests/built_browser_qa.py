"""Exercise the actual Vite build on the loopback preview server (port 5175)."""
from pathlib import Path
import json
from datetime import datetime, timezone

from playwright.sync_api import sync_playwright, expect

LAB = Path(__file__).resolve().parents[1]
OUT = LAB / 'evidence' / 'legacy-retirement'
SERVER = 'http://127.0.0.1:5175'


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    records = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            for lang in ('en', 'ar'):
                for route in ('/', '/laptops', '/calculator'):
                    for width in (320, 390, 834, 1440):
                        with browser.new_context(viewport={'width': width, 'height': 900}, reduced_motion='reduce') as ctx:
                            page = ctx.new_page()
                            errors, warnings, failed_requests, bad_responses = [], [], [], []
                            page.on('pageerror', lambda error: errors.append(str(error)))
                            page.on('console', lambda message: (errors if message.type == 'error' else warnings).append(message.text) if message.type in ('error', 'warning') else None)
                            page.on('requestfailed', lambda request: failed_requests.append({'url': request.url, 'failure': request.failure}))
                            page.on('response', lambda response: bad_responses.append({'url': response.url, 'status': response.status}) if response.status >= 400 else None)
                            response = page.goto(f'{SERVER}{route}?lang={lang}', wait_until='networkidle')
                            assert response.status == 200
                            expect(page.locator('h1')).to_have_count(1)
                            expect(page.locator('h1')).to_be_visible()
                            expect(page.locator('html')).to_have_attribute('lang', lang)
                            expect(page.locator('html')).to_have_attribute('dir', 'rtl' if lang == 'ar' else 'ltr')
                            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 2')
                            assert not page.locator('[src*="/src/App.jsx"], [src*="/src/main.jsx"]').count()
                            if route == '/laptops':
                                expect(page.get_by_test_id('product-card')).to_have_count(6)
                            if route == '/calculator':
                                expect(page.get_by_test_id('total-upgrade')).to_be_visible()
                                expect(page.locator('input[inputmode="decimal"]')).to_have_count(4)
                            screenshot = None
                            if width == 390:
                                screenshot = f'built-{route.strip("/") or "home"}-{lang}-390.png'
                                page.screenshot(path=str(OUT / screenshot), full_page=True)
                            assert not errors, errors
                            assert not warnings, warnings
                            assert not failed_requests, failed_requests
                            assert not bad_responses, bad_responses
                            records.append({'route': route, 'lang': lang, 'width': width, 'ok': True, 'page_console_errors': errors, 'console_warnings': warnings, 'failed_requests': failed_requests, 'http_errors': bad_responses, 'screenshot': screenshot})
            with browser.new_context(viewport={'width': 1440, 'height': 900}, reduced_motion='reduce') as ctx:
                page = ctx.new_page()
                errors = []
                page.on('pageerror', lambda error: errors.append(str(error)))
                page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
                page.goto(f'{SERVER}/laptops?lang=en', wait_until='networkidle')
                buttons = page.locator('.compare-button')
                for index in range(4):
                    buttons.nth(index).click()
                expect(page.locator('.compare-tray strong')).to_have_text('4 / 4')
                expect(buttons.nth(4)).to_be_disabled()
                expect(buttons.nth(5)).to_be_disabled()
                page.locator('.compare-tray .button.primary').click()
                expect(page.locator('dialog[open]')).to_be_visible()
                expect(page.locator('.compare-table thead th')).to_have_count(5)
                assert page.locator('tr.different').count() >= 2
                page.keyboard.press('Escape')
                expect(page.locator('dialog[open]')).to_have_count(0)
                expect(page.locator('.compare-tray .button.primary')).to_be_focused()
                page.locator('.product-name').first.click()
                expect(page.locator('dialog[open]')).to_be_visible()
                page.keyboard.press('Escape')
                expect(page.locator('.product-name').first).to_be_focused()
                records.append({'interaction': 'four-product cap, comparison, detail dialogs and focus restore', 'ok': True})
                page.goto(f'{SERVER}/calculator?lang=ar', wait_until='networkidle')
                for field, value in [('ram_cost_egp', '١٠٠٠'), ('ssd_cost_egp', '۲۰۰۰'), ('installation_cost_egp', '3000'), ('replacement_cost_egp', '6000')]:
                    page.locator(f'input[name="{field}"]').fill(value)
                expect(page.locator('[data-testid^="total-"]')).to_have_count(0)
                page.locator('button[type="submit"]').click()
                expect(page.locator('.verdict.equal')).to_be_visible()
                page.locator('input[name="replacement_cost_egp"]').fill('0')
                expect(page.locator('[data-testid^="total-"]')).to_have_count(0)
                page.locator('button[type="submit"]').click()
                expect(page.get_by_test_id('total-replacement')).to_be_visible()
                assert not errors, errors
                records.append({'interaction': 'Arabic/Persian input, equal costs, stale-result removal and zero replacement', 'ok': True, 'runtime_errors': errors})
        finally:
            browser.close()
    result = {'generated': datetime.now(timezone.utc).isoformat(), 'server': SERVER, 'page_checks': sum('route' in item for item in records), 'interaction_journeys': sum('interaction' in item for item in records), 'failed': 0, 'records': records}
    (OUT / 'built-browser.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({key: result[key] for key in ('page_checks', 'interaction_journeys', 'failed')}))


if __name__ == '__main__':
    main()

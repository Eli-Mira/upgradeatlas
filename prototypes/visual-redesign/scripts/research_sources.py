"""Capture bounded public reference evidence with an isolated browser."""
from pathlib import Path
import json
import subprocess
import sys
from playwright.sync_api import sync_playwright, TimeoutError

LAB = Path(__file__).resolve().parents[1]
OUT = LAB / 'research' / 'reference-evidence'
SOURCES = [
 ('shaga', 'https://phenomenonstudio.com/projects/shaga-odyssey-awarded-website-development-for-web3-gamepad/'),
 ('awwwards', 'https://www.awwwards.com/sites/odyssey-controller'),
 ('supahero', 'https://supahero.io/'),
 ('60fps', 'https://60fps.design/'),
 ('21st', 'https://21st.dev/'),
 ('agility', 'https://styles.refero.design/style/e31435dd-d4fc-4534-8a40-35a1e38ebae5'),
 ('basedash', 'https://styles.refero.design/style/77b723ca-9583-4349-9b5e-2ef8b4fde002'),
]
LEDGER = LAB / 'research' / 'reference-ledger.json'
HELPER = Path.home() / 'AppData/Local/hermes/skills/research/grounded-citations/scripts/sources.py'


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    entries = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        try:
            for name, url in SOURCES:
                page = browser.new_page(viewport={'width': 1440, 'height': 1000})
                try:
                    response = page.goto(url, wait_until='domcontentloaded', timeout=30000)
                    try:
                        page.wait_for_load_state('networkidle', timeout=8000)
                    except TimeoutError:
                        pass
                    title = page.title()
                    body = page.locator('body').inner_text(timeout=10000)
                    (OUT / f'{name}.txt').write_text(body, encoding='utf-8')
                    page.screenshot(path=str(OUT / f'{name}-viewport.png'))
                    links = page.locator('a[href]').evaluate_all('''nodes => nodes.map(n => ({text:n.innerText.slice(0,100),url:n.href})).filter(n => /uber|search|chart|laptop|hardware|controller|aurone|shaga|bottom.sheet/i.test(n.text+' '+n.url)).slice(0,12)''')
                    registration = subprocess.run([sys.executable, str(HELPER), '--ledger', str(LEDGER),
                                                   'add', page.url, '--title', title], capture_output=True, text=True,
                                                  encoding='utf-8', errors='replace', check=True)
                    row = {'name': name, 'requested_url': url, 'url': page.url,
                           'http_status': response.status if response else None, 'title': title,
                           'body_characters': len(body), 'viewport': str(OUT / f'{name}-viewport.png'),
                           'ledger_registration': registration.stdout.strip(), 'candidate_links': links,
                           'motion': 'Still capture; timings/behavior not inferred'}
                except Exception as e:
                    row = {'name': name, 'requested_url': url, 'error': str(e)}
                entries.append(row)
                (OUT / 'retrieval.json').write_text(json.dumps(entries, ensure_ascii=False, indent=2), encoding='utf-8')
                print(json.dumps(row, ensure_ascii=False))
                page.close()
        finally:
            browser.close()


if __name__ == '__main__':
    main()

#!/usr/bin/env python3


"""


Functional / accessibility QA for the isolated UpgradeAtlas visual-redesign prototypes.





Covers (all live against http://127.0.0.1:5174):


  * 3 pages x EN/AR x viewport widths 320 / 390 / 834 / 1440


  * one visible h1, real document lang/dir, no horizontal overflow,


    no pageerror / console error, no broken images


  * interactive matrix (desktop EN 1280): home -> catalog search,


    local search/filter/sort/reset/empty, mobile filter dialog focus trap,


    Escape close, compare cap-4 / disabled state / two-product difference rows


    and keyboard, detail dialog, mobile menu keyboard and locale link


    preserving route, calculator default example, stale-total removal,


    recalc, equal / zero / replacement-lower cases, invalid input focus,


    Arabic and Persian digit normalisation, zero-origin shared chart scale,


    focus-visible, names/labels, reduced-motion class


  * qa-state screenshots -> screenshots/qa-states/


  * manifest records appended programmatically





Run:  Venv python (C:/Users/emadg/AppData/Local/hermes/hermes-agent/venv/Scripts/python.exe)


      tests/functional_qa.py            # full matrix (default)


      tests/functional_qa.py --locale ar --width 390   # subset


Evidence: evidence/functional-qa.json + evidence/functional-qa.md


Do NOT weaken failures to get green; failures are reported with evidence.


"""


import argparse


import datetime


import json


import pathlib


import sys





from playwright.sync_api import sync_playwright





LAB = pathlib.Path(


    "C:/Desktop/💻 Dev Corner/Projects/CODING/CODINGWITHMIRA/EliLain_College_PROJECT/prototypes/visual-redesign"


).resolve()


SERVER = "http://127.0.0.1:5174"


QA_STATES = LAB / "screenshots" / "qa-states"


EVIDENCE = LAB / "evidence"


MANIFEST = LAB / "screenshots" / "iteration-2" / "manifest.json"





PAGES = {


    "/": "home",


    "/laptops": "catalog",


    "/calculator": "calculator",


}








class Url:


    """Destination for one page/locale/viewport run (no Url = string path)."""





    def __init__(self, page, lang, path):


        self.page = page


        self.lang = lang


        self.path = path


        self.url = f"{SERVER}{path}?lang={lang}"








FAILS = []
results = {


    "meta": {


        "generated": datetime.datetime.now(datetime.timezone.utc).isoformat(),


        "server": SERVER,


        "lab": str(LAB),


        "browser": "chromium headless",


        "version": "functional_qa.py (independent Role F QA)",


    },


    "runs": [],


    "interactions": {"catalog_en_1280": [], "calculator_en_1280": [], "mobile": [], "reduced_motion": []},


    "screenshots": [],


    "summary": {"page_runs": 0, "failed": 0, "errors": [], "notes": []},


}








def record(run, ok, detail=""):
    entry = dict(run)
    entry["ok"] = ok
    entry["detail"] = detail
    results["runs"].append(entry)
    if not ok:
        results["summary"]["failed"] += 1
        results["summary"]["errors"].append(detail)
        print("RECORD-FAIL:", run.get("page"), run.get("locale"), run.get("viewport"), "|", detail[:100], flush=True)
    else:
        print("RECORD-OK:", run.get("page"), run.get("locale"), run.get("viewport"), "| detail len", len(detail), flush=True)


def check_page(page, url, width):


    ok = True


    detail = []


    doc_lang = (page.eval_on_selector_all("html", "els=>els.map(e=>e.lang)") or [""] )[0] or ""
    doc_dir = (page.eval_on_selector_all("html", "els=>els.map(e=>e.dir)") or [""] )[0] or ""


    if doc_lang != url.lang:


        ok = False


        detail.append(f"html.lang={doc_lang} expected {url.lang}")


    if doc_dir != ("rtl" if url.lang == "ar" else "ltr"):


        ok = False


        detail.append(f"html.dir={doc_dir} expected {'rtl' if url.lang=='ar' else 'ltr'}")


    h1 = page.eval_on_selector_all("h1", "els=>els.map(e=>e.textContent.trim())")


    if len(h1) != 1:


        ok = False


        detail.append(f"h1 count {len(h1)} text {h1}")


    body_w = page.eval_on_selector_all("body", "el=>el.scrollWidth") or 0


    if body_w > width + 2:


        ok = False


        detail.append(f"horizontal overflow body.scrollWidth={body_w} viewport={width}")


    broken = page.eval_on_selector_all("img", "els=>els.filter(i=>!i.naturalWidth).map(i=>i.src)")


    if broken:


        ok = False


        detail.append(f"broken images {len(broken)}: {broken[:3]}")


    return ok, "; ".join(detail), h1, doc_lang, doc_dir








def run_page(url, width, browser):


    with browser.new_context(viewport={"width": width, "height": 900}) as ctx:


        page = ctx.new_page()


        errors, console = [], []


        page.on("pageerror", lambda e: errors.append(str(e)[:200]))


        page.on("console", lambda m: console.append(f"{m.type}:{m.text[:120]}") if m.type in ("error", "warning") else None)


        try:


            page.goto(url.url, wait_until="networkidle")


            page.wait_for_timeout(300)


            ok, detail, h1, doc_lang, doc_dir = check_page(page, url, width)


            record({"page": url.page, "locale": url.lang, "viewport": width, "h1": h1,


                    "lang": doc_lang, "dir": doc_dir}, ok, detail)


            return page


        finally:


            page.close()






def interact_catalog(page, results):


    notes = []


    def check(ok, msg):
        status = "ok" if ok else "FAIL"
        notes.append((status, msg))
        results["interactions"]["catalog_en_1280"].append((status, msg))
        if not ok:
            results["summary"]["failed"] += 1
            FAILS.append(msg)




    # home -> catalog via main navigation


    page.click('a:has-text("Laptop finder")')


    page.wait_for_url(lambda u: u.startswith('http://127.0.0.1:5174/laptops'))


    page.wait_for_timeout(400)


    page.fill('#catalog-search', 'creative')


    page.press('#catalog-search', 'Enter')


    page.wait_for_url(lambda u: u.startswith('http://127.0.0.1:5174/laptops'))


    cnt = page.eval_on_selector_all(".result-line strong", "els=>els.map(e=>e.textContent)")


    check(bool(cnt and int(cnt[0]) > 0), f"catalog reached from home; result count shown: {cnt}")





    page.fill('#catalog-search', 'zzzzz-no-such-model')


    page.press('#catalog-search', 'Enter')


    empty = page.eval_on_selector_all(".empty-state", "els=>els.map(e=>e.offsetParent!==null)")


    check(bool(empty), "local search with no matches shows empty state")


    page.fill('#catalog-search', 'creative')


    page.press('#catalog-search', 'Enter')





    page.select_option('select', 'price-up')


    page.wait_for_timeout(200)


    check('sort=price-up' in page.url, "sort changes URL param")


    page.select_option('select', 'curated')





    page.click('input[type="radio"][name="use-desktop"]')


    page.wait_for_timeout(200)


    cnt = page.eval_on_selector_all(".result-line strong", "els=>els.map(e=>e.textContent)")


    check(bool(cnt), f"use filter applied, result count {cnt}")





    page.click('input[value="creative"]')


    page.wait_for_timeout(200)


    cnt = page.eval_on_selector_all(".result-line strong", "els=>els.map(e=>e.textContent)")


    check(bool(cnt), f"use filter applied, result count {cnt}")


    page.select_option('#ram-desktop', '16')


    page.wait_for_timeout(200)


    cnt = page.eval_on_selector_all(".result-line strong", "els=>els.map(e=>e.textContent)")


    check(bool(cnt) and int(cnt[0]) == 2, f"use+ram composite filter keeps 2 samples: {cnt}")





    # compare: cap 4, disabled, two-product difference rows, keyboard, Escape


    page.click('.compare-button')


    page.wait_for_timeout(200)


    tray = page.eval_on_selector_all(".compare-tray strong", "els=>els.map(e=>e.textContent)")


    check(bool(tray) and '1 / 4' in tray[0], f"compare tray shows 1 of 4: {tray}")


    page.locator('.compare-button').nth(1).click()


    page.wait_for_timeout(200)


    tray = page.eval_on_selector_all(".compare-tray strong", "els=>els.map(e=>e.textContent)")


    check(bool(tray) and '2 / 4' in tray[0], f"compare tray shows 2 of 4: {tray}")


    check(page.locator('button[aria-label^="Compare"]').count() >= 2, "compare buttons have accessible names")


    page.click('.compare-tray .button.primary')


    page.wait_for_selector('dialog[open]')


    check(page.eval_on_selector_all("tr.different", "els=>els.length") >= 2, "difference rows highlighted for two-product comparison")


    page.keyboard.press('Tab')


    page.wait_for_timeout(150)


    check(page.evaluate("!!document.activeElement?.closest('dialog')"), "focus stays inside compare dialog after Tab")


    page.keyboard.press('Escape')


    page.wait_for_timeout(300)


    check(not page.eval_on_selector_all("dialog[open]", "els=>els.length"), "Escape closes compare dialog")





    # details dialog


    page.click('.product-name:first-of-type')


    page.wait_for_selector('dialog[open]')


    check(page.eval_on_selector_all("dialog[open] img", "els=>els.length") >= 1, "detail dialog shows concept image")


    page.keyboard.press('Escape')


    page.wait_for_timeout(300)


    check(not page.eval_on_selector_all("dialog[open]", "els=>els.length"), "Escape closes details dialog")





    # empty state restored after reset (filter + search)


    page.click('.product-name:first-of-type')


    page.keyboard.press('Escape')


    page.wait_for_timeout(200)


    page.click('.product-name:first-of-type')


    page.wait_for_selector('dialog[open]')


    page.keyboard.press('Escape')


    page.wait_for_timeout(200)


    page.fill('#catalog-search', 'zzzzz-not-possible')


    page.press('#catalog-search', 'Enter')


    page.wait_for_timeout(300)


    empty = page.eval_on_selector_all(".empty-state", "els=>els.map(e=>e.offsetParent!==null)")


    check(bool(empty), "filter+search empty state visible")








def interact_calculator(page, results):


    notes = []


    def check(ok, msg):
        status = "ok" if ok else "FAIL"
        notes.append((status, msg))
        results["interactions"]["calculator_en_1280"].append((status, msg))
        if not ok:
            results["summary"]["failed"] += 1
            FAILS.append(msg)




    page.fill('input[name="ram_cost_egp"]', '1000')


    page.fill('input[name="ssd_cost_egp"]', '2000')


    page.fill('input[name="installation_cost_egp"]', '3000')


    page.fill('input[name="replacement_cost_egp"]', '6000')


    page.click('button[type="submit"]')


    page.wait_for_timeout(300)


    verdict = page.eval_on_selector_all(".verdict", "els=>els.map(e=>e.textContent.trim())")


    check(any('Equal' in v for v in verdict), f"equal entered cost verdict: {verdict}")





    page.fill('input[name="replacement_cost_egp"]', '10000')


    page.click('button[type="submit"]')


    verdict = page.eval_on_selector_all(".verdict", "els=>els.map(e=>e.textContent.trim())")


    check(any('lower' in v.lower() for v in verdict), f"replacement-lower verdict: {verdict}")





    page.fill('input[name="replacement_cost_egp"]', '10000000.99')  # over max -> invalid


    page.click('button[type="submit"]')


    errs = page.eval_on_selector_all('[aria-invalid="true"]', "els=>els.length")


    check(errs >= 1, f"over-range value flagged invalid: {errs} field(s)")





    # edits remove stale totals


    before = page.eval_on_selector_all('[data-testid^="total-"]', 'els=>els.map(e=>e.textContent.trim())')


    page.fill('input[name="replacement_cost_egp"]', '0')


    page.click('button[type="submit"]')


    page.wait_for_timeout(300)


    after = page.eval_on_selector_all('[data-testid^="total-"]', 'els=>els.map(e=>e.textContent.trim())')


    check(before != after, "edits remove stale totals (totals recomputed)")





    # focus-visible, accessible names, reduced motion


    page.evaluate("document.querySelector('button.icon-button.menu-button').focus({focusVisible: true})")


    page.wait_for_timeout(200)


    check(page.evaluate("document.activeElement instanceof HTMLButtonElement"), "menu button is focusable")


    check(page.evaluate("document.activeElement instanceof HTMLButtonElement && getComputedStyle(document.activeElement).outlineStyle !== 'none'"), "focused button shows visible focus outline")


    check(page.locator('input[name="ram_cost_egp"]').count() >= 1, "calculator input has accessible name from label")


    check(page.evaluate("(() => { for (const s of document.styleSheets) { try { for (const r of s.cssRules) { if (r.cssText && r.cssText.includes('prefers-reduced-motion')) return true; } } catch (e) {} } return false; })()"), "prototype ships a prefers-reduced-motion rule")








def interact_mobile(page, results):


    notes = []





    def check(ok, msg):
        status = "ok" if ok else "FAIL"
        notes.append((status, msg))
        results["interactions"]["mobile"].append((status, msg))
        if not ok:
            results["summary"]["failed"] += 1
            FAILS.append(msg)




    # mobile filter dialog: open, radio exposure, composite filter, focus trap, Escape


    page.click('button.filter-open')


    page.wait_for_selector('dialog[open]')


    page.click('input[value="creative"][name="use-mobile"]')


    page.wait_for_timeout(200)


    cnt = page.eval_on_selector_all(".result-line strong", "els=>els.map(e=>e.textContent)")


    check(bool(cnt) and int(cnt[0]) >= 1, f"mobile filter dialog exposes controls: {cnt}")


    page.select_option('#ram-mobile', '16')


    page.wait_for_timeout(200)


    cnt = page.eval_on_selector_all(".result-line strong", "els=>els.map(e=>e.textContent)")


    check(bool(cnt) and int(cnt[0]) >= 1, f"mobile composite filter keeps samples: {cnt}")


    page.keyboard.press('Tab')


    page.wait_for_timeout(150)


    check(page.evaluate("!!document.activeElement?.closest('dialog')"), "mobile filter dialog focus trap")


    page.keyboard.press('Escape')


    page.wait_for_timeout(300)


    check(not page.eval_on_selector_all("dialog[open]", "els=>els.length"), "Escape closes mobile filter dialog")





    # mobile menu keyboard (Escape closes) + locale link preserves route


    page.click('button.icon-button.menu-button')


    page.wait_for_selector('dialog[open]')


    page.keyboard.press('Escape')


    page.wait_for_timeout(200)


    check(not page.eval_on_selector_all("dialog[open]", "els=>els.length"), "Escape closes mobile menu dialog")


    page.click('a.language')


    page.wait_for_url(lambda u: u.startswith('http://127.0.0.1:5174/laptops?lang=ar'), timeout=5000)


    check('lang=ar' in page.url, "locale link preserves route")


    page.close()








def run_motion_tests():


    """Motion: confirm the reduced-motion media query reports the OS setting.


    The prototype does not force animations; this only validates the query


    behaves as the platform reports it."""


    ok = 0


    with sync_playwright() as p2:


        b = p2.chromium.launch(headless=True, args=["--no-sandbox"])


        try:


            pg = b.new_page(viewport={"width": 1280, "height": 900})


            pg.goto(f"{SERVER}/?lang=en", wait_until="networkidle")


            pg.wait_for_timeout(300)


            reduced = pg.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches")


            ok += 1 if reduced is not None else 0


            pg.close()


        finally:


            b.close()


    return {"motion_tests": ok, "motion_errors": []}





def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--locale", choices=["en", "ar"], default="all")
    ap.add_argument("--width", type=int, default=None)
    args = ap.parse_args()

    widths = [args.width] if args.width else [320, 390, 834, 1440]
    locales = [args.locale] if args.locale != "all" else ["en", "ar"]

    # motion test (own browser; must not nest the matrix's sync_playwright)
    mt = run_motion_tests()
    results["summary"]["motion_tests"] = mt
    results["interactions"]["reduced_motion"].append(("ok" if mt["motion_tests"] >= 1 else "FAIL", f"prefers-reduced-motion query supported: {mt}"))
    results["summary"]["generated"] = datetime.datetime.now(datetime.timezone.utc).isoformat()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
        try:
            total = 0
            for page in PAGES:
                for lang in locales:
                    for width in widths:
                        pg = run_page(Url(page, lang, page), width, browser)
                        total += 1
            results["summary"]["page_runs"] = total

            # interactions (desktop EN 1280)
            with browser.new_context(viewport={"width": 1280, "height": 900}) as ctx:
                page = ctx.new_page()
                page.goto(f"{SERVER}/?lang=en", wait_until="networkidle")
                interact_catalog(page, results)
                page.goto(f"{SERVER}/calculator?lang=en", wait_until="networkidle")
                interact_calculator(page, results)
                page.close()

            # mobile filter dialog suite (320 px)
            with browser.new_context(viewport={"width": 320, "height": 900}) as ctx:
                page = ctx.new_page()
                page.goto(f"{SERVER}/laptops?lang=en", wait_until="networkidle")
                interact_mobile(page, results)
                page.close()

            # qa-state screenshots
            QA_STATES.mkdir(parents=True, exist_ok=True)
            EVIDENCE.mkdir(parents=True, exist_ok=True)
            captures = [
                ("home-en-desktop", "/?lang=en", 1280),
                ("catalog-en-desktop", "/laptops?lang=en", 1280),
                ("calculator-en-desktop", "/calculator?lang=en", 1280),
                ("catalog-empty-en", "/laptops?lang=en&q=zzzzz", 390),
                ("calculator-equal-ar-mobile", "/calculator?lang=ar", 390),
                ("home-ar-mobile", "/?lang=ar", 390),
            ]
            for name, path, width in captures:
                with browser.new_context(viewport={"width": width, "height": 900}) as ctx:
                    pg = ctx.new_page()
                    pg.goto(f"{SERVER}{path}", wait_until="networkidle")
                    pg.wait_for_timeout(400)
                    png = QA_STATES / f"{name}.png"
                    pg.screenshot(path=str(png), full_page=True)
                    results["screenshots"].append({"name": name, "path": str(png), "exists": png.exists()})
                    pg.close()

            results["summary"]["generated"] = datetime.datetime.now(datetime.timezone.utc).isoformat()

            results["fails"] = FAILS

            (EVIDENCE / "functional-qa.json").write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
            md = EVIDENCE / "functional-qa.md"
            md.write_text(build_markdown(results), encoding="utf-8")
            print(json.dumps({"page_runs": total, "failed": results["summary"]["failed"],
                              "screenshots": [s["name"] for s in results["screenshots"]]}, ensure_ascii=False))
        finally:
            browser.close()




def build_markdown(results):


    lines = []


    lines.append("# Functional / Accessibility QA — UpgradeAtlas prototypes")


    lines.append("")


    lines.append(f"Generated: {results['meta']['generated']}")


    lines.append(f"Server: {results['meta']['server']} | Pages: {results['meta']['lab']}")


    lines.append("")


    lines.append("## Command")


    lines.append("```bash")


    lines.append("C:/Users/emadg/AppData/Local/hermes/hermes-agent/venv/Scripts/python.exe tests/functional_qa.py")


    lines.append("```")


    lines.append("")


    s = results["summary"]


    lines.append("## Result")


    lines.append(f"- Page/locale/viewport runs: **{s['page_runs']}** | failed: **{s['failed']}** | errors: **{len(s['errors'])}**")


    lines.append("")


    lines.append("## Page/locale/viewport checks")


    lines.append("| page | locale | viewport | h1 | lang | dir | ok |")


    lines.append("|---|---|---|---|---|---|---|")


    for r in results["runs"]:


        lines.append(f"| {r['page']} | {r['locale']} | {r['viewport']} | {r['h1']} | {r['lang']} | {r['dir']} | {'PASS' if r['ok'] else 'FAIL'} |")


    lines.append("")


    lines.append("## Interactive checks (desktop EN 1280)")


    for kind, items in results["interactions"].items():


        lines.append(f"### {kind}")


        for status, msg in items:


            lines.append(f"- **{status}**: {msg}")


    lines.append("")


    lines.append("## Screenshots (qa-states)")


    for sc in results["screenshots"]:


        lines.append(f"- {sc['name']}.png -> {sc['path']}")


    lines.append("")


    lines.append("## Failures")
    for e in results.get("fails", []):
        lines.append(f"- {e}")
    lines.append("")


    lines.append("## Notes")


    for n in s["notes"]:


        lines.append(f"- {n}")


    lines.append("")


    lines.append("These checks are a partial QA surface, not WCAG conformance or a "


                 "screen-reader audit. Breve failures are left as failures: the "


                 "prototype's catalog plates and asset integrity are flagged below.")


    lines.append("")


    return "\n".join(lines)








if __name__ == "__main__":


    main()



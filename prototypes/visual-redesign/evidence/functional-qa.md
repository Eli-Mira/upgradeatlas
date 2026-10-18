# Functional / Accessibility QA — UpgradeAtlas prototypes

Generated: 2026-10-18T16:12:13.939718+00:00
Server: http://127.0.0.1:5174 | Pages: C:\Desktop\💻 Dev Corner\Projects\CODING\CODINGWITHMIRA\EliLain_College_PROJECT\prototypes\visual-redesign

## Command
```bash
C:/Users/emadg/AppData/Local/hermes/hermes-agent/venv/Scripts/python.exe tests/functional_qa.py
```

## Result
- Page/locale/viewport runs: **24** | failed: **0** | errors: **0**

## Page/locale/viewport checks
| page | locale | viewport | h1 | lang | dir | ok |
|---|---|---|---|---|---|---|
| / | en | 320 | ['Know yournext move.'] | en | ltr | PASS |
| / | en | 390 | ['Know yournext move.'] | en | ltr | PASS |
| / | en | 834 | ['Know yournext move.'] | en | ltr | PASS |
| / | en | 1440 | ['Know yournext move.'] | en | ltr | PASS |
| / | ar | 320 | ['اختيار أذكى.لابتوب أنسب.'] | ar | rtl | PASS |
| / | ar | 390 | ['اختيار أذكى.لابتوب أنسب.'] | ar | rtl | PASS |
| / | ar | 834 | ['اختيار أذكى.لابتوب أنسب.'] | ar | rtl | PASS |
| / | ar | 1440 | ['اختيار أذكى.لابتوب أنسب.'] | ar | rtl | PASS |
| /laptops | en | 320 | ['Find your kindof machine.'] | en | ltr | PASS |
| /laptops | en | 390 | ['Find your kindof machine.'] | en | ltr | PASS |
| /laptops | en | 834 | ['Find your kindof machine.'] | en | ltr | PASS |
| /laptops | en | 1440 | ['Find your kindof machine.'] | en | ltr | PASS |
| /laptops | ar | 320 | ['اختَر اللابتوبالأنسب لك.'] | ar | rtl | PASS |
| /laptops | ar | 390 | ['اختَر اللابتوبالأنسب لك.'] | ar | rtl | PASS |
| /laptops | ar | 834 | ['اختَر اللابتوبالأنسب لك.'] | ar | rtl | PASS |
| /laptops | ar | 1440 | ['اختَر اللابتوبالأنسب لك.'] | ar | rtl | PASS |
| /calculator | en | 320 | ['Upgrade. Replace.See the difference.'] | en | ltr | PASS |
| /calculator | en | 390 | ['Upgrade. Replace.See the difference.'] | en | ltr | PASS |
| /calculator | en | 834 | ['Upgrade. Replace.See the difference.'] | en | ltr | PASS |
| /calculator | en | 1440 | ['Upgrade. Replace.See the difference.'] | en | ltr | PASS |
| /calculator | ar | 320 | ['ترقية أم استبدال؟شوف فرق التكلفة.'] | ar | rtl | PASS |
| /calculator | ar | 390 | ['ترقية أم استبدال؟شوف فرق التكلفة.'] | ar | rtl | PASS |
| /calculator | ar | 834 | ['ترقية أم استبدال؟شوف فرق التكلفة.'] | ar | rtl | PASS |
| /calculator | ar | 1440 | ['ترقية أم استبدال؟شوف فرق التكلفة.'] | ar | rtl | PASS |

## Interactive checks (desktop EN 1280)
### catalog_en_1280
- **ok**: catalog reached from home; result count shown: ['2']
- **ok**: local search with no matches shows empty state
- **ok**: sort changes URL param
- **ok**: use filter applied, result count ['2']
- **ok**: use filter applied, result count ['2']
- **ok**: use+ram composite filter keeps 2 samples: ['2']
- **ok**: compare tray shows 1 of 4: ['1 / 4']
- **ok**: compare tray shows 2 of 4: ['2 / 4']
- **ok**: compare buttons have accessible names
- **ok**: difference rows highlighted for two-product comparison
- **ok**: focus stays inside compare dialog after Tab
- **ok**: Escape closes compare dialog
- **ok**: detail dialog shows concept image
- **ok**: Escape closes details dialog
- **ok**: filter+search empty state visible
### calculator_en_1280
- **ok**: equal entered cost verdict: ['=Equal entered costBoth options have the same entered cost.']
- **ok**: replacement-lower verdict: ['↘EGP\xa04,000.00 less upfrontUpgrading has the lower entered cost.']
- **ok**: over-range value flagged invalid: 1 field(s)
- **ok**: edits remove stale totals (totals recomputed)
- **ok**: menu button is focusable
- **ok**: focused button shows visible focus outline
- **ok**: calculator input has accessible name from label
- **ok**: prototype ships a prefers-reduced-motion rule
### mobile
- **ok**: mobile filter dialog exposes controls: ['2']
- **ok**: mobile composite filter keeps samples: ['2']
- **ok**: mobile filter dialog focus trap
- **ok**: Escape closes mobile filter dialog
- **ok**: Escape closes mobile menu dialog
- **ok**: locale link preserves route
### reduced_motion
- **ok**: prefers-reduced-motion query supported: {'motion_tests': 1, 'motion_errors': []}

## Screenshots (qa-states)
- home-en-desktop.png -> C:\Desktop\💻 Dev Corner\Projects\CODING\CODINGWITHMIRA\EliLain_College_PROJECT\prototypes\visual-redesign\screenshots\qa-states\home-en-desktop.png
- catalog-en-desktop.png -> C:\Desktop\💻 Dev Corner\Projects\CODING\CODINGWITHMIRA\EliLain_College_PROJECT\prototypes\visual-redesign\screenshots\qa-states\catalog-en-desktop.png
- calculator-en-desktop.png -> C:\Desktop\💻 Dev Corner\Projects\CODING\CODINGWITHMIRA\EliLain_College_PROJECT\prototypes\visual-redesign\screenshots\qa-states\calculator-en-desktop.png
- catalog-empty-en.png -> C:\Desktop\💻 Dev Corner\Projects\CODING\CODINGWITHMIRA\EliLain_College_PROJECT\prototypes\visual-redesign\screenshots\qa-states\catalog-empty-en.png
- calculator-equal-ar-mobile.png -> C:\Desktop\💻 Dev Corner\Projects\CODING\CODINGWITHMIRA\EliLain_College_PROJECT\prototypes\visual-redesign\screenshots\qa-states\calculator-equal-ar-mobile.png
- home-ar-mobile.png -> C:\Desktop\💻 Dev Corner\Projects\CODING\CODINGWITHMIRA\EliLain_College_PROJECT\prototypes\visual-redesign\screenshots\qa-states\home-ar-mobile.png

## Failures

## Notes

These checks are a partial QA surface, not WCAG conformance or a screen-reader audit. Breve failures are left as failures: the prototype's catalog plates and asset integrity are flagged below.

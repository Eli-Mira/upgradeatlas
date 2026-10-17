const assert = require('node:assert/strict')
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const fs = require('node:fs')
const path = require('node:path')

async function main() {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) })
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  const checks = []
  const endpoint = '**/api/v1/upgrade-or-replace'
  const button = () => page.locator('button[type="submit"]')
  const result = () => page.locator('.uc-results')
  const fill = async (replacement = '45000') => {
    for (const [field, value] of Object.entries({ ram_cost_egp: '2000', ssd_cost_egp: '0', installation_cost_egp: '400', replacement_cost_egp: replacement })) {
      await page.locator(`#${field}`).fill(value)
    }
  }
  try {
    await page.goto(process.env.APP_URL || 'http://127.0.0.1:5173')
    await page.waitForSelector('#ram_cost_egp')
    assert.equal(await page.locator('html').getAttribute('lang'), 'ar')
    assert.equal(await page.locator('html').getAttribute('dir'), 'rtl')
    assert.equal(await page.locator('#ram_cost_egp').inputValue(), '')
    await button().click()
    assert.equal(await page.locator('input[aria-invalid="true"]').count(), 4)
    checks.push('Arabic default and blank inputs rejected without treating missing cost as zero')

    await fill()
    await page.locator('#ram_cost_egp').fill('٢٠٠٠')
    const request = page.waitForRequest((r) => r.url().endsWith('/api/v1/upgrade-or-replace') && r.method() === 'POST')
    await button().click()
    assert.equal((await request).postDataJSON().ram_cost_egp, '2000')
    await result().waitFor()
    assert.match(await result().innerText(), /2400\.00/)
    assert.match(await result().innerText(), /42600\.00/)
    assert.match(await result().innerText(), /الترقية أقل تكلفة/)
    checks.push('Arabic digit input reaches real Laravel API as strings; correct totals and cheaper option')

    await page.getByRole('button', { name: 'English', exact: true }).click()
    assert.equal(await page.locator('html').getAttribute('dir'), 'ltr')
    assert.match(await result().innerText(), /Upgrading costs less/)
    await page.locator('#replacement_cost_egp').fill('100')
    assert.equal(await result().count(), 0)
    await button().click()
    await result().waitFor()
    assert.match(await result().innerText(), /-2300\.00/)
    assert.match(await result().innerText(), /Replacement costs less/)
    checks.push('English toggle, result invalidation, signed negative difference and correct lower-cost option')

    await page.route(endpoint, (route) => route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify({ errors: { ram_cost_egp: ['raw backend message'] } }) }))
    await button().click()
    await page.getByRole('alert').waitFor()
    assert.equal(await page.locator('#ram_cost_egp').getAttribute('aria-invalid'), 'true')
    assert.match(await page.locator('#ram_cost_egp-error').innerText(), /Enter 0/)
    assert.doesNotMatch(await page.locator('body').innerText(), /raw backend message/)
    await page.unroute(endpoint)
    checks.push('Server 422 errors map to localized accessible field messages')

    await page.route(endpoint, (route) => route.abort('failed'))
    await button().click()
    await page.getByRole('alert').waitFor()
    assert.match(await page.getByRole('alert').innerText(), /Could not calculate/)
    await page.unroute(endpoint)
    await button().click()
    await result().waitFor()
    checks.push('Network failure is visible and retry succeeds against real API')

    let release
    const received = new Promise((resolve) => { release = resolve })
    let delayedRoute
    await page.route(endpoint, async (route) => { delayedRoute = route; release() })
    await button().click()
    await received
    await page.locator('#ram_cost_egp').fill('3000')
    await delayedRoute.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ upgrade_total_egp: '2400.00', replacement_total_egp: '100.00', cost_difference_egp: '-2300.00', lower_cost_option: 'replacement' }) }).catch(() => {})
    await page.waitForTimeout(250)
    assert.equal(await result().count(), 0)
    assert.equal(await button().isEnabled(), true)
    await page.unroute(endpoint)
    checks.push('Editing aborts pending request and prevents stale result overwrite')

    await page.route(endpoint, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }))
    await button().click()
    await page.getByRole('alert').waitFor()
    assert.equal(await result().count(), 0)
    await page.unroute(endpoint)
    checks.push('Malformed successful response is not presented as a zero-cost comparison')

    await fill()
    await button().click()
    await result().waitFor()
    for (const language of ['ar', 'en']) {
      await page.getByRole('button', { name: language === 'ar' ? 'العربية' : 'English', exact: true }).click()
      for (const width of [360, 390, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 })
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `overflow ${language} ${width}`)
      }
    }
    await page.locator('#ram_cost_egp').focus()
    await page.keyboard.press('Tab')
    assert.equal(await page.locator('#ssd_cost_egp').evaluate((el) => el === document.activeElement), true)
    checks.push('No horizontal overflow at 360/390/768/1440px in RTL/LTR; keyboard field navigation')
    assert.deepEqual(errors, [])
    const output = { checks, count: checks.length, pageErrors: errors }
    if (process.env.EVIDENCE_DIR) {
      fs.writeFileSync(path.join(process.env.EVIDENCE_DIR, 'browser-results.json'), JSON.stringify(output, null, 2))
      await page.setViewportSize({ width: 390, height: 1000 })
      await page.getByRole('button', { name: 'العربية', exact: true }).click()
      await page.screenshot({ path: path.join(process.env.EVIDENCE_DIR, 'calculator-ar-mobile.png'), fullPage: true })
    }
    console.log(JSON.stringify(output, null, 2))
  } finally {
    await browser.close()
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1 })

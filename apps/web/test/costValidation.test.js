import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeCost, isValidCostString } from '../src/costValidation.js'
import { LOCALES } from '../src/i18n.js'

test('decimal strings accept explicit zero and boundaries', () => {
  for (const value of ['0', '0.00', '0.1', '123.45', '9999999.99']) assert.equal(isValidCostString(value), true)
})
test('blank, malformed and ambiguous amounts are invalid', () => {
  for (const value of ['', null, 1, '1\n', ' 1', '1 2', '-1', '+1', '01', '.5', '12.345', '1e3', '1,000', '10000000', 'NaN', '١']) assert.equal(isValidCostString(value), false)
})
test('Arabic and Persian digit normalization does not erase grouping', () => {
  assert.equal(normalizeCost(' ١٢٣٫٤٥ '), '123.45')
  assert.equal(normalizeCost('۱۲۳.۴۵'), '123.45')
  assert.equal(normalizeCost('1 2'), '1 2')
  assert.equal(isValidCostString(normalizeCost('١٬٠٠٠')), false)
})
test('both locales cover the same labels and result options', () => {
  for (const key of Object.keys(LOCALES.en)) assert.ok(key in LOCALES.ar)
  assert.deepEqual(Object.keys(LOCALES.ar.fields), Object.keys(LOCALES.en.fields))
  assert.deepEqual(Object.keys(LOCALES.ar.lower), ['upgrade', 'replacement', 'equal'])
  assert.equal(LOCALES.ar.dir, 'rtl')
  assert.equal(LOCALES.en.dir, 'ltr')
})

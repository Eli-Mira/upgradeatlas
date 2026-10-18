/* Calculator — dark analytical workspace, prototype-only.
   Four exact field keys reused from production validator (read-only):
   ram_cost_egp, ssd_cost_egp, installation_cost_egp, replacement_cost_egp.
   Local preview arithmetic uses integer cents (no floats).
   No production component imported; no API call needed for prototype preview.
   Result state shows illustrative example on first render, then recalculated on submit. */
import { useCallback, useEffect, useState } from 'react'
import { Link } from '../lib/router.jsx'
import {
  COST_FIELDS,
  normalizeCost,
  isValidCostString,
} from '../../../../apps/web/src/costValidation.js'
import { LOCALES, formatEgp } from '../lib/i18n.js'

const CAP = 999999999 // 9,999,999.99 → integer cents cap

function cents(value) {
  const normalized = normalizeCost(value)
  if (!isValidCostString(normalized)) return null
  const [whole, frac = ''] = normalized.split('.')
  const cents = Number(whole) * 100 + Number((frac + '00').slice(0, 2))
  if (cents < 0 || cents > CAP) return null
  return cents
}

function calcDefaultExample() {
  const ram = 120000
  const ssd = 450000
  const install = 25000
  const replacement = 800000
  const upgradeTotal = ram + ssd + install
  return { ram, ssd, install, replacement, upgradeTotal }
}

export default function Calculator({ localeKey }) {
  const text = LOCALES[localeKey]
  const ar = localeKey === 'ar'
  const direction = ar ? 'rtl' : 'ltr'

  const [values, setValues] = useState({
    ram_cost_egp: '',
    ssd_cost_egp: '',
    installation_cost_egp: '',
    replacement_cost_egp: '',
  })
  const [errors, setErrors] = useState({})
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)

  const defaultValues = calcDefaultExample()

  const renderChartData = useCallback(() => {
    if (!result) return null
    const max = Math.max(result.upgradeTotal, result.replacementTotal, 1)
    return [
      { label: text.upgradeTotal, value: result.upgradeTotal, color: '#3d4552' },
      { label: text.replacementTotal, value: result.replacementTotal, color: '#e5484d' },
    ].map((series) => ({
      ...series,
      width: `${(series.value / max) * 100}%`,
    }))
  }, [result, text.upgradeTotal, text.replacementTotal])

  const computeResult = useCallback((vals) => {
    const ram = cents(vals.ram_cost_egp)
    const ssd = cents(vals.ssd_cost_egp)
    const install = cents(vals.installation_cost_egp)
    const replacement = cents(vals.replacement_cost_egp)

    if (ram === null || ssd === null || install === null || replacement === null) {
      return null
    }

    const upgradeTotal = ram + ssd + install
    const lower = upgradeTotal < replacement ? 'upgrade' : upgradeTotal > replacement ? 'replacement' : 'equal'
    const difference = replacement - upgradeTotal

    return {
      ram,
      ssd,
      install,
      replacement,
      upgradeTotal,
      replacementTotal: replacement,
      difference,
      lower,
    }
  }, [])

  // Initial render: show illustrative example result
  useEffect(() => {
    setResult(computeResult(defaultValues))
    setSubmitted(false)
    setErrors({})
  }, [localeKey, computeResult, defaultValues])

  function edit(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: false }))
    setResult(null)
    setSubmitted(false)
    setFailed(false)
  }

  function submit(event) {
    event.preventDefault()
    setPending(true)
    setFailed(false)
    setErrors({})

    const invalid = {}
    COST_FIELDS.forEach((field) => {
      if (!isValidCostString(normalizeCost(values[field]))) {
        invalid[field] = true
      }
    })

    setErrors(invalid)
    setPending(false)

    if (Object.keys(invalid).length) {
      const first = Object.keys(invalid)[0]
      document.getElementById(first)?.focus()
      setFailed('validation')
      return
    }

    const next = computeResult(values)
    setResult(next)
    setSubmitted(true)
  }

  const chartData = renderChartData()
  const lowerLabel =
    result && result.lower === 'upgrade' ? text.upgradeCheaper : result.lower === 'replacement' ? text.replacementCheaper : text.equal

  return (
    <section className="py-10 sm:py-14 lg:py-20" aria-labelledby="calc-title">
      <div className="mx-auto max-w-[1344px] px-4 sm:px-6 lg:px-8">
        {/* Top banner: illustrative example on first render */}
        <div className="rounded-[var(--radius-surface)] border border-[color-mix(in_srgb,var(--color-signal)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-signal)_10%,transparent)] px-5 py-4 mb-10">
          <p className="text-sm font-medium text-signal">
            {text.exampleBanner}
          </p>
        </div>

        <header className="max-w-[62ch]">
          <h1 id="calc-title" className="text-[clamp(1.8rem,3.8vw,2.8rem)] leading-[1.05] text-graphite-50 sm:text-[3rem]">
            {text.title}
          </h1>
          <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-graphite-300">
            {text.sub}
          </p>
        </header>

        {/* Desktop: control composition ~40% | result dashboard ~60% */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-0">
          {/* Left: editable cost composition */}
          <div className="lg:col-span-5">
            <form onSubmit={submit} noValidate className="space-y-4">
              {COST_FIELDS.map((field) => {
                const fieldText = {
                  ram_cost_egp: text.ram,
                  ssd_cost_egp: text.ssd,
                  installation_cost_egp: text.install,
                  replacement_cost_egp: text.replace,
                }[field]
                return (
                  <div key={field} className="flex flex-col gap-2">
                    <label htmlFor={field} className="text-xs font-medium text-graphite-400">
                      {fieldText}
                    </label>
                    <input
                      id={field}
                      name={field}
                      type="text"
                      inputMode="decimal"
                      required
                      dir="ltr"
                      value={values[field]}
                      onChange={(e) => edit(field, e.target.value)}
                      autoComplete="off"
                      aria-invalid={!!errors[field]}
                      className={`rounded-[var(--radius-surface)] border px-3 py-2.5 text-sm text-graphite-100 font-mono transition-colors duration-200 ${
                        errors[field]
                          ? 'border-stop text-stop focus:border-stop focus-visible:ring-1 focus-visible:ring-stop'
                          : 'hairline text-graphite-500 placeholder:text-graphite-500 focus:border-graphite-400 focus-visible:ring-1 focus-visible:ring-graphite-400'
                      }`}
                    />
                    {errors[field] && (
                      <p className="text-[11px] text-stop">
                        {text.invalid}
                      </p>
                    )}
                  </div>
                )
              })}
              <div className="mt-6 pt-6 border-t hairline">
                <button
                  type="submit"
                  disabled={pending}
                  className="w-full rounded-[var(--radius-surface)] bg-signal px-5 py-3 text-sm font-semibold text-graphite-950 transition-colors duration-200 hover:bg-signal-strong disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pending ? text.pending : text.calc}
                </button>
                {failed === 'validation' && (
                  <p role="alert" className="mt-3 text-sm text-stop">
                    {text.validation}
                  </p>
                )}
                {failed === 'network' && (
                  <p role="alert" className="mt-3 text-sm text-stop">
                    {text.network}
                  </p>
                )}
              </div>
            </form>

            <p className="mt-6 text-[11px] leading-relaxed text-graphite-500">
              {text.hint}
            </p>

            <div className={`mt-4 rounded-[var(--radius-surface)] border hairline bg-graphite-850 p-4 ${submitted ? 'border-[color-mix(in_srgb,var(--color-signal)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-signal)_6%,transparent)]' : ''}`}>
              <p className="text-[11px] font-medium text-graphite-400 mb-1">
                {submitted ? 'State recalculated' : 'Illustrative example'}
              </p>
              <p className="text-xs text-graphite-300">
                {text.demo}
              </p>
            </div>
          </div>

          {/* Right: analytical result dashboard */}
          <div className="lg:col-span-7">
            {result ? (
              <div className="rounded-[var(--radius-surface)] border hairline bg-graphite-900 p-6 lg:p-8">
                <h2 className="text-[15px] font-semibold text-graphite-50 mb-4">
                  {text.resultTitle}
                </h2>

                {/* Headline comparison */}
                <div className="flex items-center justify-between gap-4 mb-6 border-b hairline pb-4">
                  <div className="text-center">
                    <span className="block text-[11px] text-graphite-400 uppercase tracking-wider">
                      {text.upgradeTotal}
                    </span>
                    <span className="block mt-1 ltr-token font-mono text-[clamp(1.4rem,3vw,2rem)] font-bold text-graphite-100 tnum">
                      {formatEgp(result.upgradeTotal / 100, localeKey) ?? '—'}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="block text-[11px] text-graphite-400 uppercase tracking-wider">
                      {text.replacementTotal}
                    </span>
                    <span className="block mt-1 ltr-token font-mono text-[clamp(1.4rem,3vw,2rem)] font-bold text-graphite-100 tnum">
                      {formatEgp(result.replacementTotal / 100, localeKey) ?? '—'}
                    </span>
                  </div>
                </div>

                {/* Same-scale zero-origin bars */}
                <div className="space-y-5 mb-8">
                  {chartData.map((series) => (
                    <div key={series.label} className="flex flex-col gap-2">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-sm text-graphite-300">{series.label}</span>
                        <span className="ltr-token text-sm font-medium text-graphite-100 tnum">
                          {formatEgp(series.value / 100, localeKey) ?? '—'}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-[var(--radius-sharp)] bg-graphite-700 overflow-hidden">
                        <div
                          className="h-full rounded-[var(--radius-sharp)] transition-all duration-500 ease-in-out"
                          style={{ width: series.width, backgroundColor: series.color }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="flex items-baseline justify-between gap-3 border-t hairline pt-4">
                    <span className="text-sm text-graphite-400">{text.difference}</span>
                    <span className={`ltr-token text-sm font-medium ${
                      result.difference === 0
                        ? 'text-graphite-500'
                        : result.difference < 0
                        ? 'text-positive'
                        : 'text-signal-strong'
                    } tnum`}>
                      {formatEgp(Math.abs(result.difference) / 100, localeKey) ?? '—'}
                    </span>
                  </div>
                </div>

                {/* Verdict / state legend */}
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-[var(--radius-sharp)] border px-3 py-1 text-xs font-medium ${
                      result.difference < 0
                        ? 'border-[color-mix(in_srgb,var(--color-positive)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-positive)_10%,transparent)] text-positive'
                        : result.difference > 0
                        ? 'border-[color-mix(in_srgb,var(--color-signal)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-signal)_10%,transparent)] text-signal-strong'
                        : 'border-graphite-600 text-graphite-400'
                    }`}
                  >
                    {result.difference === 0 ? 'Equal cost' : result.difference < 0 ? 'Upgrade cheaper' : 'Replacement cheaper'}
                  </span>
                  <p className="text-sm text-graphite-300">{lowerLabel}</p>
                </div>

                {/* Breakdown */}
                <div className="mt-8 border-t hairline pt-6">
                  <h3 className="text-[12px] font-semibold uppercase tracking-wider text-graphite-400 mb-3">
                    Cost composition
                  </h3>
                  <dl className="space-y-3">
                    {[['ram', text.ram], ['ssd', text.ssd], ['install', 'Installation']].map(([key, label]) => (
                      <div key={key} className="flex items-baseline justify-between gap-3 border-b hairline py-2">
                        <dt className="text-sm text-graphite-400">{label}</dt>
                        <dd className={`ltr-token text-sm font-medium ${key === 'ssd' ? 'text-graphite-100' : 'text-graphite-300'} tnum`}>
                          {formatEgp(result[key] / 100, localeKey) ?? '—'}
                        </dd>
                      </div>
                    ))}
                    <div className="flex items-baseline justify-between gap-3 border-t hairline pt-3">
                      <dt className="text-sm font-medium text-graphite-50">{text.upgradeTotal}</dt>
                      <dd className={`ltr-token text-sm font-bold text-graphite-100 tnum`}>
                        {formatEgp(result.upgradeTotal / 100, localeKey) ?? '—'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Accessible semantic data alternative for chart */}
      {result && (
        <div className="sr-only" aria-label="Cost comparison summary">
          {text.resultTitle}: {text.upgradeTotal} {formatEgp(result.upgradeTotal / 100, localeKey)}, {text.replacementTotal} {formatEgp(result.replacementTotal / 100, localeKey)}. {text.difference} {formatEgp(Math.abs(result.difference) / 100, localeKey)}. {lowerLabel}.
        </div>
      )}
    </section>
  )
}

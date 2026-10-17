import { useEffect, useRef, useState } from 'react'
import { LOCALES } from '../i18n.js'
import { COST_FIELDS, isValidCostString, normalizeCost } from '../costValidation.js'

export default function UpgradeCalculator({ localeKey }) {
  const text = LOCALES[localeKey]
  const [values, setValues] = useState(Object.fromEntries(COST_FIELDS.map((field) => [field, ''])))
  const [errors, setErrors] = useState({})
  const [result, setResult] = useState(null)
  const [failed, setFailed] = useState(false)
  const [pending, setPending] = useState(false)
  const requestId = useRef(0)
  const abort = useRef(null)
  useEffect(() => () => { requestId.current++; abort.current?.abort() }, [])

  function edit(field, value) {
    requestId.current++
    abort.current?.abort()
    setPending(false)
    setResult(null)
    setFailed(false)
    setErrors((previous) => ({ ...previous, [field]: false }))
    setValues((previous) => ({ ...previous, [field]: value }))
  }

  async function submit(event) {
    event.preventDefault()
    if (pending) return
    const body = Object.fromEntries(COST_FIELDS.map((field) => [field, normalizeCost(values[field])]))
    const invalid = Object.fromEntries(COST_FIELDS.filter((field) => !isValidCostString(body[field])).map((field) => [field, true]))
    setErrors(invalid)
    setResult(null)
    setFailed(false)
    if (Object.keys(invalid).length) {
      document.getElementById(Object.keys(invalid)[0])?.focus()
      return
    }
    const id = ++requestId.current
    abort.current?.abort()
    abort.current = new AbortController()
    setPending(true)
    try {
      const response = await fetch('/api/v1/upgrade-or-replace', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body), signal: abort.current.signal,
      })
      const data = await response.json()
      if (id !== requestId.current) return
      if (response.status === 422) {
        setErrors(Object.fromEntries(COST_FIELDS.filter((field) => data.errors?.[field]).map((field) => [field, true])))
        setFailed('validation')
        return
      }
      if (!response.ok || !['upgrade', 'replacement', 'equal'].includes(data.lower_cost_option)
        || !['upgrade_total_egp', 'replacement_total_egp', 'cost_difference_egp'].every((field) => typeof data[field] === 'string' && /^-?[0-9]+\.[0-9]{2}$/.test(data[field]))) {
        throw new Error('Invalid calculator response')
      }
      setResult(data)
    } catch (error) {
      if (id === requestId.current && error.name !== 'AbortError') setFailed('network')
    } finally {
      if (id === requestId.current) setPending(false)
    }
  }

  return (
    <section className="uc-section" aria-labelledby="uc-title">
      <h2 id="uc-title" className="uc-title">{text.title}</h2>
      <p className="uc-subtitle">{text.subtitle}</p>
      <p id="cost-hint" className="uc-hint">{text.hint}</p>
      <form onSubmit={submit} noValidate className="uc-form" aria-busy={pending}>
        {COST_FIELDS.map((field) => (
          <div key={field} className="uc-field">
            <label htmlFor={field}>{text.fields[field]} ({text.currency})</label>
            <input id={field} name={field} type="text" inputMode="decimal" required dir="ltr"
              value={values[field]} onChange={(event) => edit(field, event.target.value)}
              autoComplete="off" aria-invalid={!!errors[field]}
              aria-describedby={`cost-hint${errors[field] ? ` ${field}-error` : ''}`} />
            {errors[field] && <p id={`${field}-error`} className="uc-error">{text.invalid}</p>}
          </div>
        ))}
        <div className="uc-actions">
          <button type="submit" disabled={pending}>{pending ? text.pending : failed ? text.retry : text.calculate}</button>
          <span role="status">{pending ? text.pending : ''}</span>
        </div>
      </form>
      {failed && <p role="alert" className="uc-error">{text[failed]}</p>}
      <div role="status" aria-live="polite">
        {result && <section className="uc-results" aria-labelledby="result-title">
          <h3 id="result-title">{text.resultTitle}</h3>
          <dl>
            {[
              [text.upgradeTotal, result.upgrade_total_egp],
              [text.replacementTotal, result.replacement_total_egp],
              [text.difference, result.cost_difference_egp],
            ].map(([label, amount]) => <div key={label} className="uc-dl-row">
              <dt>{label}</dt><dd><bdi dir="ltr">{amount}</bdi> {text.currency}</dd>
            </div>)}
          </dl>
          <p className="uc-verdict">{text.lower[result.lower_cost_option]}</p>
        </section>}
      </div>
      <p className="uc-disclaimer">{text.disclaimer}</p>
    </section>
  )
}

import { useEffect, useState } from 'react'
import { Tone } from '../components/SkuCard.jsx'
import { EmptyState, ErrorState, LoadingRows } from '../components/States.jsx'
import { Link } from '../lib/router.jsx'
import { fetchUpgrades } from '../lib/api.js'

const TONE_BY_STATUS = {
  manufacturer_verified: 'signal',
  reputable_independent: 'caution',
  unverified: 'neutral',
}

export default function Upgrade({ partNumber, copy, navigate }) {
  const [input, setInput] = useState(partNumber ?? '')
  const [state, setState] = useState({ status: 'idle', data: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    setInput(partNumber ?? '')
  }, [partNumber])

  useEffect(() => {
    if (!partNumber) {
      setState({ status: 'idle', data: null })
      return undefined
    }

    const abort = new AbortController()
    setState({ status: 'loading', data: null })

    fetchUpgrades(partNumber, { signal: abort.signal })
      .then((data) => {
        if (abort.signal.aborted) return
        setState({ status: 'ready', data })
      })
      .catch((failure) => {
        if (failure.name === 'AbortError') return
        setState({ status: failure.status === 404 ? 'missing' : 'error', data: null })
      })

    return () => abort.abort()
  }, [partNumber, attempt])

  function submit(event) {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    navigate(`/upgrade/${encodeURIComponent(trimmed)}`)
  }

  const u = copy.upgrade
  const { status, data } = state
  const unknown = u.tone.unknown

  const ram = data?.ram ?? null
  const storage = Array.isArray(data?.storage) ? data.storage : []

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:py-20">
      <header className="max-w-[62ch]">
        <h1 className="text-3xl leading-tight text-graphite-50 sm:text-4xl">{u.title}</h1>
        <p className="mt-4 text-base leading-relaxed text-graphite-300">{u.lead}</p>
      </header>

      <form onSubmit={submit} className="mt-9 flex max-w-xl flex-wrap items-end gap-3">
        <div className="flex min-w-[15rem] flex-1 flex-col gap-2">
          <label htmlFor="upgrade-part" className="text-xs font-medium text-graphite-400">
            {u.lookup}
          </label>
          <input
            id="upgrade-part"
            name="part"
            type="text"
            dir="ltr"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={u.lookupHint}
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-[var(--radius-surface)] border hairline bg-graphite-900 px-3 py-2.5 font-mono text-sm text-graphite-100 placeholder:text-graphite-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-[var(--radius-surface)] bg-signal px-5 py-2.5 text-sm font-semibold text-graphite-950 transition-colors duration-200 hover:bg-signal-strong"
        >
          {u.lookupCta}
        </button>
      </form>

      <div className="mt-12">
        {status === 'loading' ? <LoadingRows label={copy.states.loading} rows={2} /> : null}

        {status === 'missing' ? <EmptyState title={u.notFound} /> : null}

        {status === 'error' ? (
          <ErrorState
            title={copy.states.errorTitle}
            body={copy.catalog.loadError}
            onRetry={() => setAttempt((value) => value + 1)}
            retryLabel={copy.catalog.retry}
          />
        ) : null}

        {status === 'ready' ? (
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
            <section className="lg:col-span-7" aria-labelledby="upgrade-ram">
              <h2 id="upgrade-ram" className="text-lg font-semibold text-graphite-50">
                {u.ramTitle}
              </h2>

              {!ram ? (
                <p className="mt-5 text-sm text-graphite-400">{u.none}</p>
              ) : (
                <div className="mt-5 rounded-[var(--radius-surface)] border hairline bg-graphite-900 p-6">
                  <Tone tone={TONE_BY_STATUS[ram.verification_status] ?? 'neutral'}>
                    {u.level[ram.verification_status] ?? unknown}
                  </Tone>

                  <dl className="mt-6 space-y-4 text-sm">
                    {[
                      [u.slots, ram.slot_count],
                      [u.occupied, ram.occupied_slot_count],
                      [u.soldered, ram.soldered_gb === null || ram.soldered_gb === undefined ? null : `${ram.soldered_gb} GB`],
                      [u.maxDocumented, ram.documented_max_gb === null || ram.documented_max_gb === undefined ? null : `${ram.documented_max_gb} GB`],
                      [u.meaning, ram.max_meaning],
                    ].map(([label, value]) => {
                      const known = value !== null && value !== undefined && value !== ''
                      return (
                        <div
                          key={label}
                          className="flex items-baseline justify-between gap-4 border-b hairline pb-3 last:border-b-0 last:pb-0"
                        >
                          <dt className="text-graphite-400">{label}</dt>
                          <dd className={known ? 'text-graphite-100' : 'italic text-graphite-500'}>
                            {known ? <span className="ltr-token">{String(value)}</span> : unknown}
                          </dd>
                        </div>
                      )
                    })}
                  </dl>
                </div>
              )}

              <p className="mt-6 max-w-[68ch] border-s-2 border-caution ps-4 text-xs leading-relaxed text-graphite-300">
                {u.unknownWarn}
              </p>
            </section>

            <section className="lg:col-span-5" aria-labelledby="upgrade-storage">
              <h2 id="upgrade-storage" className="text-lg font-semibold text-graphite-50">
                {u.storageTitle}
              </h2>

              {storage.length === 0 ? (
                <p className="mt-5 text-sm text-graphite-400">{u.none}</p>
              ) : (
                <ul className="mt-5 space-y-3">
                  {storage.map((slot) => {
                    const descriptor =
                      [slot.form_factor, slot.protocol, slot.pcie_generation ? `PCIe ${slot.pcie_generation}` : null]
                        .filter(Boolean)
                        .join(' / ') || null
                    return (
                      <li
                        key={slot.slot_index}
                        className="rounded-[var(--radius-surface)] border hairline bg-graphite-850 p-5 text-sm"
                      >
                        <div className="flex items-baseline justify-between gap-4">
                          <p className="font-medium text-graphite-100">
                            {u.storageTitle} {slot.slot_index}
                          </p>
                          <p className="text-xs text-graphite-400">
                            {slot.occupied_status ?? unknown}
                          </p>
                        </div>
                        <p className={`mt-2 ${descriptor ? 'text-graphite-300' : 'italic text-graphite-500'}`}>
                          {descriptor ? <span className="ltr-token">{descriptor}</span> : unknown}
                        </p>
                        {slot.constraints_text ? (
                          <p className="mt-2 text-xs leading-relaxed text-graphite-400">
                            {slot.constraints_text}
                          </p>
                        ) : null}
                      </li>
                    )
                  })}
                </ul>
              )}

              <p className="mt-6 text-xs leading-relaxed text-graphite-500">{u.safety}</p>

              <Link
                to="/upgrade-or-replace"
                navigate={navigate}
                className="mt-8 inline-block rounded-[var(--radius-surface)] border hairline px-4 py-2.5 text-sm text-graphite-100 transition-colors duration-200 hover:border-graphite-500"
              >
                {copy.nav.calc}
              </Link>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  )
}

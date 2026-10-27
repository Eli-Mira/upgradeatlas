import { useEffect, useState } from 'react'
import Reveal from '../components/Reveal.jsx'
import { Tone } from '../components/SkuCard.jsx'
import { EmptyState, ErrorState, LoadingRows } from '../components/States.jsx'
import { Link } from '../lib/router.jsx'
import { fetchLaptop } from '../lib/api.js'
import { formatCount } from '../lib/format.js'

export default function SkuDetail({ partNumber, copy, localeKey, navigate, compare }) {
  const [state, setState] = useState({ status: 'loading', sku: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const abort = new AbortController()
    setState({ status: 'loading', sku: null })

    fetchLaptop(partNumber, { signal: abort.signal })
      .then((sku) => {
        if (abort.signal.aborted) return
        setState({ status: 'ready', sku })
      })
      .catch((failure) => {
        if (failure.name === 'AbortError') return
        setState({ status: failure.status === 404 ? 'missing' : 'error', sku: null })
      })

    return () => abort.abort()
  }, [partNumber, attempt])

  const { status, sku } = state
  const s = copy.sku

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6">
        <LoadingRows label={copy.states.loading} rows={2} />
      </div>
    )
  }

  if (status === 'missing') {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6">
        <EmptyState
          title={s.notFound}
          action={
            <Link
              to="/laptops"
              navigate={navigate}
              className="rounded-[var(--radius-surface)] bg-graphite-700 px-4 py-2 text-sm font-medium text-graphite-50 transition-colors duration-200 hover:bg-graphite-600"
            >
              {s.backToCatalog}
            </Link>
          }
        />
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6">
        <ErrorState
          title={copy.states.errorTitle}
          body={copy.catalog.loadError}
          onRetry={() => setAttempt((value) => value + 1)}
          retryLabel={copy.catalog.retry}
        />
      </div>
    )
  }

  const variant = sku.variant ?? {}
  const family = variant.family ?? {}
  const brand = family.brand ?? {}
  const ram = sku.ram_configuration ?? sku.ramConfiguration ?? null
  const slots = sku.storage_slots ?? sku.storageSlots ?? []
  const selected = compare.has(sku.manufacturer_part_number)

  const unknown = copy.upgrade.tone.unknown
  const rows = [
    [s.brand, brand.name],
    [s.family, family.family_name],
    [s.cpu, sku.cpu?.model],
    [s.gpu, sku.gpu?.model],
    [
      s.display,
      sku.display
        ? [sku.display.diagonal_inches ? `${sku.display.diagonal_inches}"` : null, sku.display.resolution_width && sku.display.resolution_height ? `${sku.display.resolution_width}x${sku.display.resolution_height}` : null, sku.display.refresh_hz ? `${sku.display.refresh_hz}Hz` : null]
            .filter(Boolean)
            .join(' ') || null
        : null,
    ],
    [s.ramInstalled, sku.base_ram_gb !== null && sku.base_ram_gb !== undefined ? `${formatCount(sku.base_ram_gb, localeKey)} GB` : null],
    [s.storageBase, sku.base_storage_gb !== null && sku.base_storage_gb !== undefined ? `${formatCount(sku.base_storage_gb, localeKey)} GB` : null],
  ]

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:py-20">
      <Link
        to="/laptops"
        navigate={navigate}
        className="text-sm text-graphite-400 transition-colors duration-200 hover:text-signal"
      >
        {s.backToCatalog}
      </Link>

      <header className="mt-8 border-b hairline pb-8">
        <h1 className="max-w-[24ch] text-3xl leading-tight text-graphite-50 sm:text-4xl">
          {sku.display_name}
        </h1>
        <p className="mt-4 font-mono text-sm text-graphite-300">
          <span className="ltr-token">{sku.manufacturer_part_number}</span>
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() =>
              compare.toggle({
                partNumber: sku.manufacturer_part_number,
                displayName: sku.display_name,
              })
            }
            aria-pressed={selected}
            disabled={!selected && compare.isFull}
            className="rounded-[var(--radius-surface)] border hairline px-4 py-2.5 text-sm text-graphite-100 transition-colors duration-200 hover:border-graphite-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {selected ? s.compareRemove : s.compareAdd}
          </button>
          <Link
            to={`/upgrade/${encodeURIComponent(sku.manufacturer_part_number)}`}
            navigate={navigate}
            className="rounded-[var(--radius-surface)] bg-signal px-4 py-2.5 text-sm font-semibold text-graphite-950 transition-colors duration-200 hover:bg-signal-strong"
          >
            {s.upgradeCta}
          </Link>
        </div>
      </header>

      <div className="mt-12 grid gap-14 lg:grid-cols-12 lg:gap-10">
        {/* --- Specifications ------------------------------------------- */}
        <section className="lg:col-span-7" aria-labelledby="specs-title">
          <h2 id="specs-title" className="text-lg font-semibold text-graphite-50">
            {s.specs}
          </h2>
          <dl className="mt-5">
            {rows.map(([label, value]) => {
              const known = value !== null && value !== undefined && value !== ''
              return (
                <div
                  key={label}
                  className="grid grid-cols-1 gap-1 border-b hairline py-3.5 sm:grid-cols-3 sm:gap-4"
                >
                  <dt className="text-sm text-graphite-400">{label}</dt>
                  <dd
                    className={`text-sm sm:col-span-2 ${known ? 'text-graphite-100' : 'italic text-graphite-500'}`}
                  >
                    {known ? <span className="ltr-token">{value}</span> : unknown}
                  </dd>
                </div>
              )
            })}
          </dl>
        </section>

        {/* --- Upgrade potential ---------------------------------------- */}
        <section className="lg:col-span-5" aria-labelledby="upgrade-title">
          <h2 id="upgrade-title" className="text-lg font-semibold text-graphite-50">
            {s.upgradeSummary}
          </h2>

          <div className="mt-5 rounded-[var(--radius-surface)] border hairline bg-graphite-900 p-6">
            {!ram ? (
              <p className="text-sm text-graphite-300">{s.noRamData}</p>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-3">
                  <Tone
                    tone={
                      ram.verification_status === 'manufacturer_verified'
                        ? 'signal'
                        : ram.verification_status === 'reputable_independent'
                          ? 'caution'
                          : 'neutral'
                    }
                  >
                    {copy.upgrade.level[ram.verification_status] ?? unknown}
                  </Tone>
                </div>

                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-graphite-400">{copy.upgrade.slots}</dt>
                    <dd className="text-graphite-100 tnum">
                      {ram.slot_count ?? unknown}
                      {ram.occupied_slot_count !== null && ram.occupied_slot_count !== undefined ? (
                        <span className="ms-2 text-graphite-400">
                          ({ram.occupied_slot_count} {copy.upgrade.occupied})
                        </span>
                      ) : null}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-graphite-400">{copy.upgrade.soldered}</dt>
                    <dd className="text-graphite-100 tnum">
                      {ram.soldered_gb !== null && ram.soldered_gb !== undefined
                        ? `${ram.soldered_gb} GB`
                        : unknown}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-graphite-400">{copy.upgrade.maxDocumented}</dt>
                    <dd className="text-graphite-100 tnum">
                      {ram.documented_max_gb !== null && ram.documented_max_gb !== undefined
                        ? `${ram.documented_max_gb} GB`
                        : unknown}
                    </dd>
                  </div>
                  {ram.max_meaning ? (
                    <div className="border-t hairline pt-3">
                      <dt className="text-graphite-400">{copy.upgrade.meaning}</dt>
                      <dd className="mt-1 text-graphite-300">{ram.max_meaning}</dd>
                    </div>
                  ) : null}
                </dl>
              </>
            )}

            <p className="mt-6 border-t hairline pt-4 text-xs leading-relaxed text-graphite-400">
              {copy.upgrade.unknownWarn}
            </p>
          </div>

          {slots.length > 0 ? (
            <ul className="mt-5 space-y-3">
              {slots.map((slot) => (
                <li
                  key={slot.slot_index}
                  className="rounded-[var(--radius-surface)] border hairline bg-graphite-850 p-4 text-sm"
                >
                  <p className="font-medium text-graphite-100">
                    {copy.upgrade.storageTitle} {slot.slot_index}
                  </p>
                  <p className="mt-1.5 text-graphite-300">
                    <span className="ltr-token">
                      {[slot.form_factor, slot.protocol, slot.pcie_generation ? `PCIe ${slot.pcie_generation}` : null]
                        .filter(Boolean)
                        .join(' / ') || unknown}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          ) : null}

          <Reveal>
            <p className="mt-6 text-xs leading-relaxed text-graphite-500">{copy.upgrade.safety}</p>
          </Reveal>
        </section>
      </div>
    </div>
  )
}

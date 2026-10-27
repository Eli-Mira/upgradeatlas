import { Link } from '../lib/router.jsx'
import { formatCount, formatEgp } from '../lib/format.js'

/** One line of a specification, or an explicit unknown. Never a blank. */
export function SpecRow({ label, value, unknownLabel, unit }) {
  const known = value !== null && value !== undefined && value !== ''
  return (
    <div className="flex items-baseline justify-between gap-4 border-b hairline py-2.5 last:border-b-0">
      <dt className="shrink-0 text-sm text-graphite-400">{label}</dt>
      <dd className={`text-sm ${known ? 'text-graphite-100 tnum' : 'text-graphite-500 italic'}`}>
        {known ? (
          <>
            <span className="ltr-token">{String(value)}</span>
            {unit ? <span className="ms-1 text-graphite-400">{unit}</span> : null}
          </>
        ) : (
          unknownLabel
        )}
      </dd>
    </div>
  )
}

/** A state chip. `tone` is semantic only, never decorative. */
export function Tone({ tone = 'neutral', children }) {
  const tones = {
    signal: 'border-[color-mix(in_srgb,var(--color-signal)_45%,transparent)] text-signal',
    caution: 'border-[color-mix(in_srgb,var(--color-caution)_45%,transparent)] text-caution',
    stop: 'border-[color-mix(in_srgb,var(--color-stop)_45%,transparent)] text-stop',
    neutral: 'border-graphite-600 text-graphite-300',
  }
  return (
    <span
      className={`inline-block rounded-[var(--radius-sharp)] border px-2 py-0.5 text-xs font-medium ${tones[tone] ?? tones.neutral}`}
    >
      {children}
    </span>
  )
}

export default function SkuCard({ sku, copy, localeKey, navigate, compare }) {
  const selected = compare.has(sku.manufacturer_part_number)
  const ramKnown = sku.base_ram_gb !== null && sku.base_ram_gb !== undefined
  const storageKnown = sku.base_storage_gb !== null && sku.base_storage_gb !== undefined
  const cpu = sku.cpu?.model ?? null
  const price = formatEgp(sku.price_egp, localeKey)

  const toggle = () =>
    compare.toggle({
      partNumber: sku.manufacturer_part_number,
      displayName: sku.display_name,
    })

  return (
    <article className="group relative flex flex-col rounded-[var(--radius-surface)] border hairline bg-graphite-900 transition-colors duration-300 hover:border-signal">
      {/* Red accent bar — static graphite, turns signal on hover */}
      <div className="h-1 w-full rounded-t-[var(--radius-surface)] bg-graphite-700 transition-colors duration-300 group-hover:bg-signal" />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-semibold leading-snug text-graphite-50">
            {sku.display_name}
          </h3>
          {selected ? <Tone tone="signal">{copy.compare.add}</Tone> : null}
        </div>

        <p className="mt-2 text-xs text-graphite-400">
          <span className="ltr-token font-mono">{sku.manufacturer_part_number}</span>
        </p>

        <dl className="mt-4">
          <SpecRow
            label={copy.sku.cpu}
            value={cpu}
            unknownLabel={copy.upgrade.tone.unknown}
          />
          <SpecRow
            label={copy.sku.ramInstalled}
            value={ramKnown ? formatCount(sku.base_ram_gb, localeKey) : null}
            unknownLabel={copy.sku.noRamData ? copy.upgrade.tone.unknown : 'Unknown'}
            unit={ramKnown ? 'GB' : null}
          />
          <SpecRow
            label={copy.sku.storageBase}
            value={storageKnown ? formatCount(sku.base_storage_gb, localeKey) : null}
            unknownLabel={copy.upgrade.tone.unknown}
            unit={storageKnown ? 'GB' : null}
          />
          <SpecRow
            label={copy.sku.price}
            value={price}
            unknownLabel={copy.upgrade.tone.unknown}
          />
        </dl>
      </div>

      <div className="flex items-center gap-2 border-t hairline p-3">
        <Link
          to={`/laptops/${encodeURIComponent(sku.manufacturer_part_number)}`}
          navigate={navigate}
          className="flex-1 rounded-[var(--radius-surface)] bg-graphite-700 px-3 py-2 text-center text-sm font-medium text-graphite-50 transition-colors duration-200 hover:bg-signal hover:text-graphite-950"
        >
          {copy.catalog.view}
        </Link>
        <button
          type="button"
          onClick={toggle}
          aria-pressed={selected}
          disabled={!selected && compare.isFull}
          className="rounded-[var(--radius-surface)] border hairline px-3 py-2 text-sm text-graphite-200 transition-colors duration-200 hover:border-signal hover:text-graphite-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {selected ? copy.sku.compareRemove : copy.sku.compareAdd}
        </button>
      </div>
    </article>
  )
}

/* Image-led product plate. Concept renders from lab assets; not real SKUs. */
import { Link } from '../lib/router.jsx'

const catalogImages = [
  new URL('../assets/catalog-01.webp', import.meta.url).href,
  new URL('../assets/catalog-02.webp', import.meta.url).href,
  new URL('../assets/catalog-03.webp', import.meta.url).href,
]

export default function SkuCard({ sku, copy, localeKey, navigate, compare }) {
  const selected = compare.has(sku.manufacturer_part_number)
  const imageUrl = sku.imageUrl ?? catalogImages[Math.abs(sku.manufacturer_part_number.length - 1) % catalogImages.length]
  const price = sku.price_egp != null ? new Intl.NumberFormat(localeKey === 'ar' ? 'ar-EG' : 'en-EG', {
    style: 'currency', currency: 'EGP', maximumFractionDigits: 0,
  }).format(sku.price_egp) : null

  const toggle = () =>
    compare.toggle({
      partNumber: sku.manufacturer_part_number,
      displayName: sku.display_name,
    })

  return (
    <article className="group relative flex flex-col rounded-[var(--radius-surface)] border hairline bg-graphite-900 transition-colors duration-300 hover:border-signal">
      <div className="h-[160px] md:h-[200px] rounded-b-none overflow-hidden border-b hairline relative bg-graphite-800">
        <img src={imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
        <span className="absolute inset-0 bg-[color-mix(in_srgb,black_50%)] hidden group-hover:block" />
        <span className="absolute bottom-2 inset-inline-start-2 rounded-[var(--radius-sharp)] border hairline bg-[color-mix(in_srgb,var(--color-graphite-950)_60%,transparent)] px-2 py-1 text-[10px] font-medium text-graphite-200">
          Concept render
        </span>
        <span className="absolute top-2 inset-inline-end-2 rounded-[var(--radius-sharp)] border hairline bg-[color-mix(in_srgb,var(--color-signal)_90%,transparent)] px-2 py-1 text-[10px] font-semibold text-graphite-950">
          {copy.catalog.illustrative}
        </span>
      </div>

      <div className="flex-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[14px] font-semibold leading-snug text-graphite-50">
            {sku.display_name}
          </h3>
          <button
            type="button"
            aria-pressed={selected}
            onClick={toggle}
            disabled={!selected && compare.isFull}
            className={`rounded-[var(--radius-sharp)] border px-2 py-1 text-xs font-medium transition-colors duration-200 ${
              selected
                ? 'border-signal text-signal'
                : 'hairline text-graphite-300 hover:border-graphite-500 hover:text-graphite-100 disabled:cursor-not-allowed disabled:opacity-40'
            }`}
          >
            {selected ? copy.sku.compareRemove : copy.sku.compareAdd}
          </button>
        </div>

        <p className="mt-2 text-[11px] font-mono text-graphite-400 ltr-token">
          {sku.manufacturer_part_number}
        </p>

        <dl className="mt-3 space-y-1.5">
          <dt className="flex justify-between text-[12px] text-graphite-400">
            <span>{copy.sku.cpu}</span>
            <span className="ltr-token text-graphite-300">{sku.cpu?.model ?? copy.upgrade.tone.unknown}</span>
          </dt>
          <dt className="flex justify-between text-[12px] text-graphite-400">
            <span>{copy.sku.ramInstalled}</span>
            <span className={`ltr-token text-[12px] ${sku.base_ram_gb != null ? 'text-graphite-100' : 'italic text-graphite-500'}`}>
              {sku.base_ram_gb != null ? `${sku.base_ram_gb} GB` : copy.upgrade.tone.unknown}
            </span>
          </dt>
          <dt className="flex justify-between text-[12px] text-graphite-400">
            <span>{copy.sku.storageBase}</span>
            <span className={`ltr-token text-[12px] ${sku.base_storage_gb != null ? 'text-graphite-100' : 'italic text-graphite-500'}`}>
              {sku.base_storage_gb != null ? `${sku.base_storage_gb} GB` : copy.upgrade.tone.unknown}
            </span>
          </dt>
          <dt className="flex justify-between text-[12px] text-graphite-400 font-medium">
            <span>{copy.sku.price}</span>
            <span className="ltr-token text-[12px] text-graphite-100 tnum">
              {price ?? copy.upgrade.tone.unknown}
            </span>
          </dt>
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
          className={`rounded-[var(--radius-surface)] border hairline px-3 py-2 text-sm text-graphite-200 transition-colors duration-200 ${
            selected ? 'bg-signal text-graphite-950' : 'text-graphite-300 hover:border-signal hover:text-graphite-100 disabled:cursor-not-allowed disabled:opacity-40'
          }`}
        >
          {selected ? copy.sku.compareRemove : copy.sku.compareAdd}
        </button>
      </div>
    </article>
  )
}

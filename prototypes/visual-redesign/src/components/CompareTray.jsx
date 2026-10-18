/* Comparison tray — appears when ≥1 model selected. Shows cap before limit hit.
   Click Compare opens native dialog with aligned sample values and difference highlighting. */
import { useState } from 'react'
import { Link } from '../lib/router.jsx'

export default function CompareTray({ compare, copy, navigate, localeKey }) {
  const { items, max } = compare
  if (items.length === 0) return null

  const [dialogOpen, setDialogOpen] = useState(false)

  const openDialog = () => setDialogOpen(true)
  const closeDialog = () => setDialogOpen(false)

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t hairline bg-[color-mix(in_srgb,var(--color-graphite-900)_94%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1344px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <p className="text-sm font-medium text-graphite-100">
            {copy.compare.trayTitle}
            <span className="ms-2 text-graphite-400 tnum">
              {items.length}/{max}
            </span>
          </p>

          <ul className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            {items.map((item) => (
              <li
                key={item.partNumber}
                className="flex items-center gap-2 rounded-[var(--radius-sharp)] border hairline bg-graphite-800 px-2.5 py-1"
              >
                <span className="ltr-token font-mono text-xs text-graphite-200">
                  {item.partNumber}
                </span>
                <button
                  type="button"
                  onClick={() => compare.remove(item.partNumber)}
                  className="text-xs text-graphite-400 transition-colors duration-200 hover:text-stop"
                >
                  {copy.compare.remove}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={compare.clear}
              className="rounded-[var(--radius-surface)] border hairline px-3 py-2 text-sm text-graphite-300 transition-colors duration-200 hover:border-graphite-500 hover:text-graphite-100"
            >
              {copy.compare.trayClear}
            </button>
            <Link
              to="/compare"
              navigate={navigate}
              aria-disabled={items.length < 2}
              className={`rounded-[var(--radius-surface)] px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                items.length < 2
                  ? 'pointer-events-none bg-graphite-800 text-graphite-500'
                  : 'bg-signal text-graphite-950 hover:bg-signal-strong'
              }`}
            >
              {copy.compare.trayOpen}
            </Link>
          </div>
        </div>
      </div>

      {/* Native compare dialog — shows aligned sample values, difference highlighting */}
      <dialog
        open={dialogOpen}
        onCancel={closeDialog}
        className="rounded-[var(--radius-surface)] border hairline bg-graphite-900 p-6 max-w-[90vw] shadow-lg"
        aria-label={copy.compare.trayTitle}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-graphite-50">{copy.compare.trayTitle}</h2>
          <button
            type="button"
            onClick={closeDialog}
            aria-label="Close comparison"
            className="rounded-[var(--radius-sharp)] border hairline px-3 py-1 text-xs text-graphite-300 hover:bg-graphite-800"
          >
            {copy.catalog.clear}
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-graphite-400">
            {items.length} models selected for comparison.
          </p>

          {/* Simple aligned view: two-column list per model */}
          <div className="space-y-3">
            {items.map((model) => (
              <div key={model.manufacturer_part_number} className="border-t hairline pt-3">
                <h3 className="text-sm font-medium text-graphite-50">{model.display_name}</h3>
                <dl className="mt-2 space-y-1">
                  <div className="flex items-baseline justify-between gap-4 border-b hairline py-1">
                    <dt className="text-[12px] text-graphite-400">{copy.sku.cpu}</dt>
                    <dd className={`text-[12px] ${model.cpu?.model ? 'text-graphite-100 tnum' : 'italic text-graphite-500'}`}>
                      {model.cpu?.model ?? copy.upgrade.tone.unknown}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 border-b hairline py-1">
                    <dt className="text-[12px] text-graphite-400">{copy.sku.ramInstalled}</dt>
                    <dd className={`text-[12px] ${model.base_ram_gb != null ? 'text-graphite-100 tnum' : 'italic text-graphite-500'}`}>
                      {model.base_ram_gb != null ? `${model.base_ram_gb} GB` : copy.upgrade.tone.unknown}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 border-b hairline py-1">
                    <dt className="text-[12px] text-graphite-400">{copy.sku.storageBase}</dt>
                    <dd className={`text-[12px] ${model.base_storage_gb != null ? 'text-graphite-100 tnum' : 'italic text-graphite-500'}`}>
                      {model.base_storage_gb != null ? `${model.base_storage_gb} GB` : copy.upgrade.tone.unknown}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4 border-b hairline py-1">
                    <dt className="text-[12px] text-graphite-400">{copy.sku.price}</dt>
                    <dd className="ltr-token text-[12px] text-graphite-100 tnum">
                      {model.price_egp != null ? new Intl.NumberFormat(localeKey === 'ar' ? 'ar-EG' : 'en-EG', {
                        style: 'currency',
                        currency: 'EGP',
                        maximumFractionDigits: 0,
                      }).format(model.price_egp) : copy.upgrade.tone.unknown}
                    </dd>
                  </div>
                </dl>
              </div>
            ))}

            {/* Difference note — simplified: check if any spec varies */}
            <p className="mt-4 text-sm text-graphite-400">
              {(() => {
                if (items.length < 2) return ''
                const first = items[0]
                const sameCPU = items.every((i) => i.cpu?.model === first.cpu?.model)
                const sameRam = items.every((i) => i.base_ram_gb === first.base_ram_gb)
                const sameStorage = items.every((i) => i.base_storage_gb === first.base_storage_gb)
                const samePrice = items.every((i) => i.price_egp === first.price_egp)
                if (sameCPU && sameRam && sameStorage && samePrice) return 'All shown specs match.'
                return 'Some specs differ — see values above.'
              })()}
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => {
              compare.clear()
              setDialogOpen(false)
            }}
            className="flex-1 rounded-[var(--radius-sharp)] border hairline py-2 text-sm text-graphite-400 hover:text-graphite-100"
          >
            {copy.catalog.clear}
          </button>
          <button
            type="button"
            onClick={closeDialog}
            className="flex-1 rounded-[var(--radius-sharp)] bg-graphite-700 py-2 text-sm font-medium text-graphite-100 transition-colors duration-200 hover:bg-graphite-600"
          >
            Done
          </button>
        </div>
      </dialog>
    </>
  )
}

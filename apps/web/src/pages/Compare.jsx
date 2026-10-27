import { useEffect, useState } from 'react'
import { EmptyState, ErrorState, LoadingRows } from '../components/States.jsx'
import { Link } from '../lib/router.jsx'
import { fetchLaptop } from '../lib/api.js'
import { formatCount } from '../lib/format.js'

/**
 * Compare 2-4 exact SKUs.
 *
 * The rule that matters: a missing value renders as its own `unknown` token,
 * never as a blank cell and never as a zero. A row is only marked as differing
 * when every present value agrees; an unknown makes the row "not the same"
 * without pretending the values are different numbers.
 */
export default function Compare({ copy, localeKey, navigate, compare }) {
  const [state, setState] = useState({ status: 'loading', skus: [] })
  const [attempt, setAttempt] = useState(0)
  const partNumbers = compare.items.map((item) => item.partNumber)
  const key = partNumbers.join(',')

  useEffect(() => {
    if (partNumbers.length === 0) {
      setState({ status: 'empty', skus: [] })
      return undefined
    }

    const abort = new AbortController()
    setState({ status: 'loading', skus: [] })

    Promise.all(partNumbers.map((part) => fetchLaptop(part, { signal: abort.signal })))
      .then((skus) => {
        if (abort.signal.aborted) return
        setState({ status: 'ready', skus })
      })
      .catch((failure) => {
        if (failure.name === 'AbortError') return
        setState({ status: 'error', skus: [] })
      })

    return () => abort.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt])

  const { status, skus } = state
  const unknown = copy.upgrade.tone.unknown

  const header = (
    <header className="max-w-[62ch]">
      <h1 className="text-3xl leading-tight text-graphite-50 sm:text-4xl">{copy.compare.title}</h1>
      <p className="mt-4 text-base leading-relaxed text-graphite-300">{copy.compare.lead}</p>
    </header>
  )

  if (status === 'empty' || skus.length === 0) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:py-20">
        {header}
        <div className="mt-10">
          <EmptyState
            title={copy.compare.empty}
            action={
              <Link
                to="/laptops"
                navigate={navigate}
                className="rounded-[var(--radius-surface)] bg-signal px-4 py-2.5 text-sm font-semibold text-graphite-950 transition-colors duration-200 hover:bg-signal-strong"
              >
                {copy.compare.emptyCta}
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:py-20">
        {header}
        <div className="mt-10">
          <LoadingRows label={copy.states.loading} rows={2} />
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:py-20">
        {header}
        <div className="mt-10">
          <ErrorState
            title={copy.states.errorTitle}
            body={copy.catalog.loadError}
            onRetry={() => setAttempt((value) => value + 1)}
            retryLabel={copy.catalog.retry}
          />
        </div>
      </div>
    )
  }

  const display = (sku) => {
    const d = sku.display
    if (!d) return null
    const parts = [
      d.diagonal_inches ? `${d.diagonal_inches}"` : null,
      d.resolution_width && d.resolution_height ? `${d.resolution_width}x${d.resolution_height}` : null,
      d.refresh_hz ? `${d.refresh_hz}Hz` : null,
    ].filter(Boolean)
    return parts.length ? parts.join(' ') : null
  }

  const rows = [
    {
      label: copy.sku.brand,
      value: (sku) => sku.variant?.family?.brand?.name ?? null,
    },
    {
      label: copy.sku.family,
      value: (sku) => sku.variant?.family?.family_name ?? null,
    },
    { label: copy.sku.cpu, value: (sku) => sku.cpu?.model ?? null },
    { label: copy.sku.gpu, value: (sku) => sku.gpu?.model ?? null },
    { label: copy.sku.display, value: display },
    {
      label: copy.sku.ramInstalled,
      value: (sku) =>
        sku.base_ram_gb === null || sku.base_ram_gb === undefined
          ? null
          : `${formatCount(sku.base_ram_gb, localeKey)} GB`,
    },
    {
      label: copy.sku.storageBase,
      value: (sku) =>
        sku.base_storage_gb === null || sku.base_storage_gb === undefined
          ? null
          : `${formatCount(sku.base_storage_gb, localeKey)} GB`,
    },
    {
      label: copy.upgrade.slots,
      value: (sku) => {
        const ram = sku.ram_configuration ?? sku.ramConfiguration
        return ram?.slot_count === null || ram?.slot_count === undefined
          ? null
          : String(ram.slot_count)
      },
    },
    {
      label: copy.upgrade.maxDocumented,
      value: (sku) => {
        const ram = sku.ram_configuration ?? sku.ramConfiguration
        return ram?.documented_max_gb === null || ram?.documented_max_gb === undefined
          ? null
          : `${ram.documented_max_gb} GB`
      },
    },
    {
      label: copy.upgrade.verification,
      value: (sku) => {
        const ram = sku.ram_configuration ?? sku.ramConfiguration
        return ram?.verification_status ? copy.upgrade.level[ram.verification_status] ?? null : null
      },
    },
  ]

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:py-20">
      {header}

      <div className="mt-10 overflow-x-auto" data-lenis-prevent>
        <table className="w-full min-w-[46rem] border-collapse text-sm">
          <caption className="sr-only">{copy.compare.title}</caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="w-44 border-b hairline p-3 text-start align-bottom text-xs font-medium text-graphite-400"
              >
                {copy.compare.attribute}
              </th>
              {skus.map((sku) => (
                <th
                  key={sku.manufacturer_part_number}
                  scope="col"
                  className="border-b hairline p-3 text-start align-bottom"
                >
                  <span className="block text-[15px] font-semibold leading-snug text-graphite-50">
                    {sku.display_name}
                  </span>
                  <span className="mt-1 block font-mono text-xs text-graphite-400">
                    <span className="ltr-token">{sku.manufacturer_part_number}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => compare.remove(sku.manufacturer_part_number)}
                    className="mt-2 text-xs text-graphite-400 transition-colors duration-200 hover:text-stop"
                  >
                    {copy.compare.remove}
                  </button>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => {
              const values = skus.map(row.value)
              const present = values.filter((value) => value !== null && value !== undefined)
              const allSame = present.length === values.length && new Set(present).size === 1

              return (
                <tr key={row.label}>
                  <th
                    scope="row"
                    className="border-b hairline p-3 text-start align-top font-medium text-graphite-400"
                  >
                    {row.label}
                    {!allSame ? (
                      <span className="mt-1 block text-[11px] font-normal text-graphite-500">
                        {copy.compare.differs}
                      </span>
                    ) : null}
                  </th>
                  {values.map((value, index) => {
                    const known = value !== null && value !== undefined
                    return (
                      <td
                        key={`${row.label}-${skus[index].manufacturer_part_number}`}
                        className={`border-b hairline p-3 align-top ${
                          known ? 'text-graphite-100' : 'italic text-graphite-500'
                        }`}
                      >
                        {known ? <span className="ltr-token">{value}</span> : unknown}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

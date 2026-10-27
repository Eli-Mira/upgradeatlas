import { useCallback, useEffect, useState } from 'react'
import SkuCard from '../components/SkuCard.jsx'
import Reveal from '../components/Reveal.jsx'
import { EmptyState, ErrorState, LoadingRows } from '../components/States.jsx'
import { fetchLaptops } from '../lib/api.js'

const RAM_OPTIONS = [null, 8, 16, 32]
const BRAND_FILTERS = ['lenovo', 'dell', 'hp', 'asus', 'acer']
const USE_CASE_FILTERS = ['gaming', 'programming', 'study', 'content_creation', 'business']
const MAX_PRICE = 500000
const PAGE_SIZE = 24

export default function Catalog({ copy, localeKey, navigate, compare }) {
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const [minRam, setMinRam] = useState(null)
  const [brands, setBrands] = useState(new Set())
  const [useCases, setUseCases] = useState(new Set())
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE)
  const [page, setPage] = useState(1)
  const [state, setState] = useState({ status: 'loading', rows: [], lastPage: 1, total: 0 })
  const [attempt, setAttempt] = useState(0)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const retry = useCallback(() => setAttempt((value) => value + 1), [])

  useEffect(() => { setPage(1) }, [query, minRam, [...brands].join(','), maxPrice, [...useCases].join(',')])

  useEffect(() => {
    const abort = new AbortController()
    const clientFilteringActive = brands.size > 0 || useCases.size > 0 || maxPrice < MAX_PRICE
    const perPage = clientFilteringActive ? 100 : 24

    setState((previous) => ({ ...previous, status: 'loading' }))

    fetchLaptops({ q: query, page: 1, perPage, minRamGb: minRam, signal: abort.signal })
      .then((result) => {
        if (abort.signal.aborted) return
        setState({ status: 'ready', rows: result.rows, lastPage: result.lastPage, total: result.total })
      })
      .catch((failure) => {
        if (failure.name === 'AbortError') return
        setState({ status: 'error', rows: [], lastPage: 1, total: 0 })
      })

    return () => abort.abort()
  }, [query, minRam, [...brands].join(','), maxPrice, [...useCases].join(','), attempt])

  function submitSearch(event) {
    event.preventDefault()
    setPage(1)
    setQuery(input.trim())
  }

  function changeRam(value) {
    setPage(1)
    setMinRam(value)
  }

  function toggleBrand(slug) {
    setPage(1)
    setBrands((current) => {
      const next = new Set(current)
      next.has(slug) ? next.delete(slug) : next.add(slug)
      return next
    })
  }

  function toggleUseCase(key) {
    setPage(1)
    setUseCases((current) => {
      const next = new Set(current)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function changeMaxPrice(value) {
    setPage(1)
    setMaxPrice(Math.min(MAX_PRICE, Math.max(0, Number(value) || 0)))
  }

  function clearAll() {
    setInput('')
    setQuery('')
    setMinRam(null)
    setBrands(new Set())
    setUseCases(new Set())
    setMaxPrice(MAX_PRICE)
    setPage(1)
  }

  function matchesClientFilters(sku) {
    if (brands.size > 0) {
      const brandName = sku?.variant?.family?.brand?.slug?.toLowerCase() ?? null
      if (!brandName || ![...brands].some(b => b.toLowerCase() === brandName)) return false
    }
    if (useCases.size > 0) {
      const useCase = (sku.use_case ?? '').toLowerCase()
      if (!useCase || ![...useCases].some(u => u.toLowerCase() === useCase)) return false
    }
    if (maxPrice < MAX_PRICE) {
      // A missing price is not EGP 0 (D6): a SKU with an unknown price
      // cannot be confirmed to fit the budget, so budget filters exclude
      // it instead of treating it as free.
      if (sku.price_egp === null || sku.price_egp === undefined) return false
      if (sku.price_egp > maxPrice) return false
    }
    return true
  }

  const { status, rows, lastPage, total } = state
  const clientFilteringActive = brands.size > 0 || useCases.size > 0 || maxPrice < MAX_PRICE
  const filteredRows = clientFilteringActive ? rows.filter(matchesClientFilters) : rows
  const displayLastPage = clientFilteringActive ? Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE)) : lastPage
  const displayRows = clientFilteringActive ? filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : rows
  const displayTotal = clientFilteringActive ? filteredRows.length : total
  const hasFilters = Boolean(query) || minRam !== null || brands.size > 0 || useCases.size > 0 || maxPrice < MAX_PRICE
  const activeFilterCount = brands.size + useCases.size + (minRam !== null ? 1 : 0) + (query ? 1 : 0) + (maxPrice < MAX_PRICE ? 1 : 0)

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:py-20">
      <header className="max-w-[62ch]">
        <h1 className="text-3xl leading-tight text-graphite-50 sm:text-4xl">{copy.catalog.title}</h1>
        <p className="mt-4 text-base leading-relaxed text-graphite-300">{copy.catalog.lead}</p>
      </header>

      {/* --- Controls ------------------------------------------------------ */}
      <div className="mt-10 flex flex-col gap-5 border-y hairline py-5 lg:flex-row lg:items-end lg:justify-between">
        <form onSubmit={submitSearch} className="flex flex-1 flex-wrap items-end gap-3" role="search">
          <div className="flex min-w-[16rem] flex-1 flex-col gap-2">
            <label htmlFor="catalog-q" className="text-xs font-medium text-graphite-400">
              {copy.catalog.search}
            </label>
            <input
              id="catalog-q"
              name="q"
              type="search"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={copy.catalog.search}
              autoComplete="off"
              className="w-full rounded-[var(--radius-surface)] border hairline bg-graphite-900 px-3 py-2.5 text-sm text-graphite-100 placeholder:text-graphite-500"
            />
          </div>

          <button
            type="submit"
            className="rounded-[var(--radius-surface)] bg-graphite-700 px-4 py-2.5 text-sm font-medium text-graphite-50 transition-colors duration-200 hover:bg-graphite-600"
          >
            {copy.catalog.searchCta}
          </button>

          {hasFilters ? (
            <button
              type="button"
              onClick={clearAll}
              className="rounded-[var(--radius-surface)] border hairline px-4 py-2.5 text-sm text-graphite-300 transition-colors duration-200 hover:border-graphite-500 hover:text-graphite-100"
            >
              {copy.catalog.clear}
            </button>
          ) : null}
        </form>

        <fieldset className="flex flex-wrap items-center gap-2">
          <legend className="mb-2 text-xs font-medium text-graphite-400">
            {copy.catalog.ramFilter}
          </legend>
          {RAM_OPTIONS.map((option) => {
            const active = minRam === option
            return (
              <button
                key={String(option)}
                type="button"
                aria-pressed={active}
                onClick={() => changeRam(option)}
                className={`rounded-[var(--radius-sharp)] border px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                  active
                    ? 'border-signal text-signal'
                    : 'hairline text-graphite-300 hover:border-graphite-500 hover:text-graphite-100'
                }`}
              >
                {option === null ? copy.catalog.anyRam : `${option}+ GB`}
              </button>
            )
          })}
        </fieldset>
      </div>

      {/* --- Mobile filter toggle ------------------------------------------ */}
      <div className="mt-6 flex items-center gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
          aria-controls="catalog-sidebar"
          className="inline-flex items-center gap-2 rounded-[var(--radius-surface)] border hairline px-4 py-2.5 text-sm font-medium text-graphite-100 transition-colors duration-200 hover:border-signal"
        >
          {copy.catalog.filters}
          {activeFilterCount > 0 ? (
            <span className="rounded-[var(--radius-sharp)] bg-signal px-1.5 py-0.5 text-xs font-semibold text-graphite-950">
              {activeFilterCount}
            </span>
          ) : null}
        </button>
      </div>

      {/* --- Sidebar + grid layout ----------------------------------------- */}
      <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:gap-10">
        {/* Sidebar */}
        <aside
          id="catalog-sidebar"
          className={`flex flex-col gap-8 rounded-[var(--radius-surface)] border hairline bg-graphite-900 p-6 lg:w-64 lg:shrink-0 lg:sticky lg:top-24 ${
            filtersOpen ? '' : 'hidden lg:flex'
          }`}
          role="complementary"
          aria-label={copy.catalog.filters}
        >
          {/* Brand */}
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-graphite-400">
              {copy.catalog.brandFilter}
            </h2>
            <ul className="flex flex-col gap-2">
              {BRAND_FILTERS.map((slug) => {
                const active = brands.has(slug)
                const label = slug.charAt(0).toUpperCase() + slug.slice(1)
                return (
                  <li key={slug}>
                    <label className={`flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-sharp)] border px-3 py-2 transition-colors duration-200 ${
                      active
                        ? 'border-signal bg-[color-mix(in_srgb,var(--color-signal)_14%,transparent)]'
                        : 'hairline hover:border-graphite-500'
                    }`}>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={active}
                        onChange={() => toggleBrand(slug)}
                        aria-label={label}
                      />
                      <span className={`h-3.5 w-3.5 shrink-0 rounded-sm border flex items-center justify-center transition-colors duration-200 ${
                        active ? 'border-signal bg-signal' : 'border-graphite-500'
                      }`}>
                        {active ? (
                          <svg className="h-2.5 w-2.5 text-graphite-950" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path d="M2 6.5l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : null}
                      </span>
                      <span className={`text-sm transition-colors duration-200 ${active ? 'text-graphite-50' : 'text-graphite-300'}`}>
                        {label}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Price */}
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-graphite-400">
              {copy.catalog.priceFilter}
            </h2>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={MAX_PRICE}
                  step={5000}
                  value={maxPrice}
                  onChange={(e) => changeMaxPrice(e.target.value)}
                  className="h-1.5 w-full cursor-pointer accent-signal"
                  aria-label={copy.catalog.priceRange}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="ltr-token text-xs text-graphite-400">EGP 0</span>
                <span className="text-xs text-graphite-500">—</span>
                <span className="ltr-token text-xs font-medium text-graphite-100 tnum">
                  {new Intl.NumberFormat(localeKey === 'ar' ? 'ar-EG' : 'en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(maxPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Use case */}
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-graphite-400">
              {copy.catalog.useCaseFilter}
            </h2>
            <ul className="flex flex-col gap-2">
              {USE_CASE_FILTERS.map((key) => {
                const active = useCases.has(key)
                const label = copy.catalog.useCaseLabels[key] ?? key
                return (
                  <li key={key}>
                    <label className={`flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-sharp)] border px-3 py-2 transition-colors duration-200 ${
                      active
                        ? 'border-signal bg-[color-mix(in_srgb,var(--color-signal)_14%,transparent)]'
                        : 'hairline hover:border-graphite-500'
                    }`}>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={active}
                        onChange={() => toggleUseCase(key)}
                        aria-label={label}
                      />
                      <span className={`h-3.5 w-3.5 shrink-0 rounded-sm border flex items-center justify-center transition-colors duration-200 ${
                        active ? 'border-signal bg-signal' : 'border-graphite-500'
                      }`}>
                        {active ? (
                          <svg className="h-2.5 w-2.5 text-graphite-950" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path d="M2 6.5l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : null}
                      </span>
                      <span className={`text-sm transition-colors duration-200 ${active ? 'text-graphite-50' : 'text-graphite-300'}`}>
                        {label}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>
        </aside>

        {/* --- Main content ----------------------------------------------- */}
        <main className="min-w-0 flex-1">
          {/* --- Result count -------------------------------------------------- */}
          {status === 'ready' ? (
            <p className="mt-2 text-sm text-graphite-400">
              <span className="tnum text-graphite-200">{displayTotal}</span>{' '}
              {hasFilters ? copy.catalog.countFiltered : copy.catalog.countAll}
              {clientFilteringActive && displayTotal !== total ? (
                <span className="ms-1 text-graphite-500">
                  {copy.catalog.outOf} {total}
                </span>
              ) : null}
            </p>
          ) : null}

          {/* --- Body ---------------------------------------------------------- */}
          <div className="mt-6">
            {status === 'loading' ? <LoadingRows label={copy.states.loading} /> : null}

            {status === 'error' ? (
              <ErrorState
                title={copy.states.errorTitle}
                body={copy.catalog.loadError}
                onRetry={retry}
                retryLabel={copy.catalog.retry}
              />
            ) : null}

            {status === 'ready' && displayRows.length === 0 ? (
              hasFilters ? (
                <EmptyState
                  title={copy.states.emptyTitle}
                  body={copy.catalog.noResults}
                />
              ) : (
                // The genuinely empty catalog: the honest pre-data state,
                // not a "no results for your filters" message.
                <EmptyState
                  title={copy.catalog.preDataTitle}
                  body={copy.catalog.preDataBody}
                />
              )
            ) : null}

            {status === 'ready' && displayRows.length > 0 ? (
              <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {displayRows.map((sku, index) => (
                  <Reveal as="li" key={sku.manufacturer_part_number} delay={Math.min(index, 8) * 60}>
                    <SkuCard
                      sku={sku}
                      copy={copy}
                      localeKey={localeKey}
                      navigate={navigate}
                      compare={compare}
                    />
                  </Reveal>
                ))}
              </ul>
            ) : null}
          </div>

          {/* --- Pagination ---------------------------------------------------- */}
          {status === 'ready' && displayLastPage > 1 ? (
            <nav
              aria-label={copy.catalog.page}
              className="mt-12 flex items-center justify-between gap-4 border-t hairline pt-6"
            >
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="rounded-[var(--radius-surface)] border hairline px-4 py-2 text-sm text-graphite-200 transition-colors duration-200 hover:border-graphite-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copy.catalog.prev}
              </button>

              <p className="text-sm text-graphite-400 tnum">
                {copy.catalog.page} {page} {copy.catalog.of} {displayLastPage}
              </p>

              <button
                type="button"
                disabled={page >= displayLastPage}
                onClick={() => setPage((value) => Math.min(displayLastPage, value + 1))}
                className="rounded-[var(--radius-surface)] border hairline px-4 py-2 text-sm text-graphite-200 transition-colors duration-200 hover:border-graphite-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copy.catalog.next}
              </button>
            </nav>
          ) : null}
        </main>
      </div>
    </div>
  )
}

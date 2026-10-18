/* Catalog — 6 fictional concept models, image-led plates, responsive grid.
   Native mobile filter dialog with accessible title/close and focus restoration.
   Compare tray shows max 4 models, states the cap before user hits it. */
import { useState, useEffect } from 'react'
import Reveal from '../components/Reveal.jsx'
import { matchRoute } from '../lib/router.jsx'
import { useCompare } from '../lib/compare-store.js'
import { LOCALES } from '../lib/i18n.js'
import SkuCard from '../components/SkuCard.jsx'

const USE_CASE_FILTERS = ['gaming', 'programming', 'study', 'content_creation', 'business']
const RAM_OPTIONS = [null, 8, 16, 32]
const BRAND_FILTERS = ['lenovo', 'dell', 'hp', 'asus', 'acer']
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

  const retry = () => setAttempt((v) => v + 1)

  const toggleBrand = (slug) => {
    setPage(1)
    setBrands((prev) => {
      const next = new Set(prev)
      next.has(slug) ? next.delete(slug) : next.add(slug)
      return next
    })
  }

  const toggleUseCase = (key) => {
    setPage(1)
    setUseCases((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const clearAll = () => {
    setInput('')
    setQuery('')
    setMinRam(null)
    setBrands(new Set())
    setUseCases(new Set())
    setMaxPrice(MAX_PRICE)
    setPage(1)
  }

  const matchesClientFilters = (sku) => {
    if (brands.size > 0) {
      const brandName = sku.variant?.family?.brand?.slug?.toLowerCase()
      if (!brandName || ![...brands].some((b) => b.toLowerCase() === brandName)) return false
    }
    if (useCases.size > 0) {
      const useCase = (sku.use_case ?? '').toLowerCase()
      if (!useCase || ![...useCases].some((u) => u.toLowerCase() === useCase)) return false
    }
    if (maxPrice < MAX_PRICE) {
      const price = sku.price_egp ?? 0
      if (price > maxPrice) return false
    }
    return true
  }

  const submitSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setQuery(input.trim())
  }

  const changeRam = (value) => {
    setPage(1)
    setMinRam(value)
  }

  useEffect(() => {
    setPage(1)
  }, [query, minRam, [...brands].join(','), maxPrice, [...useCases].join(','), state.rows.length])

  const { status, rows, lastPage, total } = state
  const clientFilteringActive = brands.size > 0 || useCases.size > 0 || maxPrice < MAX_PRICE
  const filteredRows = clientFilteringActive ? rows.filter(matchesClientFilters) : rows
  const displayRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const displayTotal = clientFilteringActive ? filteredRows.length : total
  const displayLastPage = clientFilteringActive
    ? Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
    : lastPage
  const hasFilters =
    Boolean(query) ||
    minRam !== null ||
    brands.size > 0 ||
    useCases.size > 0 ||
    maxPrice < MAX_PRICE
  const activeFilterCount =
    brands.size +
    useCases.size +
    (minRam !== null ? 1 : 0) +
    (query ? 1 : 0) +
    (maxPrice < MAX_PRICE ? 1 : 0)

  return (
    <div className="mx-auto max-w-[1344px] px-4 py-14 sm:px-6 lg:py-20">
      <header className="max-w-[62ch]">
        <h1 className="text-3xl leading-tight text-graphite-50 sm:text-4xl">
          {copy.catalog.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-graphite-300">
          {copy.catalog.lead}
        </p>
      </header>

      {/* --- Controls + Search --- */}
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
              onChange={(e) => setInput(e.target.value)}
              placeholder={copy.catalog.search}
              autoComplete="off"
              className="w-full rounded-[var(--radius-surface)] border hairline bg-graphite-900 px-3 py-2.5 text-sm text-graphite-100 placeholder:text-graphite-500"
            />
          </div>
          <button type="submit" className="rounded-[var(--radius-surface)] bg-graphite-700 px-4 py-2.5 text-sm font-medium text-graphite-50 transition-colors duration-200 hover:bg-graphite-600">
            {copy.catalog.searchCta}
          </button>
          {hasFilters ? (
            <button type="button" onClick={clearAll} className="rounded-[var(--radius-surface)] border hairline px-4 py-2.5 text-sm text-graphite-300 transition-colors duration-200 hover:border-graphite-500 hover:text-graphite-100">
              {copy.catalog.clear}
            </button>
          ) : null}
        </form>

        <fieldset className="flex flex-wrap items-center gap-2 hidden lg:flex">
          <legend className="mb-2 text-xs font-medium text-graphite-400">
            {copy.catalog.ramFilter}
          </legend>
          {RAM_OPTIONS.map((option) => {
            const active = minRam === option
            return (
              <li key={String(option)} className="shrink-0">
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => changeRam(option)}
                  className={`rounded-[var(--radius-sharp)] border px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                    active ? 'border-signal text-signal' : 'hairline text-graphite-300 hover:border-graphite-500 hover:text-graphite-100'
                  }`}
                >
                  {option === null ? copy.catalog.anyRam : `${option}+ GB`}
                </button>
              </li>
            )
          })}
        </fieldset>

        <div className="mt-6 flex items-center gap-3 lg:hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            aria-controls="catalog-sidebar"
            className="inline-flex items-center gap-2 rounded-[var(--radius-sharp)] border hairline px-4 py-2.5 text-sm font-medium text-graphite-100 transition-colors duration-200 hover:border-signal"
          >
            {copy.catalog.filters}
            {activeFilterCount > 0 ? (
              <span className="rounded-[var(--radius-sharp)] bg-signal px-1.5 py-0.5 text-xs font-semibold text-graphite-950">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      <p className="mt-2 text-sm text-graphite-400">
        <span className="tnum text-graphite-200">{displayTotal}</span>{' '}
        {hasFilters ? copy.catalog.countFiltered : copy.catalog.countAll}
        {clientFilteringActive && displayTotal !== total ? (
          <span className="ms-1 text-graphite-500">
            {copy.catalog.outOf} {total}
          </span>
        ) : null}
      </p>

      {/* --- Layout: desktop sidebar + grid | mobile grid only --- */}
      <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:gap-10">
        <aside
          id="catalog-sidebar"
          className="flex flex-col gap-8 rounded-[var(--radius-surface)] border hairline bg-graphite-900 p-6 lg:w-64 lg:shrink-0 lg:sticky lg:top-24"
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
                      active ? 'border-signal bg-[color-mix(in_srgb,var(--color-signal)_14%,transparent)]' : 'hairline hover:border-graphite-500'
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
                          <svg className="h-2.5 w-2.5 text-graphite-950" viewBox="0 0 12 12" aria-hidden="true">
                            <path d="M2 6.5l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : null}
                      </span>
                      <span className={`text-sm transition-colors duration-200 ${
                        active ? 'text-graphite-50' : 'text-graphite-300'
                      }`}>
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
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={MAX_PRICE}
                step={5000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Math.min(MAX_PRICE, Math.max(0, Number(e.target.value) || 0)))}
                className="h-1.5 w-full cursor-pointer accent-signal"
                aria-label={copy.catalog.priceRange}
              />
              <div className="flex items-center gap-2">
                <span className="ltr-token text-xs text-graphite-400">EGP 0</span>
                <span className="text-xs text-graphite-500">—</span>
                <span className="ltr-token text-xs font-medium text-graphite-100 tnum">
                  {new Intl.NumberFormat(localeKey === 'ar' ? 'ar-EG' : 'en-EG', {
                    style: 'currency',
                    currency: 'EGP',
                    maximumFractionDigits: 0,
                  }).format(maxPrice)}
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
                      active ? 'border-signal bg-[color-mix(in_srgb,var(--color-signal)_14%,transparent)]' : 'hairline hover:border-graphite-500'
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
                          <svg className="h-2.5 w-2.5 text-graphite-950" viewBox="0 0 12 12" aria-hidden="true">
                            <path d="M2 6.5l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : null}
                      </span>
                      <span className={`text-sm transition-colors duration-200 ${
                        active ? 'text-graphite-50' : 'text-graphite-300'
                      }`}>
                        {label}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {/* Body */}
          <div className="mt-6">
            {status === 'loading' && (
              <div className="text-sm text-graphite-500">{copy.states.loading}</div>
            )}
            {status === 'error' && (
              <div className="rounded-[var(--radius-surface)] border hairline bg-graphite-850 p-6">
                <h3 className="text-sm font-medium text-graphite-50">{copy.states.error}</h3>
                <p className="mt-2 text-sm text-graphite-400">{copy.catalog.error}</p>
                <button type="button" onClick={retry} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-signal transition-colors duration-200 hover:text-signal-strong">
                  {copy.catalog.retry}
                </button>
              </div>
            )}
            {status === 'ready' && displayRows.length === 0 && (
              <div className="rounded-[var(--radius-surface)] border hairline bg-graphite-850 p-12 text-center">
                <h3 className="text-sm font-medium text-graphite-50">{copy.states.empty}</h3>
                <p className="mt-2 text-sm text-graphite-400">{copy.catalog.noResults}</p>
                <button type="button" onClick={clearAll} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-signal transition-colors duration-200 hover:text-signal-strong">
                  {copy.catalog.clear}
                </button>
              </div>
            )}
            {status === 'ready' && displayRows.length > 0 && (
              <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {displayRows.map((sku) => (
                  <Reveal
                    as="li"
                    key={sku.manufacturer_part_number}
                    delay={Math.min(displayRows.indexOf(sku), 8) * 60}
                  >
                    <SkuCard sku={sku} copy={copy} localeKey={localeKey} navigate={navigate} compare={compare} />
                  </Reveal>
                ))}
              </ul>
            )}
          </div>

          {/* Pagination */}
          {status === 'ready' && displayLastPage > 1 && (
            <nav aria-label={copy.catalog.page} className="mt-12 flex items-center justify-between gap-4 border-t hairline pt-6">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((v) => Math.max(1, v - 1))}
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
                onClick={() => setPage((v) => Math.min(displayLastPage, v + 1))}
                className="rounded-[var(--radius-surface)] border hairline px-4 py-2 text-sm text-graphite-200 transition-colors duration-200 hover:border-graphite-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {copy.catalog.next}
              </button>
            </nav>
          )}
        </main>
      </div>

      {/* --- Mobile filters dialog --- */}
      {hasFiltersMobile && (
        <dialog id="catalog-sidebar" className="rounded-[var(--radius-surface)] border hairline bg-graphite-900 p-6 max-w-[90vw] shadow-lg" aria-label={copy.catalog.filters}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-graphite-50">{copy.catalog.filters}</h2>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              aria-label="Close filters"
              className="rounded-[var(--radius-sharp)] border hairline px-3 py-1 text-xs text-graphite-300 hover:bg-graphite-800"
            >
              {copy.catalog.clear ? 'Close' : 'Close'}
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-graphite-400 mb-2">
                {copy.catalog.brandFilter}
              </h3>
              <ul className="flex flex-col gap-2">
                {BRAND_FILTERS.map((slug) => {
                  const active = brands.has(slug)
                  const label = slug.charAt(0).toUpperCase() + slug.slice(1)
                  return (
                    <li key={slug}>
                      <label className={`flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-sharp)] border px-3 py-2 transition-colors duration-200 ${
                        active ? 'border-signal bg-[color-mix(in_srgb,var(--color-signal)_14%,transparent)]' : 'hairline hover:border-graphite-500'
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
                            <svg className="h-2.5 w-2.5 text-graphite-950" viewBox="0 0 12 12" aria-hidden="true">
                              <path d="M2 6.5l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : null}
                        </span>
                        <span className={`text-sm transition-colors duration-200 ${
                          active ? 'text-graphite-50' : 'text-graphite-300'
                        }`}>
                          {label}
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-graphite-400 mb-2">
                {copy.catalog.useCaseFilter}
              </h3>
              <ul className="flex flex-col gap-2">
                {USE_CASE_FILTERS.map((key) => {
                  const active = useCases.has(key)
                  const label = copy.catalog.useCaseLabels[key] ?? key
                  return (
                    <li key={key}>
                      <label className={`flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-sharp)] border px-3 py-2 transition-colors duration-200 ${
                        active ? 'border-signal bg-[color-mix(in_srgb,var(--color-signal)_14%,transparent)]' : 'hairline hover:border-graphite-500'
                      }`}>
                        <input type="checkbox" className="sr-only" checked={active} onChange={() => toggleUseCase(key)} aria-label={label} />
                        <span className={`h-3.5 w-3.5 shrink-0 rounded-sm border flex items-center justify-center transition-colors duration-200 ${
                          active ? 'border-signal bg-signal' : 'border-graphite-500'
                        }`}>
                          {active ? (
                            <svg className="h-2.5 w-2.5 text-graphite-950" viewBox="0 0 12 12" aria-hidden="true">
                              <path d="M2 6.5l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : null}
                        </span>
                        <span className={`text-sm transition-colors duration-200 ${
                          active ? 'text-graphite-50' : 'text-graphite-300'
                        }`}>
                          {label}
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-graphite-400 mb-2">
                {copy.catalog.priceFilter}
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={MAX_PRICE}
                  step={5000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Math.min(MAX_PRICE, Math.max(0, Number(e.target.value) || 0)))}
                  className="h-1.5 w-full cursor-pointer accent-signal"
                  aria-label={copy.catalog.priceRange}
                />
                <div className="flex items-center gap-2">
                  <span className="ltr-token text-xs text-graphite-400">EGP 0</span>
                  <span className="text-xs text-graphite-500">—</span>
                  <span className="ltr-token text-xs font-medium text-graphite-100 tnum">
                    {new Intl.NumberFormat(localeKey === 'ar' ? 'ar-EG' : 'en-EG', {
                      style: 'currency',
                      currency: 'EGP',
                      maximumFractionDigits: 0,
                    }).format(maxPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button type="button" onClick={clearAll} className="flex-1 rounded-[var(--radius-sharp)] border hairline py-2 text-sm text-graphite-400 hover:text-graphite-100">
              {copy.catalog.clear}
            </button>
            <button type="button" onClick={() => setFiltersOpen(false)} className="flex-1 rounded-[var(--radius-sharp)] bg-graphite-700 py-2 text-sm font-medium text-graphite-100 transition-colors duration-200 hover:bg-graphite-600">
              Done
            </button>
          </div>
        </dialog>
      )}
    </div>
  )
}

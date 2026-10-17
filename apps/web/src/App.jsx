import { useEffect, useState } from 'react'
import UpgradeCalculator from './components/UpgradeCalculator.jsx'
import { LOCALES } from './i18n.js'

function App() {
  const [laptops, setLaptops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [locale, setLocale] = useState('ar')
  const text = LOCALES[locale]

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = text.dir
  }, [locale, text.dir])

  useEffect(() => {
    const abort = new AbortController()
    fetch('/api/v1/laptops', { signal: abort.signal })
      .then((response) => { if (!response.ok) throw new Error('Catalog unavailable'); return response.json() })
      .then((json) => setLaptops(json.data ?? []))
      .catch((failure) => { if (failure.name !== 'AbortError') setError(true) })
      .finally(() => { if (!abort.signal.aborted) setLoading(false) })
    return () => abort.abort()
  }, [])

  return (
    <main className="min-h-screen px-4 py-6 sm:px-8" lang={locale} dir={text.dir}>
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-[#173c68]">UpgradeAtlas</h1>
          <div className="flex gap-4">
            <button type="button" lang="en" aria-pressed={locale === 'en'} onClick={() => setLocale('en')}>English</button>
            <button type="button" lang="ar" aria-pressed={locale === 'ar'} onClick={() => setLocale('ar')}>العربية</button>
          </div>
        </header>
        <UpgradeCalculator localeKey={locale} />
        <section aria-labelledby="catalog-title">
          <h2 id="catalog-title" className="text-xl font-bold">{text.catalog}</h2>
          <p className="my-3 max-w-2xl">{text.demo}</p>
          {loading && <p role="status">{text.loading}</p>}
          {error && <p role="alert">{text.catalogError}</p>}
          {!loading && !error && laptops.length === 0 && <p>{text.empty}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            {laptops.map((sku) => <article key={sku.id} className="rounded-lg border border-slate-300 bg-white p-4">
              <h3 className="font-semibold"><bdi>{sku.display_name}</bdi></h3>
              <p className="my-2"><bdi dir="ltr">{sku.manufacturer_part_number}</bdi></p>
              <dl className="space-y-2">
                <div className="flex justify-between gap-4"><dt>{text.ram}</dt><dd>{sku.base_ram_gb == null ? text.unknown : `${sku.base_ram_gb} ${text.unit}`}</dd></div>
                <div className="flex justify-between gap-4"><dt>{text.storage}</dt><dd>{sku.base_storage_gb == null ? text.unknown : `${sku.base_storage_gb} ${text.unit}`}</dd></div>
              </dl>
            </article>)}
          </div>
        </section>
      </div>
    </main>
  )
}

export default App

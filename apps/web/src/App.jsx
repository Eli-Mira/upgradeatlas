import { useEffect, useState } from 'react'

function App() {
  const [laptops, setLaptops] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/v1/laptops')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((json) => setLaptops(json.data ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            UpgradeAtlas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Exact-SKU laptop catalog — demo data only
          </p>
        </header>

        {loading && <p className="text-gray-500">Loading…</p>}
        {error && (
          <p className="rounded-md bg-red-50 p-3 text-red-700 dark:bg-red-900/30 dark:text-red-300">
            Failed to load catalog: {error}
          </p>
        )}
        {!loading && !error && laptops.length === 0 && (
          <p className="text-gray-500">No laptops found.</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {laptops.map((sku) => (
            <article
              key={sku.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {sku.display_name}
              </h2>
              <p className="mt-1 font-mono text-xs text-gray-500 dark:text-gray-400">
                {sku.manufacturer_part_number}
              </p>
              <dl className="mt-3 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex justify-between">
                  <dt>RAM</dt>
                  <dd>{sku.base_ram_gb ?? '—'} GB</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Storage</dt>
                  <dd>{sku.base_storage_gb ?? '—'} GB</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Status</dt>
                  <dd className="rounded bg-gray-100 px-2 py-0.5 text-xs uppercase dark:bg-gray-700">
                    {sku.status}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App

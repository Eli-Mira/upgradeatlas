// Single place that talks to the Laravel API. Nothing else calls fetch directly.

const BASE = '/api/v1'

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(path, { signal } = {}) {
  const response = await fetch(`${BASE}${path}`, {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) {
    throw new ApiError(`Request failed: ${path}`, response.status)
  }
  return response.json()
}

/** Laravel paginator -> { rows, total, currentPage, lastPage }. */
export async function fetchLaptops({ q, page = 1, perPage = 24, minRamGb, brand, useCase, maxPrice, signal } = {}) {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  if (q) params.set('q', q)
  if (minRamGb) params.set('min_ram_gb', String(minRamGb))
  if (brand) params.set('brand', brand)
  if (useCase) params.set('use_case', useCase)
  if (maxPrice) params.set('max_price', String(maxPrice))
  const payload = await request(`/laptops?${params.toString()}`, { signal })
  return {
    rows: payload.data ?? [],
    total: payload.total ?? 0,
    currentPage: payload.current_page ?? 1,
    lastPage: payload.last_page ?? 1,
  }
}

export async function fetchLaptop(partNumber, { signal } = {}) {
  return request(`/laptops/${encodeURIComponent(partNumber)}`, { signal })
}

export async function fetchUpgrades(partNumber, { signal } = {}) {
  return request(`/laptops/${encodeURIComponent(partNumber)}/upgrades`, { signal })
}

/**
 * Cost comparison. The server owns the arithmetic; the client only sends
 * validated decimal strings and renders the returned decimal strings.
 */
export async function postUpgradeOrReplace(body, { signal } = {}) {
  const response = await fetch(`${BASE}/upgrade-or-replace`, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new ApiError('Cost calculation failed', response.status)
  }
  return response.json()
}

export { ApiError }

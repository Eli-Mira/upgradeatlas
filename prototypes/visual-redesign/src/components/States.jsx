/* Shared loading / error / empty states for Catalog. Prototype only. */
export function LoadingRows({ label = 'Loading…' }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-live="polite">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="rounded-[var(--radius-surface)] border hairline bg-graphite-900 p-5 animate-pulse">
          <div className="h-4 w-3/4 bg-graphite-800 rounded-[var(--radius-sharp)] mb-3" />
          <div className="h-3 w-1/2 bg-graphite-800 rounded-[var(--radius-sharp)] mb-2" />
          <div className="h-3 w-1/3 bg-graphite-800 rounded-[var(--radius-sharp)] mb-2" />
          <div className="h-3 w-1/4 bg-graphite-800 rounded-[var(--radius-sharp)]" />
        </div>
      ))}
    </div>
  )
}

export function ErrorState({ title = 'Error', body, onRetry, retryLabel = 'Retry' }) {
  return (
    <div className="rounded-[var(--radius-surface)] border hairline bg-graphite-850 p-6" role="alert">
      <h3 className="text-sm font-medium text-graphite-50">{title}</h3>
      <p className="mt-2 text-sm text-graphite-400">{body}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-signal transition-colors duration-200 hover:text-signal-strong">
          {retryLabel}
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title = 'Nothing here', body }) {
  return (
    <div className="rounded-[var(--radius-surface)] border hairline bg-graphite-850 p-12 text-center" role="status">
      <h3 className="text-sm font-medium text-graphite-50">{title}</h3>
      <p className="mt-2 text-sm text-graphite-400">{body}</p>
    </div>
  )
}
/**
 * Shared loading / empty / error states.
 *
 * Each one names the cause and the next action. A bare spinner or "No data"
 * tells the reader nothing, which is why they are not used here.
 */

export function LoadingRows({ label, rows = 3 }) {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <p className="sr-only">{label}</p>
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="h-24 rounded-[var(--radius-surface)] border hairline bg-graphite-900"
        />
      ))}
    </div>
  )
}

export function EmptyState({ title, body, action }) {
  return (
    <div className="rounded-[var(--radius-surface)] border border-dashed hairline px-6 py-12 text-center">
      <p className="text-base font-medium text-graphite-100">{title}</p>
      {body ? <p className="mx-auto mt-2 max-w-prose text-sm text-graphite-300">{body}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function ErrorState({ title, body, onRetry, retryLabel }) {
  return (
    <div
      role="alert"
      className="rounded-[var(--radius-surface)] border border-[color-mix(in_srgb,var(--color-stop)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-stop)_8%,transparent)] px-6 py-8"
    >
      <p className="text-base font-medium text-graphite-50">{title}</p>
      {body ? <p className="mt-2 max-w-prose text-sm text-graphite-200">{body}</p> : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-[var(--radius-surface)] border hairline px-4 py-2 text-sm font-medium text-graphite-100 transition-colors duration-200 hover:border-graphite-500 hover:bg-graphite-800"
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  )
}

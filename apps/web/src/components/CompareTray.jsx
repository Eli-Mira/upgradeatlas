import { Link } from '../lib/router.jsx'

/**
 * The comparison tray. Appears only once something is selected, and states the
 * four-model cap before the user hits it rather than after.
 */
export default function CompareTray({ compare, copy, navigate }) {
  const { items, max } = compare
  if (items.length === 0) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t hairline bg-[color-mix(in_srgb,var(--color-graphite-900)_94%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
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
  )
}

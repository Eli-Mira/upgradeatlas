/* Navigation — one line at every breakpoint above 640px.
   Reuses the same brand/copy shape as production; prototype-only hooks. */
import { Link } from '../lib/router.jsx'

export default function Nav({ path, navigate, copy, localeKey, onLocaleChange }) {
  const items = [
    { to: '/', key: 'home' },
    { to: '/laptops', key: 'catalog' },
    { to: '/calculator', key: 'calc' },
  ]
  const active = path === '/' ? 'home' : (path.split('/').filter(Boolean)[0] ?? 'home')

  return (
    <header className="sticky top-0 z-40 border-b hairline bg-[color-mix(in_srgb,var(--color-graphite-950)_82%,transparent)]">
      <nav aria-label={copy.title} className="mx-auto flex h-16 max-w-[1344px] items-center gap-3 px-4 sm:px-6">
        <Link to="/" navigate={navigate} aria-current={active === 'home' ? 'page' : undefined} className="shrink-0 text-[15px] font-semibold tracking-tight text-graphite-50">
          {copy.brand}
        </Link>

        <ul className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => (
            <li key={item.key} className="shrink-0">
              <Link
                to={item.to}
                navigate={navigate}
                aria-current={active === item.key ? 'page' : undefined}
                className={`block whitespace-nowrap rounded-[var(--radius-sharp)] px-3 py-2 text-sm transition-colors duration-200 ${
                  active === item.key ? 'text-signal' : 'text-graphite-300 hover:text-graphite-100'
                }`}
              >
                {copy.nav[item.key]}
              </Link>
            </li>
          ))}
        </ul>

        <div role="group" aria-label={copy.langLabel} className="hidden md:flex shrink-0 rounded-[var(--radius-sharp)] border hairline p-0.5">
          {[
            { key: 'ar', label: 'ع' },
            { key: 'en', label: 'EN' },
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              lang={option.key}
              aria-pressed={localeKey === option.key}
              onClick={() => onLocaleChange(option.key)}
              className={`rounded-[var(--radius-sharp)] px-2 py-1 text-xs font-medium transition-colors duration-200 ${
                localeKey === option.key ? 'bg-graphite-700 text-graphite-50' : 'text-graphite-400 hover:text-graphite-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </nav>
    </header>
  )
}

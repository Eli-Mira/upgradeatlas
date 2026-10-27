import { Link } from '../lib/router.jsx'

/**
 * Navigation. One line at every breakpoint above 640px, 64px tall, and it is
 * the only element on the page that gets a backdrop blur.
 */
export default function Nav({ path, navigate, copy, localeKey, onLocaleChange }) {
  const items = [
    { to: '/', label: copy.nav.home, key: 'home' },
    { to: '/laptops', label: copy.nav.catalog, key: 'laptops' },
    { to: '/compare', label: copy.nav.compare, key: 'compare' },
    { to: '/upgrade', label: copy.nav.upgrade, key: 'upgrade' },
    { to: '/upgrade-or-replace', label: copy.nav.calc, key: 'upgrade-or-replace' },
  ]

  const active = path === '/' ? 'home' : path.split('/').filter(Boolean)[0]

  return (
    <header className="sticky top-0 z-40 border-b hairline bg-[color-mix(in_srgb,var(--color-graphite-950)_82%,transparent)] backdrop-blur-xl">
      <nav aria-label={copy.brand} className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 sm:px-6">
        <Link
          to="/"
          navigate={navigate}
          className="shrink-0 text-[15px] font-semibold tracking-tight text-graphite-50"
        >
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
                  active === item.key
                    ? 'text-signal'
                    : 'text-graphite-300 hover:text-graphite-100'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div
          role="group"
          aria-label={copy.langLabel}
          className="flex shrink-0 items-center rounded-[var(--radius-sharp)] border hairline p-0.5"
        >
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
              className={`rounded-[var(--radius-sharp)] px-2.5 py-1 text-xs font-medium transition-colors duration-200 ${
                localeKey === option.key
                  ? 'bg-graphite-700 text-graphite-50'
                  : 'text-graphite-400 hover:text-graphite-200'
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

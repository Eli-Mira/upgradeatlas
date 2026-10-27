import { Link } from '../lib/router.jsx'

/**
 * Footer. One link group plus the honesty line, not the four-column template.
 * The honesty line is the point: it states the product's limits in the place
 * people look when they want to know who is behind a claim.
 */
export default function Footer({ navigate, copy }) {
  const links = [
    { to: '/laptops', label: copy.nav.catalog },
    { to: '/upgrade', label: copy.nav.upgrade },
    { to: '/compare', label: copy.nav.compare },
    { to: '/upgrade-or-replace', label: copy.nav.calc },
  ]

  return (
    <footer className="mt-32 border-t hairline">
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <p className="text-[15px] font-semibold text-graphite-50">{copy.brand}</p>
            <p className="mt-2 text-sm text-graphite-300">{copy.tagline}</p>
            <p className="mt-4 max-w-prose text-sm leading-relaxed text-graphite-400">
              {copy.home.limitsTitle}: {copy.home.limits[0]} {copy.home.limits[2]}
            </p>
          </div>

          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            {links.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  navigate={navigate}
                  className="text-sm text-graphite-300 transition-colors duration-200 hover:text-signal"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}

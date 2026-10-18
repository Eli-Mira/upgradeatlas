/* Homepage — integrated hardware stage. Prototype only.
   No boxed HUD, no LIVE/REC, no stat bar. Product and text coexist. */
import { lazy, Suspense } from 'react'
import { Link } from '../lib/router.jsx'

const StudioLaptop = lazy(() => import('../../motion/StudioLaptop.jsx'))

const heroDesktop = new URL('../../assets/hero-desktop.webp', import.meta.url).href
const heroMobile = new URL('../../assets/hero-mobile.webp', import.meta.url).href

export default function Home({ copy, navigate, localeKey }) {
  const home = copy.home
  const ar = localeKey === 'ar'

  return (
    <>
      {/* --- Hero: integrated studio stage, text left, product right --- */}
      <section className="relative mx-auto max-w-[1344px] px-4 pt-12 sm:px-6 lg:pt-16">
        <div className="grid items-center gap-6 lg:grid-cols-12 lg:gap-0">
          <div className="lg:col-span-5 lg:pl-12">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-graphite-400">
              {home.eyebrow}
            </p>
            <h1 className="mt-5 text-[clamp(2.4rem,5.6vw,5.9rem)] leading-[0.96] text-graphite-50">
              {home.heroHeadline}
            </h1>
            <p className="mt-5 max-w-[44ch] text-base leading-relaxed text-graphite-300">
              {home.heroSub}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/laptops"
                navigate={navigate}
                className="rounded-[var(--radius-surface)] bg-signal px-5 py-3 text-sm font-semibold text-graphite-950 transition-colors duration-200 hover:bg-signal-strong"
              >
                {home.ctaExplore}
              </Link>
              <Link
                to="/calculator"
                navigate={navigate}
                className="rounded-[var(--radius-surface)] border hairline px-5 py-3 text-sm font-medium text-graphite-100 transition-colors duration-200 hover:border-signal hover:bg-graphite-900"
              >
                {home.ctaCompare}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Suspense fallback={<div className="h-[460px] w-full rounded-[var(--radius-surface)] bg-graphite-900" />}>
              <StudioLaptop locale={localeKey} />
            </Suspense>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-graphite-500">
          <span className="rounded-[var(--radius-sharp)] border hairline px-2.5 py-1">{home.ribbons.prototype}</span>
          <span className="rounded-[var(--radius-sharp)] border hairline px-2.5 py-1">{home.ribbons.concept}</span>
        </div>
      </section>

      {/* --- Split editorial: keep a good laptop useful --- */}
      <section className="border-t hairline">
        <div className="mx-auto max-w-[1344px] px-4 py-16 sm:px-6 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h2 className="text-[clamp(1.7rem,3.4vw,2.6rem)] leading-[1.05] text-graphite-50">
                {home.splitTitle}
              </h2>
            </div>
            <div className="lg:col-span-7">
              <p className="max-w-[58ch] text-base leading-relaxed text-graphite-300">
                {home.splitLead}
              </p>
              <Link
                to="/calculator"
                navigate={navigate}
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-signal transition-colors duration-200 hover:text-signal-strong"
              >
                {home.splitCta}
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- Demo data notice --- */}
      <section className="border-t hairline">
        <div className="mx-auto max-w-[1344px] px-4 py-10 sm:px-6">
          <p className="text-sm text-graphite-400">
            {copy.catalog.illustrative}
          </p>
        </div>
      </section>
    </>
  )
}
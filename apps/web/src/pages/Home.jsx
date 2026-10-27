import { lazy, Suspense } from 'react'
import Reveal from '../components/Reveal.jsx'
import { Link } from '../lib/router.jsx'

// Three.js is a large dependency and it is decorative. It loads after the
// first paint, and the section reads completely without it.
const Hero3D = lazy(() => import('../components/Hero3D.jsx'))

export default function Home({ copy, navigate }) {
  const home = copy.home

  return (
    <>
      {/* --- Hero: asymmetric split, text left, viewfinder-framed 3D right - */}
      <section className="relative mx-auto max-w-[1400px] px-4 pt-16 pb-20 sm:px-6 lg:pt-24 lg:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-signal">
              {home.eyebrow}
            </p>
            <h1 className="mt-6 text-4xl leading-[1.05] text-graphite-50 sm:text-5xl lg:text-[3.6rem]">
              {home.h1a}
              <br />
              {home.h1b}
            </h1>
            <p className="mt-6 max-w-[46ch] text-base leading-relaxed text-graphite-300">
              {home.lead}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                to="/laptops"
                navigate={navigate}
                className="rounded-[var(--radius-surface)] bg-signal px-5 py-3 text-sm font-semibold text-graphite-950 transition-colors duration-200 hover:bg-signal-strong"
              >
                {home.ctaPrimary}
              </Link>
              <Link
                to="/upgrade"
                navigate={navigate}
                className="rounded-[var(--radius-surface)] border hairline px-5 py-3 text-sm font-medium text-graphite-100 transition-colors duration-200 hover:border-graphite-500 hover:bg-graphite-900"
              >
                {home.ctaSecondary}
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-[var(--radius-surface)] border border-graphite-700 bg-graphite-900/40 p-3 backdrop-blur">
              <div className="relative">
                <div className="h-[300px] sm:h-[400px] lg:h-[520px]">
                  <Suspense fallback={null}>
                    <Hero3D />
                  </Suspense>
                </div>
                <span className="pointer-events-none absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-signal" />
                <span className="pointer-events-none absolute right-3 top-3 h-5 w-5 border-r-2 border-t-2 border-signal" />
                <span className="pointer-events-none absolute bottom-3 left-3 h-5 w-5 border-l-2 border-b-2 border-signal" />
                <span className="pointer-events-none absolute right-3 bottom-3 h-5 w-5 border-r-2 border-b-2 border-signal" />
                <div className="absolute left-0 top-0 flex w-full items-center justify-between px-4 pt-3 text-[10px] font-mono uppercase tracking-widest text-graphite-500">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-positive" />
                    REC
                  </span>
                  <span>LIVE · 3D</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-px border-t border-graphite-700 sm:grid-cols-4">
          {home.stats.map((stat) => (
            <div key={stat.label} className="bg-graphite-950 px-6 py-6">
              <p className="text-2xl font-semibold text-graphite-50">{stat.value}</p>
              <p className="mt-1 text-sm text-graphite-400">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-graphite-500">
              Scroll
            </span>
            <div className="h-10 w-px bg-gradient-to-b from-graphite-500 to-transparent" />
          </div>
        </div>
      </section>

      {/* --- Verification: heading above a hairline-separated list --------- */}
      <section className="border-t hairline">
        <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:py-24">
          <Reveal>
            <h2 className="max-w-[22ch] text-2xl leading-tight text-graphite-50 sm:text-3xl">
              {home.proofTitle}
            </h2>
            <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-graphite-300">
              {home.proofLead}
            </p>
          </Reveal>

          <dl className="mt-14">
            {home.proofItems.map((item, index) => (
              <Reveal key={item.title} delay={index * 90}>
                <div className="grid gap-3 border-t hairline py-7 md:grid-cols-12 md:gap-8">
                  <dt className="text-[15px] font-semibold text-graphite-50 md:col-span-4">
                    {item.title}
                  </dt>
                  <dd className="max-w-[62ch] text-sm leading-relaxed text-graphite-300 md:col-span-7 md:col-start-6">
                    {item.body}
                  </dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* --- Two entry points: deliberately unequal widths ---------------- */}
      <section className="border-t hairline">
        <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:py-24">
          <Reveal>
            <h2 className="text-2xl leading-tight text-graphite-50 sm:text-3xl">
              {home.splitTitle}
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-6 lg:grid-cols-12">
            <Reveal className="lg:col-span-7">
              <div className="flex h-full flex-col justify-between rounded-[var(--radius-surface)] border hairline bg-graphite-900 p-7">
                <div>
                  <h3 className="text-lg font-semibold text-graphite-50">{home.buyerTitle}</h3>
                  <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-graphite-300">
                    {home.buyerBody}
                  </p>
                </div>
                <Link
                  to="/laptops"
                  navigate={navigate}
                  className="mt-8 self-start text-sm font-medium text-signal transition-colors duration-200 hover:text-signal-strong"
                >
                  {home.buyerCta}
                </Link>
              </div>
            </Reveal>

            <Reveal className="lg:col-span-5" delay={90}>
              <div className="flex h-full flex-col justify-between rounded-[var(--radius-surface)] border hairline bg-graphite-850 p-7">
                <div>
                  <h3 className="text-lg font-semibold text-graphite-50">{home.ownerTitle}</h3>
                  <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-graphite-300">
                    {home.ownerBody}
                  </p>
                </div>
                <Link
                  to="/upgrade"
                  navigate={navigate}
                  className="mt-8 self-start text-sm font-medium text-signal transition-colors duration-200 hover:text-signal-strong"
                >
                  {home.ownerCta}
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* --- Limits: what the product refuses to do ----------------------- */}
      <section className="border-t hairline">
        <div className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6 lg:py-24">
          <Reveal>
            <h2 className="text-2xl leading-tight text-graphite-50 sm:text-3xl">
              {home.limitsTitle}
            </h2>
            <ul className="mt-8 max-w-[70ch] space-y-4">
              {home.limits.map((limit) => (
                <li
                  key={limit}
                  className="border-s-2 border-graphite-600 ps-4 text-sm leading-relaxed text-graphite-300"
                >
                  {limit}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </>
  )
}

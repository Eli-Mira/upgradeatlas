import { useEffect, useState } from 'react'
import Nav from './components/Nav.jsx'
import Footer from './components/Footer.jsx'
import CompareTray from './components/CompareTray.jsx'
import SmoothScroll from './components/SmoothScroll.jsx'
import UpgradeCalculator from './components/UpgradeCalculator.jsx'
import Home from './pages/Home.jsx'
import Catalog from './pages/Catalog.jsx'
import SkuDetail from './pages/SkuDetail.jsx'
import Compare from './pages/Compare.jsx'
import Upgrade from './pages/Upgrade.jsx'
import { matchRoute, useRoute } from './lib/router.jsx'
import { useCompare } from './lib/compare-store.js'
import { LOCALES } from './i18n.js'
import { siteCopyFor } from './lib/site-copy.js'

export default function App() {
  const { path, navigate } = useRoute()
  const compare = useCompare()
  const [locale, setLocale] = useState('ar')

  const text = LOCALES[locale]
  const copy = siteCopyFor(locale)

  // Document language and direction follow the selected locale.
  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = text.dir
  }, [locale, text.dir])

  // A new route starts at the top of the page.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [path])

  const route = matchRoute(path)

  let page
  switch (route.name) {
    case 'laptops':
      page = route.param ? (
        <SkuDetail
          partNumber={route.param}
          copy={copy}
          localeKey={locale}
          navigate={navigate}
          compare={compare}
        />
      ) : (
        <Catalog copy={copy} localeKey={locale} navigate={navigate} compare={compare} />
      )
      break
    case 'compare':
      page = <Compare copy={copy} localeKey={locale} navigate={navigate} compare={compare} />
      break
    case 'upgrade':
      page = <Upgrade partNumber={route.param} copy={copy} navigate={navigate} />
      break
    case 'upgrade-or-replace':
      page = (
        <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:py-20">
          <header className="max-w-[62ch]">
            <h1 className="text-3xl leading-tight text-graphite-50 sm:text-4xl">
              {copy.calc.pageTitle}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-graphite-300">{copy.calc.pageLead}</p>
          </header>
          <div className="mt-10">
            <UpgradeCalculator localeKey={locale} />
          </div>
        </div>
      )
      break
    default:
      page = <Home copy={copy} navigate={navigate} />
  }

  return (
    <div dir={text.dir} lang={locale} className="min-h-[100dvh] bg-graphite-950">
      <SmoothScroll />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-[var(--radius-surface)] focus:bg-graphite-800 focus:px-4 focus:py-2 focus:text-sm focus:text-graphite-50"
      >
        {copy.skip}
      </a>

      <Nav path={path} navigate={navigate} copy={copy} localeKey={locale} onLocaleChange={setLocale} />

      <main id="main" className="pb-24">
        {page}
      </main>

      <Footer navigate={navigate} copy={copy} />
      <CompareTray compare={compare} copy={copy} navigate={navigate} />
    </div>
  )
}


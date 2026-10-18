/* App shell — shared navigation, locale toggle, skip link, footer.
   Routes: /, /laptops, /calculator. Prototype-only; no production integration. */
import { useEffect, useState } from 'react'
import Nav from './components/Nav.jsx'
import Footer from './components/Footer.jsx'
import CompareTray from './components/CompareTray.jsx'
import Home from './pages/Home.jsx'
import Catalog from './pages/Catalog.jsx'
import Calculator from './pages/Calculator.jsx'
import { matchRoute, useRoute } from './lib/router.jsx'
import { useCompare } from './lib/compare-store.js'
import { LOCALES } from './lib/i18n.js'

export default function App() {
  const { path, navigate } = useRoute()
  const compare = useCompare()
  const [locale, setLocale] = useState('ar')
  const text = LOCALES[locale]

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = text.dir
  }, [locale, text.dir])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [path])

  const route = matchRoute(path)

  let page
  switch (route.name) {
    case 'laptops':
      page = <Catalog localeKey={locale} navigate={navigate} compare={compare} />
      break
    case 'calculator':
      page = <Calculator localeKey={locale} />
      break
    default:
      page = <Home localeKey={locale} navigate={navigate} />
  }

  return (
    <div dir={text.dir} lang={locale} className="min-h-[100dvh] bg-graphite-950">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-[var(--radius-surface)] focus:bg-graphite-800 focus:px-4 focus:py-2 focus:text-sm focus:text-graphite-50"
      >
        {text.skip}
      </a>

      <Nav
        path={path}
        navigate={navigate}
        copy={text}
        localeKey={locale}
        onLocaleChange={setLocale}
      />

      <main id="main" className="pb-24">
        {page}
      </main>

      <Footer navigate={navigate} copy={text} />
      <CompareTray compare={compare} copy={text} navigate={navigate} localeKey={locale} />
    </div>
  )
}
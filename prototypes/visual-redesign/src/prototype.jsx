import {useRef} from 'react'
import {createRoot} from 'react-dom/client'
import Home from './prototype-home.jsx'
import Catalog from './prototype-catalog.jsx'
import Calculator from './prototype-calculator.jsx'
import {word,link} from './prototype-data.js'
import './prototype.css'

import {Arrow,Dialog} from './prototype-ui.jsx'

function App() {
  const lang = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'ar'
  const t = (en,ar) => word(lang,en,ar)
  const path = location.pathname
  const menu = useRef(null)
  const pages = [['/',t('Overview','الرئيسية')],['/laptops',t('Laptop finder','اختَر لابتوبك')],['/calculator',t('Upgrade or replace','ترقية أم لابتوب جديد؟')]]
  const switchUrl = new URL(location.href); switchUrl.searchParams.set('lang',lang === 'ar' ? 'en' : 'ar')
  document.documentElement.lang=lang; document.documentElement.dir=lang==='ar'?'rtl':'ltr'
  const pageTitle = pages.find(([route])=>route===path)?.[1] ?? pages[0][1]
  document.title=`${pageTitle} — UpgradeAtlas design study`
  return <>
    <a className="skip" href="#content">{t('Skip to content','تخطَّ إلى المحتوى')}</a>
    <header className="header wrap">
      <a className="brand" href={link('/',lang)} translate="no"><svg viewBox="0 0 30 30" width="30" height="30" aria-hidden="true"><path d="M3 24 11 5h6L9 24Zm12 0 5-12h6l-5 12Z" fill="currentColor"/></svg><span>Upgrade<span className="brand-light">Atlas</span></span></a>
      <nav className="desktop-nav" aria-label={t('Main navigation','التنقل الرئيسي')}>{pages.map(([route,label])=><a href={link(route,lang)} key={route} aria-current={path===route?'page':undefined}>{label}</a>)}</nav>
      <div className="header-tools"><a className="language" href={switchUrl.href} lang={lang==='ar'?'en':'ar'}>{t('العربية','English')}</a><button className="icon-button menu-button" aria-label={t('Open navigation','افتح القائمة')} onClick={()=>menu.current.showModal()}><svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true"><path d="M4 8h16M4 16h16" stroke="currentColor" strokeWidth="1.5"/></svg></button></div>
    </header>
    <div className="study-note wrap"><span className="study-mark"/><span>{t('Design study','دراسة تصميم')}</span><span className="study-detail">{t('Illustrative products & costs. No live offers.','منتجات وتكاليف توضيحية، وليست عروض بيع مباشرة.')}</span></div>
    <main id="content" tabIndex="-1">{path==='/laptops'?<Catalog lang={lang}/>:path==='/calculator'?<Calculator lang={lang}/>:<Home lang={lang}/>}</main>
    <footer className="footer wrap"><div><a href={link('/',lang)} className="footer-brand" translate="no">UpgradeAtlas</a><p>{t('A clearer way to choose, compare, and keep a laptop useful.','اختيار أوضح، مقارنة أدق، وعمر أطول للابتوبك.')}</p></div><div className="footer-links">{pages.slice(1).map(([route,label])=><a href={link(route,lang)} key={route}>{label}</a>)}</div><p className="footer-note">{t('Prototype only. Concept visuals are not exact-SKU photography.','نموذج تصميم فقط. الصور التوضيحية لا تمثّل موديلات محددة معروضة للبيع.')}</p></footer>
    <Dialog dialogRef={menu} title={t('Explore UpgradeAtlas','استكشف UpgradeAtlas')} lang={lang} id="menu-title"><nav className="mobile-nav">{pages.map(([route,label])=><a key={route} href={link(route,lang)}>{label}<Arrow/></a>)}</nav></Dialog>
  </>
}
createRoot(document.getElementById('root')).render(<App/> )

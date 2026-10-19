import { useEffect, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { Menu } from './components/icons';
import { HomePage } from './pages/home';
import { CatalogPage } from './pages/catalog';
import { NotFoundPage } from './pages/not-found';
import { useCopy, useLocale } from './data/locale';

const routes = [
  { path: '/', label: 'nav.home' },
  { path: '/laptops', label: 'nav.laptops' },
  { path: '/gaming', label: 'nav.gaming' },
  { path: '/compare', label: 'nav.compare' },
  { path: '/upgrade', label: 'nav.upgrade' },
] as const;

function LocaleSwitch() {
  const { locale, setLocale } = useLocale();
  const c = useCopy();

  const switchTo = (next: 'en' | 'ar') => {
    const url = new URL(window.location.href);
    url.searchParams.set('lang', next);
    window.history.replaceState({}, '', url);
    setLocale(next);
  };

  return (
    <button
      type="button"
      className="locale-switch"
      onClick={() => switchTo(locale === 'en' ? 'ar' : 'en')}
      aria-label={c.localeSwitchLabel}
      data-testid="button-locale"
    >
      {locale === 'en' ? 'EN' : 'ع'}
      <span className="locale-divider" aria-hidden="true" />
      {locale === 'en' ? 'ع' : 'EN'}
    </button>
  );
}

export default function App() {
  const c = useCopy();
  const { locale } = useLocale();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="atlas-page" lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <a className="sr-only" href="#main-content">
        {c.skipToMain}
      </a>

      <header className="atlas-header">
        <Link className="brand-lockup" to="/" aria-label="UpgradeAtlas home">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">
            Upgrade<span>Atlas</span>
          </span>
        </Link>

        <nav
          className="primary-nav"
          id="main-navigation"
          data-open={menuOpen ? 'true' : 'false'}
          aria-label={c.nav.ariaLabel}
        >
          {routes.map((route) => (
            <Link
              key={route.path}
              className="nav-link"
              to={route.path}
              aria-current={location.pathname === route.path ? 'page' : undefined}
              data-testid={`nav-${route.label.replace('nav.', '')}`}
            >
              {c[route.label]}
            </Link>
          ))}
        </nav>

        <div className="header-tools">
          <span className="header-rule" aria-hidden="true" />
          <LocaleSwitch />
          <span className="availability">
            <i aria-hidden="true" /> {c.availability}
          </span>
          <button
            type="button"
            className="mobile-menu-button"
            aria-label={menuOpen ? c.closeMenu : c.openMenu}
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            data-testid="button-mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Menu />
          </button>
        </div>
      </header>

      <div id="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/laptops" element={<CatalogPage />} />
          <Route path="/laptops/:slug" element={<CatalogPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>

      <footer className="site-footer">
        <span className="footer-brand">{c.footerBrand}</span>
        <span>{c.footerNote}</span>
        <Link className="text-link large-link" to="/laptops">
          {c.footerLink}
        </Link>
      </footer>
    </div>
  );
}

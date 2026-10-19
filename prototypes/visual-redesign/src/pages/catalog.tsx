import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeading } from '../components/page-heading';
import { LaptopCard } from '../components/laptop-card';
import { ArrowRight, RotateCcw, Search } from '../components/icons';
import { brandFilters, confidenceFilters, profiles } from '../data/profiles';
import { useCompare } from '../data/compare';
import { useCopy, useLocale } from '../data/locale';

export function CatalogPage() {
  const c = useCopy();
  const { locale } = useLocale();
  const [query, setQuery] = useState('');
  const [brand, setBrand] = useState('all');
  const [confidence, setConfidence] = useState('all');
  const { selected, toggle } = useCompare();

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return profiles.filter(
      (p) =>
        (!q ||
          `${p.name} ${p.partNumber} ${p.sku} ${p.processor} ${p.graphics} ${p.brandName}`
            .toLowerCase()
            .includes(q)) &&
        (brand === 'all' || p.brand === brand) &&
        (confidence === 'all' || p.confidence === confidence),
    );
  }, [query, brand, confidence]);

  const reset = () => {
    setQuery('');
    setBrand('all');
    setConfidence('all');
  };

  return (
    <main className="content-page">
      <PageHeading
        index={c.catalog.index}
        eyebrow={c.catalog.eyebrow}
        heading={c.catalog.heading}
        deck={c.catalog.deck}
      />

      <section className="catalog-tools">
        <label className="search-field">
          <Search />
          <span className="sr-only">{c.catalog.searchLabel}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={c.catalog.searchPlaceholder}
            data-testid="catalog-search"
          />
        </label>

        <label className="select-field">
          <span>{c.catalog.brand}</span>
          <select value={brand} onChange={(event) => setBrand(event.target.value)}>
            {brandFilters.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="select-field">
          <span>{c.catalog.confidence}</span>
          <select value={confidence} onChange={(event) => setConfidence(event.target.value)}>
            {confidenceFilters.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button type="button" className="reset-filter" onClick={reset}>
          <RotateCcw /> {c.catalog.reset}
        </button>
      </section>

      <div className="catalog-resultbar" role="status" aria-live="polite">
        <span>
          <strong>{String(rows.length).padStart(2, '0')}</strong> {c.catalog.profilesCount}
        </span>
        <span>{c.catalog.noPrices}</span>
      </div>

      {rows.length ? (
        <div className="catalog-grid">
          {rows.map((profile) => (
            <LaptopCard
              key={profile.slug}
              profile={profile}
              labels={{
                processor: c.catalog.processor,
                graphics: c.catalog.graphics,
                memory: c.catalog.memory,
                storage: c.catalog.storage,
              }}
              confidenceLabel={
                profile.confidence === 'exact' ? c.catalog.exact : c.catalog.family
              }
              readProfileLabel={c.catalog.readProfile}
              addedLabel={c.catalog.added}
              compareLabel={c.catalog.compare}
              selected={selected.includes(profile.slug)}
              lang={locale}
              onToggleCompare={toggle}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state" data-testid="catalog-empty">
          <h2>{c.catalog.noMatch}</h2>
          <p>{c.catalog.noMatchHint}</p>
          <button type="button" className="reset-filter" onClick={reset}>
            <RotateCcw /> {c.catalog.reset}
          </button>
        </div>
      )}

      <div className="catalog-disclaimer">
        <span className="section-label">{c.catalog.disclaimerLabel}</span>
        <p>{c.catalog.disclaimer}</p>
        <Link to="/compare" className="text-link">
          {c.catalog.disclaimerLink} <ArrowRight />
        </Link>
      </div>
    </main>
  );
}

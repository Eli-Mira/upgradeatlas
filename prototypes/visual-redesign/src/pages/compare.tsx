import { Link } from 'react-router-dom';
import { PageHeading } from '../components/page-heading';
import { ArrowUpRight } from '../components/icons';
import { displayValue, profiles } from '../data/profiles';
import { useCompare } from '../data/compare';
import { useCopy, useLocale } from '../data/locale';

export function ComparePage() {
  const c = useCopy();
  const { locale } = useLocale();
  const { selected, toggle, clear } = useCompare();
  const chosen = profiles.filter((p) => selected.includes(p.slug));

  const rows = [
    { label: c.compare.processor, get: (p: (typeof profiles)[number]) => p.processor },
    { label: c.compare.graphics, get: (p: (typeof profiles)[number]) => p.graphics },
    { label: c.compare.memory, get: (p: (typeof profiles)[number]) => displayValue(p.memory, locale) },
    { label: c.compare.storage, get: (p: (typeof profiles)[number]) => displayValue(p.storage, locale) },
    { label: c.compare.partNumber, get: (p: (typeof profiles)[number]) => p.partNumber },
    { label: c.compare.confidence, get: (p: (typeof profiles)[number]) => (p.confidence === 'exact' ? c.catalog.exact : c.catalog.family) },
  ];

  return (
    <main className="content-page">
      <PageHeading
        index={c.compare.index}
        eyebrow={c.compare.eyebrow}
        heading={c.compare.heading}
        deck={c.compare.deck}
      />

      <div className="compare-toolbar">
        <span>
          {String(chosen.length).padStart(2, '0')} {c.compare.profiles}
        </span>
        <span>{c.compare.limit}</span>
      </div>

      {chosen.length ? (
        <div className="comparison-wrap">
          <div className="comparison-grid">
            <div className="compare-label-column">
              <div className="compare-head-spacer" />
              {rows.map((row) => (
                <div className="compare-label" key={row.label}>
                  {row.label}
                </div>
              ))}
            </div>

            {chosen.map((profile) => (
              <div className="compare-product" key={profile.slug}>
                <div className="compare-product-head">
                  <span className={`confidence ${profile.confidence}`}>
                    <i aria-hidden="true" />
                    {profile.confidence === 'exact' ? c.catalog.exact : c.catalog.family}
                  </span>
                  <h2>{profile.name}</h2>
                  <span>{profile.partNumber}</span>
                  <button
                    type="button"
                    className="remove-profile"
                    aria-label={c.compare.remove}
                    onClick={() => toggle(profile.slug)}
                  >
                    ×
                  </button>
                </div>
                {rows.map((row) => (
                  <div className="compare-value" key={row.label}>
                    {row.get(profile)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="compare-empty">
          <h2>{c.compare.emptyTitle}</h2>
          <p>{c.compare.emptyBody}</p>
          <Link className="button-primary" to="/laptops" style={{ marginTop: '24px' }}>
            {c.compare.emptyCta} <ArrowUpRight />
          </Link>
        </div>
      )}

      {chosen.length > 0 && (
        <div className="calculator-footer">
          <span className="compare-disclaimer">
            <i className="precision-tick" />
            {c.compare.disclaimer}
          </span>
          <button type="button" className="quiet-button" onClick={clear}>
            {c.compare.clear}
          </button>
        </div>
      )}

      {chosen.length > 1 && (
        <div className="compare-caution caution-block" style={{ marginTop: '22px' }}>
          {c.compare.caution}
        </div>
      )}
    </main>
  );
}

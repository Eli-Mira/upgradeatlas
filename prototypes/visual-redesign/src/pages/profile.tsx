import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowUpRight, Check, Plus } from '../components/icons';
import { profiles } from '../data/profiles';
import { useCompare } from '../data/compare';
import { useCopy } from '../data/locale';

export function ProfilePage() {
  const { slug } = useParams();
  const c = useCopy();
  const { selected, toggle } = useCompare();
  const profile = profiles.find((p) => p.slug === slug);
  const [tab, setTab] = useState<'specs' | 'evidence'>('specs');

  const rows = useMemo(() => {
    if (!profile) return [];
    return [
      { label: c.profile.processor, value: profile.processor, known: true },
      { label: c.profile.graphics, value: profile.graphics, known: true },
      { label: c.profile.memory, value: profile.memory, known: profile.memory !== 'Configuration varies' },
      { label: c.profile.storage, value: profile.storage, known: profile.storage !== 'Not specified' },
      { label: c.profile.partNumber, value: profile.partNumber, known: true },
      { label: c.profile.sku, value: profile.sku, known: true },
    ];
  }, [profile, c]);

  if (!profile) {
    return (
      <main className="content-page">
        <section className="page-heading">
          <div className="page-heading-index">404</div>
          <p className="eyebrow">
            <i aria-hidden="true" />
            {c.profile.notFiled}
          </p>
          <h1 className="not-found">
            No research record
            <br />
            under this reference.
          </h1>
          <div className="not-found-actions">
            <Link className="button-primary" to="/laptops">
              {c.catalog.readProfile} <ArrowUpRight />
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const isSelected = selected.includes(profile.slug);

  return (
    <main className="content-page">
      <Link className="back-link" to="/laptops">
        ← {c.profile.backToLibrary}
      </Link>

      <div className="profile-layout">
        <section>
          <div className="profile-head">
            <h1>{profile.name}</h1>
            <p className="eyebrow">
              <i aria-hidden="true" />
              {profile.brandName} · {c.profile.index}
            </p>
          </div>
          <p className="profile-processor">{profile.processor}</p>

          <div className="feature-list" style={{ marginTop: '38px' }}>
            <div className="feature-row" style={{ gridTemplateColumns: '48px 1fr' }}>
              <span className="feature-num">{c.profile.sectionSpecs}</span>
              <span className="feature-name">{c.profile.specsLabel}</span>
            </div>
          </div>

          <dl className="spec-list">
            {rows.map((row) => (
              <div className="detail-row" key={row.label}>
                <dt className="source-label">{row.label}</dt>
                <dd className={row.known ? undefined : 'unknown-value'}>{row.value}</dd>
              </div>
            ))}
          </dl>

          <div className="profile-foot">
            <span>
              {c.profile.confidenceLabel}:{' '}
              {profile.confidence === 'exact' ? c.catalog.exact : c.catalog.family}
            </span>
            <span>{c.profile.footRight}</span>
          </div>
        </section>

        <aside className="evidence-column">
          <div className="evidence-card">
            <h2>{c.profile.evidenceTitle}</h2>
            <p className="caution-block">
              {profile.confidence === 'exact'
                ? c.profile.evidenceExact
                : c.profile.evidenceFamily}
            </p>
            <p className="quiet-card" style={{ marginTop: '18px' }}>
              {c.profile.noPrices}
            </p>
          </div>

          <div className="profile-actions">
            <button
              type="button"
              className={`compare-toggle profile-compare ${isSelected ? 'selected' : ''}`}
              aria-pressed={isSelected}
              onClick={() => toggle(profile.slug)}
            >
              {isSelected ? <Check /> : <Plus />}
              {isSelected ? c.catalog.added : c.catalog.compare}
            </button>
            <Link className="text-link" to="/compare">
              {c.profile.openComparison} <ArrowUpRight />
            </Link>
          </div>
        </aside>
      </div>

      <div className="decision-grid">
        <Link className="decision-panel" to="/compare">
          <span className="section-label">
            <i className="precision-tick" />
            {c.home.sections[3].cards[0].kicker}
          </span>
          <h2>{c.home.sections[3].cards[0].title}</h2>
          <p>{c.home.sections[3].cards[0].body}</p>
          <span className="decision-link">
            {c.home.sections[3].cards[0].cta} <ArrowUpRight />
          </span>
        </Link>
        <Link className="decision-panel" to="/upgrade">
          <span className="section-label">
            <i className="precision-tick" />
            {c.home.sections[3].cards[1].kicker}
          </span>
          <h2>{c.home.sections[3].cards[1].title}</h2>
          <p>{c.home.sections[3].cards[1].body}</p>
          <span className="decision-link">
            {c.home.sections[3].cards[1].cta} <ArrowUpRight />
          </span>
        </Link>
      </div>
    </main>
  );
}

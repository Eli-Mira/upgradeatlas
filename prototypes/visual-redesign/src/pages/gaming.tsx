import { Link } from 'react-router-dom';
import { PageHeading } from '../components/page-heading';
import { ArrowUpRight } from '../components/icons';
import { displayValue, profiles } from '../data/profiles';
import { useCopy, useLocale } from '../data/locale';

export function GamingPage() {
  const c = useCopy();
  const { locale } = useLocale();
  const noteFor = (graphics: string) =>
    (c.gaming.notes as Record<string, string>)[graphics] ?? c.gaming.genericNote;

  return (
    <main className="content-page">
      <PageHeading
        index={c.gaming.index}
        eyebrow={c.gaming.eyebrow}
        heading={c.gaming.heading}
        deck={c.gaming.deck}
      />

      <div className="gaming-context">
        <span>{c.gaming.contextLabel}</span>
        <p>{c.gaming.context}</p>
      </div>

      <div className="gaming-resultbar">
        <span>
          <strong>{String(profiles.length).padStart(2, '0')}</strong> {c.gaming.gpuCount}
        </span>
        <span>{c.gaming.gpuNote}</span>
      </div>

      <div className="gpu-reference-grid">
        {profiles.map((profile) => (
          <article className="gpu-reference" key={profile.slug}>
            <div className="gpu-reference-top">
              <span>
                {profile.brandName} · {profile.partNumber}
              </span>
              <span className={`confidence ${profile.confidence}`}>
                <i aria-hidden="true" />
                {profile.confidence === 'exact' ? c.catalog.exact : c.catalog.family}
              </span>
            </div>

            <h2 className="gpu-reference-name">{profile.graphics}</h2>
            <p className="gpu-reference-model">{profile.processor}</p>

            <dl className="gpu-facts">
              <div>
                <dt className="source-label">{c.gaming.memoryLabel}</dt>
                <dd>{displayValue(profile.memory, locale)}</dd>
              </div>
              <div>
                <dt className="source-label">{c.gaming.storageLabel}</dt>
                <dd>{displayValue(profile.storage, locale)}</dd>
              </div>
              <div>
                <dt className="source-label">{c.gaming.partLabel}</dt>
                <dd>{profile.sku}</dd>
              </div>
            </dl>

            <div className="gpu-source">
              <p className="caution-block">
                {noteFor(profile.graphics)}
              </p>
              <Link className="gpu-profile-link" to={`/laptops/${profile.slug}`}>
                {c.gaming.openProfile} <ArrowUpRight size={12} />
              </Link>
            </div>
          </article>
        ))}
      </div>

      <p className="gaming-disclaimer">{c.gaming.disclaimer}</p>
    </main>
  );
}

import { Link } from 'react-router-dom';
import { PageHeading } from '../components/page-heading';
import { ArrowUpRight } from '../components/icons';
import { profiles } from '../data/profiles';
import { useCopy } from '../data/locale';

const gpuNotes: Record<string, string> = {
  'NVIDIA GeForce RTX 2050': 'Entry laptop GPU. Shared memory, so sustained load throttles.',
  'NVIDIA GeForce RTX 4050 Laptop GPU': 'Mid-range laptop GPU. Frame generation is not available on this tier.',
  'NVIDIA GeForce RTX 4050': 'Mid-range laptop GPU. Frame generation is not available on this tier.',
  'NVIDIA GeForce RTX 4060': 'The discrete GPU in this configuration, with a separate 8 GB of VRAM.',
};

export function GamingPage() {
  const c = useCopy();

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
                <dt className="source-label">MEMORY</dt>
                <dd>{profile.memory}</dd>
              </div>
              <div>
                <dt className="source-label">STORAGE</dt>
                <dd>{profile.storage}</dd>
              </div>
              <div>
                <dt className="source-label">PART</dt>
                <dd>{profile.sku}</dd>
              </div>
            </dl>

            <div className="gpu-source">
              <p className="caution-block">
                {gpuNotes[profile.graphics] ?? c.gaming.genericNote}
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

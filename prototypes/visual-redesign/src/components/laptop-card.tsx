import { Link } from 'react-router-dom';
import { displayValue, type Profile } from '../data/profiles';
import { ArrowUpRight, Check, Plus } from './icons';

type LaptopCardProps = {
  profile: Profile;
  labels: { processor: string; graphics: string; memory: string; storage: string };
  confidenceLabel: string;
  readProfileLabel: string;
  addedLabel: string;
  compareLabel: string;
  selected: boolean;
  lang: 'en' | 'ar';
  onToggleCompare: (slug: string) => void;
};

export function LaptopCard({
  profile,
  labels,
  confidenceLabel,
  readProfileLabel,
  addedLabel,
  compareLabel,
  selected,
  lang,
  onToggleCompare,
}: LaptopCardProps) {
  return (
    <article className="laptop-card" data-testid={`card-laptop-${profile.slug}`}>
      <div className="card-topline">
        <span className="card-index">{profile.brand} / PROFILE</span>
        <span className={`confidence ${profile.confidence}`}>
          <i aria-hidden="true" />
          {confidenceLabel}
        </span>
      </div>

      <Link to={`/laptops/${profile.slug}`} className="card-title-link">
        <h2>{profile.name}</h2>
        <p className="model-code">
          {profile.partNumber} <span>·</span> {profile.sku}
        </p>
      </Link>

      <div className="card-spec">
        <span>{labels.processor}</span>
        <b>{profile.processor}</b>
      </div>
      <div className="card-spec">
        <span>{labels.graphics}</span>
        <b>{profile.graphics}</b>
      </div>
      <div className="card-spec split">
        <div>
          <span>MEMORY</span>
          <b>{displayValue(profile.memory, lang)}</b>
        </div>
        <div>
          <span>{labels.storage}</span>
          <b>{displayValue(profile.storage, lang)}</b>
        </div>
      </div>

      <div className="card-actions">
        <Link to={`/laptops/${profile.slug}`} className="text-link">
          {readProfileLabel} <ArrowUpRight />
        </Link>
        <button
          type="button"
          className={`compare-toggle ${selected ? 'selected' : ''}`}
          aria-pressed={selected}
          data-testid={`button-compare-${profile.slug}`}
          onClick={() => onToggleCompare(profile.slug)}
        >
          {selected ? <Check /> : <Plus />}
          {selected ? addedLabel : compareLabel}
        </button>
      </div>
    </article>
  );
}

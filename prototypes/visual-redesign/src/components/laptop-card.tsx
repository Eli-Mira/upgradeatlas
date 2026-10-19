import { Link } from 'react-router-dom';
import type { Profile } from '../data/profiles';
import { ArrowUpRight, Check, Plus } from './icons';

type LaptopCardProps = {
  profile: Profile;
  confidenceLabel: string;
  readProfileLabel: string;
  addedLabel: string;
  compareLabel: string;
  selected: boolean;
  onToggleCompare: (slug: string) => void;
};

export function LaptopCard({
  profile,
  confidenceLabel,
  readProfileLabel,
  addedLabel,
  compareLabel,
  selected,
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
        <span>PROCESSOR</span>
        <b>{profile.processor}</b>
      </div>
      <div className="card-spec">
        <span>GRAPHICS</span>
        <b>{profile.graphics}</b>
      </div>
      <div className="card-spec split">
        <div>
          <span>MEMORY</span>
          <b>{profile.memory}</b>
        </div>
        <div>
          <span>STORAGE</span>
          <b>{profile.storage}</b>
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

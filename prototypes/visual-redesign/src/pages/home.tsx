import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, ArrowUpRight } from '../components/icons';
import { profiles } from '../data/profiles';
import { useCopy } from '../data/locale';

/** Renders a copy string where **double asterisks** mark the red accent word. */
function rich(text: string) {
  return text.split('**').map((part, index) =>
    index % 2 === 1 ? <em key={index}>{part}</em> : part,
  );
}

const featured = [
  profiles[0],
  profiles[1],
  profiles[2],
];

export function HomePage() {
  const c = useCopy();
  const [question, research, method, next] = c.home.sections;

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <i aria-hidden="true" />
            {c.home.eyebrow}
          </p>
          <h1>
            <span>{c.home.titleLines[0]}</span>
            <span>{c.home.titleLines[1]}</span>
            <span className="second-line">
              {c.home.titleAccentLine} <em>{c.home.titleAccent}</em>
            </span>
          </h1>
          <p className="hero-description">
            {c.home.description.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
          <div className="hero-actions">
            <Link to="/laptops" className="button-primary">
              {c.home.primaryCta} <ArrowRight size={16} />
            </Link>
            <a href="#research-desk" className="button-secondary">
              {c.home.secondaryCta} <ArrowDown size={15} />
            </a>
          </div>
          <p className="hero-footnote">{c.home.footnote}</p>
        </div>

        <figure className="hero-visual">
          <div className="scene-frame">
            <img
              className="fallback-art"
              src="/assets/hero-laptop.webp"
              alt="Original concept render of a graphite gaming laptop with a red light sweep, recovered from the design study"
            />
          </div>
          <span className="scene-coordinate" aria-hidden="true" />
          <div className="visual-readout" aria-hidden="true">
            FIELD NOTE — 001
            <br />
            EXACT SKU / VERIFIED PATHS
            <br />
            CAIRO, EG · 30°02' N
          </div>
        </figure>

        <span className="vertical-index" aria-hidden="true">
          QA / VISUAL STUDY 001
        </span>

        <div className="hero-bottomline">
          <span>{c.home.bottomLeft}</span>
          <span>
            <i className="precision-tick" />
            {c.home.bottomRight}
          </span>
        </div>
      </section>

      <section className="story-section manifesto" id="question">
        <div className="story-kicker">
          <span>
            {question.index} / {question.kicker}
          </span>
          <span>{question.aside}</span>
        </div>
        <div className="manifesto-grid">
          <h2>
            {question.heading[0]}
            <br />
            {rich(question.heading[1])}
          </h2>
          <div>
            <p className="manifesto-copy">{question.body}</p>
            <a className="text-link" href="#research-desk">
              {question.link} <ArrowRight />
            </a>
          </div>
        </div>
        <div className="manifesto-rail">
          <span>{question.railLeft}</span>
          <span>{question.railRight}</span>
        </div>
      </section>

      <section className="story-section" id="research-desk">
        <div className="story-kicker">
          <span>
            {research.index} / {research.kicker}
          </span>
          <span>{research.aside}</span>
        </div>
        <div className="section-title-row">
          <h2>
            {research.heading[0]}
            <br />
            {rich(research.heading[1])}
          </h2>
          <Link className="text-link" to="/laptops">
            {research.link} <ArrowRight />
          </Link>
        </div>
        <div className="section-label">
          <i className="precision-tick" />
          {research.sectionLabel}
        </div>
        <div className="feature-list">
          {featured.map((profile, index) => (
            <Link
              className="feature-row"
              to={`/laptops/${profile.slug}`}
              key={profile.slug}
            >
              <span className="feature-num">{String(index + 1).padStart(2, '0')}</span>
              <span className="feature-name">
                <h3>{profile.name}</h3>
                <span>{profile.partNumber}</span>
              </span>
              <span className="feature-spec">
                {profile.processor}
                <br />
                {profile.graphics}
              </span>
              <span className={`confidence ${profile.confidence}`}>
                <i aria-hidden="true" />
                {profile.confidence === 'exact' ? c.catalog.exact : c.catalog.family}
              </span>
              <span className="row-arrow">
                <ArrowUpRight />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="story-section method-section">
        <div className="story-kicker">
          <span>
            {method.index} / {method.kicker}
          </span>
          <span>{method.aside}</span>
        </div>
        <div className="method-layout">
          <div>
            <h2>
              {method.heading[0]}
              <br />
              {rich(method.heading[1])}
            </h2>
            <p className="method-lede">{method.body}</p>
          </div>
          <div>
            {method.principles.map((principle, index) => (
              <div className="method-steps" key={principle.title}>
                <span className="feature-num">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{principle.title}</h3>
                  <p className="feature-spec">{principle.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="story-section">
        <div className="story-kicker">
          <span>
            {next.index} / {next.kicker}
          </span>
          <span>{next.aside}</span>
        </div>
        <div className="decision-grid">
          {next.cards.map((card) => (
            <Link className="decision-panel" to={card.to} key={card.to}>
              <span className="section-label">
                <i className="precision-tick" />
                {card.kicker}
              </span>
              <h2>{card.title}</h2>
              <p className="manifesto-copy">{card.body}</p>
              <span className="decision-link">
                {card.cta} <ArrowUpRight />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-coda">
        <p>{c.home.codaTitle}</p>
        <span className="feature-name">{c.home.codaNote}</span>
        <Link className="button-primary" to="/laptops">
          {c.home.codaCta} <ArrowRight size={16} />
        </Link>
      </section>
    </>
  );
}

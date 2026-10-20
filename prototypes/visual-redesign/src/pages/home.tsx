import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { HeroSequence } from '../components/cinematic/hero-sequence';
import { useReveal } from '../components/cinematic/use-reveal';
import { ArchitectureExplorer } from '../components/cinematic/architecture-explorer';
import { ExplodedView } from '../components/cinematic/exploded-view';
import { ArrowUpRight } from '../components/icons';
import { cinematicCopy } from '../data/cinematic-copy';
import { profiles } from '../data/profiles';
import { useCopy, useLocale } from '../data/locale';

const featured = [profiles[0], profiles[1], profiles[2]];

const hardwareCallouts = [
  {
    label: 'Processor',
    body: 'The exact part number, recorded per profile. Nothing is generalised across a family.',
  },
  {
    label: 'Chassis',
    body: 'Vents along both rear edges, as the concept render shows. Material is not claimed.',
  },
  {
    label: 'Memory and storage',
    body: 'Module type, speed and slot occupancy, documented per record.',
  },
  {
    label: 'Thermals',
    body: 'Recorded where the source states it, and left unknown where it does not.',
  },
];

export function HomePage() {
  const { locale } = useLocale();
  const c = useCopy();
  const copy = cinematicCopy(locale);
  const root = useRef<HTMLDivElement>(null);

  // Section content arrives with a restrained reveal, once, on entry.
  useReveal(root);

  return (
    <div ref={root}>
      <HeroSequence />

      <section className="cin-section is-light is-tucked" aria-labelledby="cin-question">
        <div className="cin-wrap">
          <div className="cin-kicker cin-reveal">{copy.question.kicker}</div>
          <div className="cin-reveal">
            <h2 className="cin-display" id="cin-question">
              {copy.question.display} <em>{copy.question.accent}</em>
            </h2>
          </div>
          <div className="cin-question__grid">
            <p className="cin-lede cin-reveal">{copy.question.body}</p>
            <div className="cin-reveal">
              <Link className="cin-link" to="/laptops">
                {copy.question.link} <ArrowUpRight />
              </Link>
            </div>
          </div>
          <div className="cin-rail cin-reveal">
            <span>{copy.question.railLeft}</span>
            <span>{copy.question.railRight}</span>
          </div>
        </div>
      </section>

      <section className="cin-section" aria-labelledby="cin-desk">
        <div className="cin-wrap">
          <div className="cin-kicker cin-reveal">{copy.desk.kicker}</div>
          <div className="cin-headline-row cin-reveal">
            <h2 className="cin-display" id="cin-desk">
              {copy.desk.display} <em>{copy.desk.accent}</em>
            </h2>
            <Link className="cin-link" to="/laptops">
              {copy.desk.link} <ArrowUpRight />
            </Link>
          </div>
          <p className="cin-eyebrow cin-reveal">{copy.desk.label}</p>

          <div className="cin-records">
            {featured.map((profile, index) => (
              <Link
                className="cin-record cin-reveal"
                to={`/laptops/${profile.slug}`}
                key={profile.slug}
              >
                <span className="cin-record__index">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <b>{profile.name}</b>
                  <span className="cin-record__code">{profile.partNumber}</span>
                </div>
                <div className="cin-record__spec">
                  {profile.processor}
                  <br />
                  {profile.graphics}
                </div>
                <span className="cin-record__state">
                  <i />
                  {profile.confidence === 'exact' ? c.catalog.exact : c.catalog.family}
                </span>
                <ArrowUpRight size={16} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="cin-section is-light is-tucked" aria-labelledby="cin-method">
        <div className="cin-wrap">
          <div className="cin-kicker cin-reveal">{copy.method.kicker}</div>
          <div className="cin-headline-row cin-reveal">
            <h2 className="cin-display" id="cin-method">
              {copy.method.display} <em>{copy.method.accent}</em>
            </h2>
            <p className="cin-lede cin-lede--tight">{copy.method.body}</p>
          </div>

          <ol className="cin-steps">
            {copy.method.principles.map((principle, index) => (
              <li className="cin-step cin-reveal" key={principle.title}>
                <span className="cin-step__num">{String(index + 1).padStart(2, '0')}</span>
                <b>{principle.title}</b>
                <p>{principle.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="cin-section" aria-labelledby="cin-hardware">
        <div className="cin-wrap">
          <div className="cin-kicker cin-reveal">{copy.hardware.kicker}</div>
          <div className="cin-headline-row cin-reveal">
            <h2 className="cin-display" id="cin-hardware">
              Built for <em>the exact machine.</em>
            </h2>
          </div>
          <div className="cin-reveal">
            <ExplodedView callouts={hardwareCallouts} />
          </div>
        </div>
      </section>

      <section className="cin-section is-light is-tucked" aria-labelledby="cin-systems">
        <div className="cin-wrap">
          <div className="cin-kicker cin-reveal">{copy.systems.kicker}</div>
          <div className="cin-headline-row cin-reveal">
            <h2 className="cin-display" id="cin-systems">
              {copy.systems.display} <em>{copy.systems.accent}</em>
            </h2>
            <p className="cin-lede cin-lede--tight">{copy.systems.body}</p>
          </div>
          <div className="cin-reveal">
            <ArchitectureExplorer />
          </div>
        </div>
      </section>

      <section className="cin-section" aria-labelledby="cin-next">
        <div className="cin-wrap">
          <div className="cin-kicker cin-reveal">{copy.next.kicker}</div>
          <div className="cin-headline-row cin-reveal">
            <h2 className="cin-display" id="cin-next">
              {copy.next.display} <em>{copy.next.accent}</em>
            </h2>
          </div>
          <div className="cin-panels">
            {copy.next.cards.map((card) => (
              <Link className="cin-panel cin-reveal" to={card.to} key={card.to}>
                <span className="cin-panel__kicker">
                  <i />
                  {card.kicker}
                </span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
                <span className="cin-panel__cta">
                  {card.cta} <ArrowUpRight />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="cin-section is-light is-tucked" aria-labelledby="cin-stories">
        <div className="cin-wrap">
          <div className="cin-kicker cin-reveal">{copy.stories.kicker}</div>
          <div className="cin-reveal">
            <h2 className="cin-display" id="cin-stories">
              {copy.stories.display} <em>{copy.stories.accent}</em>
            </h2>
          </div>
          <div className="cin-stories">
            {copy.stories.stories.map((story, index) => (
              <article
                className={`cin-story ${index === 0 ? 'cin-stories__tall' : 'cin-stories__wide'} cin-reveal`}
                key={story.title}
              >
                <span className="cin-story__label">{story.label}</span>
                <h3 className="cin-story__title">{story.title}</h3>
                <p className="cin-story__caption">{story.caption}</p>
                <span className="cin-story__rule" aria-hidden="true" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cin-section cin-section--cta" aria-labelledby="cin-cta">
        <div className="cin-wrap">
          <div className="cin-kicker cin-reveal">{copy.cta.note}</div>
          <h2 className="cin-display cin-reveal" id="cin-cta">
            {copy.cta.display} <em>{copy.cta.accent}</em>
          </h2>
          <p className="cin-lede cin-reveal">{copy.cta.body}</p>
          <Link className="cin-button cin-reveal" to="/laptops">
            {copy.cta.cta} <ArrowUpRight />
          </Link>
        </div>
      </section>
    </div>
  );
}

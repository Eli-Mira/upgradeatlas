import { Link } from 'react-router-dom';
import { ArrowUpRight } from './icons';

type DecisionCard = {
  kicker: string;
  title: string;
  body: string;
  cta: string;
  to: string;
};

export function DecisionGrid({ cards }: { cards: readonly DecisionCard[] }) {
  return (
    <div className="decision-grid">
      {cards.map((card) => (
        <Link className="decision-panel" to={card.to} key={card.to}>
          <span className="section-label">
            <i className="precision-tick" />
            {card.kicker}
          </span>
          <h2>{card.title}</h2>
          <p>{card.body}</p>
          <span className="decision-link">
            {card.cta} <ArrowUpRight />
          </span>
        </Link>
      ))}
    </div>
  );
}

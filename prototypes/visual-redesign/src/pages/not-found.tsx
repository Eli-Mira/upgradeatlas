import { Link } from 'react-router-dom';
import { useCopy } from '../data/locale';

export function NotFoundPage() {
  const c = useCopy();
  return (
    <main className="content-page">
      <section className="page-heading">
        <div className="page-heading-index">404</div>
        <p className="eyebrow">
          <i aria-hidden="true" />
          {c.nav.ariaLabel}
        </p>
        <h1 className="not-found">
          Nothing filed
          <br />
          under this reference.
        </h1>
        <div className="not-found-actions">
          <Link className="button-primary" to="/laptops">
            {c.catalog.readProfile} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}

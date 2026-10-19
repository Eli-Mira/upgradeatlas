import { useMemo, useState } from 'react';
import { PageHeading } from '../components/page-heading';
import { useCopy } from '../data/locale';

type CostKey = 'memory' | 'storage' | 'installation' | 'replacement';

const fields: { key: CostKey; label: string; hint: string }[] = [
  { key: 'memory', label: 'Memory upgrade', hint: 'Enter 0 if no memory upgrade is planned.' },
  { key: 'storage', label: 'Storage upgrade', hint: 'Enter 0 if you are keeping your storage.' },
  { key: 'installation', label: 'Installation', hint: 'The installation cost you expect to pay.' },
  { key: 'replacement', label: 'Replacement laptop', hint: 'Your own total for the alternative machine.' },
];

const parseAmount = (raw: string) => {
  const cleaned = raw.replace(/[^\d.]/g, '');
  if (!cleaned || cleaned === '.') return null;
  const value = Number(cleaned);
  return Number.isFinite(value) && value >= 0 ? Math.round(value * 100) : null;
};

const format = (cents: number) =>
  new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 2 }).format(
    cents / 100,
  );

export function UpgradePage() {
  const c = useCopy();
  const [values, setValues] = useState<Record<CostKey, string>>({
    memory: '',
    storage: '',
    installation: '',
    replacement: '',
  });
  const [result, setResult] = useState<null | { upgrade: number; replacement: number; lower: 'upgrade' | 'replacement' | 'equal' }>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const parsed = useMemo(
    () =>
      Object.fromEntries(
        fields.map((field) => [field.key, parseAmount(values[field.key])]),
      ) as Record<CostKey, number | null>,
    [values],
  );

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const missing = fields.filter((field) => parsed[field.key] === null);
    if (missing.length) {
      setError(c.upgrade.invalid);
      setResult(null);
      return;
    }
    const upgrade = (parsed.memory ?? 0) + (parsed.storage ?? 0) + (parsed.installation ?? 0);
    const replacement = parsed.replacement ?? 0;
    setError(null);
    setResult({
      upgrade,
      replacement,
      lower: upgrade === replacement ? 'equal' : upgrade < replacement ? 'upgrade' : 'replacement',
    });
  };

  const reset = () => {
    setValues({ memory: '', storage: '', installation: '', replacement: '' });
    setResult(null);
    setError(null);
  };

  return (
    <main className="content-page">
      <PageHeading
        index={c.upgrade.index}
        eyebrow={c.upgrade.eyebrow}
        heading={c.upgrade.heading}
        deck={c.upgrade.deck}
      />

      <div className="calculator-layout">
        <section>
          <form onSubmit={submit} noValidate>
            <div className="calc-section-head">
              <span className="result-index">{c.upgrade.stepOne}</span>
              <h2 className="replacement-head" style={{ fontSize: '29px' }}>
                {c.upgrade.formTitle}
              </h2>
            </div>

            <div className="cost-fields">
              {fields.map((field) => (
                <div className="cost-input" key={field.key}>
                  <span>{field.label}</span>
                  <div className="cost-field">
                    <b className="source-label" style={{ minHeight: 0, padding: 0 }}>
                      EGP
                    </b>
                    <input
                      className="cost-input"
                      type="text"
                      inputMode="decimal"
                      dir="ltr"
                      value={values[field.key]}
                      aria-label={field.label}
                      onChange={(event) =>
                        setValues((previous) => ({ ...previous, [field.key]: event.target.value }))
                      }
                    />
                  </div>
                  <small>{field.hint}</small>
                </div>
              ))}
            </div>

            {error && (
              <p className="quiet-card" role="alert" style={{ marginTop: '18px' }}>
                {error}
              </p>
            )}

            <button type="submit" className="button-primary reset-calc" style={{ marginTop: '18px' }}>
              {c.upgrade.calculate} <span aria-hidden="true">→</span>
            </button>
            <button type="button" className="text-link reset-calc" onClick={reset}>
              {c.upgrade.clear}
            </button>
          </form>

          <div className="calculator-footer">
            <span>{c.upgrade.footLeft}</span>
            <span>{c.upgrade.footRight}</span>
          </div>
        </section>

        <aside className="calc-result">
          {result ? (
            <>
              <div className="calc-section-head">
                <span className="result-index">{c.upgrade.stepTwo}</span>
              </div>
              <p className="result-caption">{c.upgrade.upgradeTotal}</p>
              <p className="result-total">{format(result.upgrade)}</p>

              <div className="result-difference">
                <span className="result-secondary">{format(result.replacement)}</span>
                <span className="result-caption" style={{ margin: 0 }}>
                  {c.upgrade.replacementTotal}
                </span>
              </div>

              <p className="result-caption">{c.upgrade.verdict}</p>
              <p className="result-total" style={{ fontSize: '24px' }}>
                {result.lower === 'equal'
                  ? c.upgrade.equal
                  : result.lower === 'upgrade'
                    ? c.upgrade.upgradeLower
                    : c.upgrade.replacementLower}
              </p>

              <div className="result-note">
                <p className="result-prompt">{c.upgrade.note}</p>
              </div>
            </>
          ) : (
            <>
              <div className="calc-section-head">
                <span className="result-index">{c.upgrade.stepTwo}</span>
              </div>
              <p className="result-caption">{c.upgrade.prompt}</p>
              <p className="result-prompt">{c.upgrade.promptBody}</p>
              <div className="result-divider" />
              <p className="quiet-card" style={{ marginTop: '18px' }}>
                {c.upgrade.noPrices}
              </p>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}

import { useState } from 'react';
import { cinematicCopy } from '../../data/cinematic-copy';
import { useLocale } from '../../data/locale';
import { systemIcons } from './system-icons';

const RADIUS = 43;

/**
 * The architecture explorer.
 *
 * Eight systems orbit the machine. Hovering, focusing or activating a node
 * highlights its connector, selects the matching card, and announces the
 * selection through a live region. The nodes are real buttons, so the
 * interaction works with a keyboard and with touch.
 */
export function ArchitectureExplorer() {
  const { locale } = useLocale();
  const copy = cinematicCopy(locale);
  const [active, setActive] = useState<string>(copy.systems.nodes[0].key);

  const nodes = copy.systems.nodes.map((node, index) => {
    const angle = (index / copy.systems.nodes.length) * Math.PI * 2 - Math.PI / 2;
    return {
      ...node,
      x: 50 + Math.cos(angle) * RADIUS,
      y: 50 + Math.sin(angle) * RADIUS,
    };
  });

  const activeNode = nodes.find((node) => node.key === active) ?? nodes[0];

  return (
    <div className="cin-explorer">
      <div className="cin-explorer__stage">
        <svg className="cin-explorer__line" viewBox="0 0 100 100" aria-hidden="true">
          {nodes.map((node) => (
            <line
              key={node.key}
              x1="50"
              y1="50"
              x2={node.x}
              y2={node.y}
              className={node.key === active ? 'is-active' : undefined}
            />
          ))}
        </svg>

        <div className="cin-explorer__core">
          <img
            src="/assets/sequence/exploded-assembled.webp"
            alt="Original concept render of the assembled graphite gaming laptop"
            width="1400"
            height="900"
            loading="lazy"
          />
        </div>

        {nodes.map((node) => {
          const Icon = systemIcons[node.key];
          return (
            <button
              key={node.key}
              type="button"
              className={`cin-explorer__node ${node.key === active ? 'is-active' : ''}`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              aria-pressed={node.key === active}
              onMouseEnter={() => setActive(node.key)}
              onFocus={() => setActive(node.key)}
              onClick={() => setActive(node.key)}
              aria-describedby={`cin-system-${node.key}`}
            >
              {Icon ? <Icon /> : null}
              <span className="sr-only">{node.label}</span>
            </button>
          );
        })}
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {activeNode.label}: {activeNode.body}
      </p>

      <div className="cin-explorer__cards">
        {nodes.map((node) => (
          <button
            key={node.key}
            type="button"
            id={`cin-system-${node.key}`}
            className={`cin-explorer__card ${node.key === active ? 'is-active' : ''}`}
            aria-pressed={node.key === active}
            onMouseEnter={() => setActive(node.key)}
            onFocus={() => setActive(node.key)}
            onClick={() => setActive(node.key)}
          >
            <b>{node.label}</b>
            <span>{node.body}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type Callout = { label: string; body: string };

/**
 * The conceptual exploded view.
 *
 * Two pre-rendered states of the same machine — assembled and separated —
 * are scrubbed apart as the section scrolls, and four callouts name the
 * assemblies. It is a construction illustration, not a teardown drawing.
 */
export function ExplodedView({ callouts }: { callouts: Callout[] }) {
  const root = useRef<HTMLDivElement>(null);
  const assembled = useRef<HTMLImageElement>(null);
  const separated = useRef<HTMLImageElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      // The two states come from the same camera, so the machine separates by
      // dissolving rather than by two machines existing at once.
      const scrub = {
        trigger: root.current,
        start: 'top 82%',
        end: 'bottom 46%',
        scrub: 0.8,
      };
      gsap.fromTo(
        separated.current,
        { opacity: 0, scale: 1.04 },
        { opacity: 1, scale: 1, ease: 'none', scrollTrigger: scrub },
      );
      gsap.fromTo(
        assembled.current,
        { opacity: 1, scale: 1 },
        { opacity: 0, scale: 0.95, ease: 'none', scrollTrigger: scrub },
      );
    },
    { scope: root },
  );

  return (
    <div className="cin-exploded" ref={root}>
      <div className="cin-exploded__stack">
        <div className="cin-exploded__layer" data-label="Conceptual exploded view">
          <img
            ref={assembled}
            src="/assets/sequence/exploded-assembled.webp"
            alt=""
            width="1400"
            height="900"
            loading="lazy"
          />
        </div>
        <div className="cin-exploded__layer">
          <img
            ref={separated}
            src="/assets/sequence/exploded-separated.webp"
            alt="Conceptual exploded view: the screen assembly lifted away from the keyboard deck, which lifts from the bottom shell"
            width="1400"
            height="900"
            loading="lazy"
            style={{ opacity: 0 }}
          />
        </div>
      </div>

      <ul className="cin-callouts">
        {callouts.map((callout, index) => (
          <li className="cin-callout" key={callout.label}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <b>{callout.label}</b>
            <p>{callout.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

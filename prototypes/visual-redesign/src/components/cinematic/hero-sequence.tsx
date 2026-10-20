import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  ProductSequence,
  type ProductSequenceHandle,
} from './product-sequence';
import { cinematicCopy } from '../../data/cinematic-copy';
import { useLocale } from '../../data/locale';

gsap.registerPlugin(useGSAP, ScrollTrigger);

// The nodes orbit the machine, which sits right of centre. None of them
// cross the headline column.
const NODE_POSITIONS = [
  { top: '11%', left: '50%' },
  { top: '4%', left: '75%' },
  { top: '21%', left: '91%' },
  { top: '53%', left: '93%' },
  { top: '80%', left: '77%' },
  { top: '88%', left: '53%' },
  { top: '38%', left: '49%' },
];

/** The composition mirrors with the locale: the machine moves to the
 *  opposite side and the nodes ring it from the other direction. */
function nodeStyle(position: { top: string; left: string }, rtl: boolean) {
  return { top: position.top, left: rtl ? `${100 - parseFloat(position.left)}%` : position.left };
}

/**
 * The pinned cinematic hero.
 *
 * Scroll progress drives the pre-rendered product sequence, the rings, the
 * copy and the telemetry. Nothing loops: the whole scene is a function of
 * scroll position, so the page is still when the reader is not scrolling and
 * costs nothing while the tab is hidden.
 */
export function HeroSequence() {
  const { locale } = useLocale();
  const copy = cinematicCopy(locale);
  const rtl = locale === 'ar';
  const root = useRef<HTMLElement>(null);
  const sequence = useRef<ProductSequenceHandle>(null);
  const copyBlock = useRef<HTMLDivElement>(null);
  const rings = useRef<SVGSVGElement>(null);
  const nodeLayer = useRef<HTMLDivElement>(null);
  const telemetry = useRef<HTMLDivElement>(null);
  const beam = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) {
        // A static, complete composition: the open product, the rings, the
        // copy, and the telemetry, all legible without scrolling.
        sequence.current?.setProgress(1);
        gsap.set([copyBlock.current, telemetry.current], { opacity: 1, y: 0, x: 0 });
        gsap.set(rings.current, { opacity: 1, scale: 1, rotate: 0 });
        gsap.set(nodeLayer.current?.children ?? [], { opacity: 1, y: 0 });
        return;
      }

      // The headline is present on arrival: it is the opening statement,
      // not a reward for scrolling.
      gsap.fromTo(
        copyBlock.current,
        { opacity: 0, y: 34 },
        { opacity: 1, y: 0, ease: 'power2.out', duration: 0.9, delay: 0.15 },
      );

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=230%',
          scrub: 0.85,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // The product opens and the camera closes in.
      timeline.to(
        {},
        {
          duration: 1,
          ease: 'none',
          onUpdate: () => sequence.current?.setProgress(timeline.progress()),
        },
        0,
      );

      // Rings expand behind the machine.
      timeline.fromTo(
        rings.current,
        { opacity: 0, scale: 0.55, rotate: -16 },
        { opacity: 1, scale: 1.14, rotate: 8, ease: 'power2.out', duration: 0.7 },
        0,
      );
      timeline.to(rings.current, { scale: 1.26, rotate: 18, ease: 'none', duration: 0.3 }, 0.7);

      // The light beam crosses the body once.
      timeline.fromTo(
        beam.current,
        { xPercent: -120, opacity: 0 },
        { xPercent: 120, opacity: 0.9, ease: 'power2.inOut', duration: 0.32 },
        0.05,
      );
      timeline.to(beam.current, { opacity: 0, duration: 0.18 }, 0.37);

      // The headline yields to the machine once the sequence takes over.
      timeline.to(copyBlock.current, { opacity: 0, y: -46, ease: 'power2.in', duration: 0.2 }, 0.66);

      // Feature nodes orbit in, then fade as the camera approaches.
      const nodes = nodeLayer.current ? Array.from(nodeLayer.current.children) : [];
      timeline.fromTo(
        nodes,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, stagger: 0.035, ease: 'power2.out', duration: 0.24 },
        0.2,
      );
      timeline.to(nodes, { opacity: 0, y: -12, stagger: 0.02, duration: 0.16 }, 0.56);

      // The scroll prompt retires once the reader is moving.
      timeline.to(hint.current, { opacity: 0, ease: 'none', duration: 0.08 }, 0.06);

      // Telemetry resolves at the end of the journey.
      timeline.fromTo(
        telemetry.current,
        { opacity: 0, x: 34 },
        { opacity: 1, x: 0, ease: 'power2.out', duration: 0.22 },
        0.68,
      );
    },
    { scope: root },
  );

  return (
    <section className="cin-hero" ref={root} aria-labelledby="cin-hero-title">
      <div className="cin-hero__glow" aria-hidden="true" />
      <div className="cin-hero__grid" aria-hidden="true" />

      <svg
        className="cin-hero__rings"
        ref={rings}
        viewBox="0 0 800 800"
        aria-hidden="true"
        focusable="false"
      >
        <g fill="none" stroke="#18e1db" strokeOpacity="0.26">
          <circle cx="400" cy="400" r="380" />
          <circle cx="400" cy="400" r="300" strokeOpacity="0.18" />
          <circle cx="400" cy="400" r="220" strokeOpacity="0.12" />
        </g>
        <g fill="none" stroke="#1677ff" strokeOpacity="0.16">
          <circle cx="400" cy="400" r="140" />
          <circle cx="400" cy="400" r="70" strokeOpacity="0.1" />
        </g>
      </svg>

      <div className="cin-hero__beam" ref={beam} aria-hidden="true" />

      <ProductSequence
        ref={sequence}
        className={`cin-hero__product ${rtl ? 'is-rtl' : ''}`}
        alt="Original concept render of a graphite gaming laptop, opening on its hinge as the view moves closer"
      />

      <div className="cin-hero__nodes" ref={nodeLayer} aria-hidden="true">
        {copy.hero.nodes.map((label, index) => (
          <span
            className="cin-node"
            key={label}
            style={nodeStyle(NODE_POSITIONS[index % NODE_POSITIONS.length], rtl)}
          >
            <i />
            {label}
          </span>
        ))}
      </div>

      <div className="cin-hero__copy">
        <div className="cin-wrap" ref={copyBlock}>
          <p className="cin-kicker">{copy.hero.kicker}</p>
          <h1 id="cin-hero-title">
            {copy.hero.line1}
            <em>{copy.hero.line2}</em>
          </h1>
          <p className="cin-lede">{copy.hero.sub}</p>
        </div>
      </div>

      <div className="cin-hero__telemetry cin-telemetry" ref={telemetry}>
        {copy.hero.telemetry.map((row) => (
          <div className="cin-telemetry__row" key={row.label}>
            <span>{row.label}</span>
            <b>
              {row.value} <em>{row.note}</em>
            </b>
          </div>
        ))}
      </div>

      <p className="cin-hero__hint" ref={hint} aria-hidden="true">
        {copy.hero.hint}
      </p>
    </section>
  );
}

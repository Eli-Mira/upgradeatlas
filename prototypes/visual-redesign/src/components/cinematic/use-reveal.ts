import { useEffect, type RefObject } from 'react';

/**
 * Reveal-on-scroll, as progressive enhancement.
 *
 * Nothing is hidden until this hook has measured the element and found it
 * below the fold, so if scripting fails, the page is printed, or the reader
 * never scrolls, every word is still there. Only the elements that are
 * genuinely off-screen wait.
 */
export function useReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = root.current;
    if (!container) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const elements = Array.from(container.querySelectorAll<HTMLElement>('.cin-reveal'));
    const pending = elements.filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.top > window.innerHeight * 1.02;
    });
    if (!pending.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLElement;
          element.classList.add('is-in');
          observer.unobserve(element);
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.04 },
    );

    for (const element of pending) {
      element.classList.add('cin-reveal--pending');
      observer.observe(element);
    }
    return () => observer.disconnect();
  }, [root]);
}

import { useEffect, useRef } from 'react';

/**
 * Custom hook that adds scroll-reveal animations using IntersectionObserver.
 * Attach the returned ref to a container element — when it enters the viewport,
 * the `is-visible` class is added to it and all children with `.reveal` class.
 *
 * @param threshold - Fraction of element visible before triggering (0-1)
 * @param rootMargin - CSS margin string to offset trigger boundary
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.1,
  rootMargin = '0px 0px -60px 0px'
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    // Observe the container itself
    if (el.classList.contains('reveal') || el.classList.contains('reveal-scale')) {
      observer.observe(el);
    }

    // Observe all child `.reveal` elements for stagger
    const children = el.querySelectorAll('.reveal, .reveal-scale');
    children.forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return ref;
}

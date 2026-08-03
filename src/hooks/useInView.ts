import { useEffect, useState } from 'react';

/** Defer work until element is near the viewport (map geo JSON, heavy SVG). */
export function useInView(rootMargin = '120px') {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref || inView) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { rootMargin },
    );
    obs.observe(ref);
    return () => obs.disconnect();
  }, [ref, inView, rootMargin]);

  return { setRef, inView };
}

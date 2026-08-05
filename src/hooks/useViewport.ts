import { useEffect, useState } from 'react';

export type ViewportKind = 'mobile-portrait' | 'mobile-landscape' | 'tablet' | 'desktop';

function detectViewport(): ViewportKind {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  const h = window.innerHeight;
  const landscape = w > h;

  if (w < 768) {
    return landscape ? 'mobile-landscape' : 'mobile-portrait';
  }
  if (w < 1024) return 'tablet';
  return 'desktop';
}

/** Tracks portrait / landscape and device size for responsive charts & layout */
export function useViewport(): ViewportKind {
  const [kind, setKind] = useState<ViewportKind>(detectViewport);

  useEffect(() => {
    const update = () => setKind(detectViewport());
    update();
    window.addEventListener('resize', update, { passive: true });
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return kind;
}

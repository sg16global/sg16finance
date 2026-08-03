import { useEffect, useRef } from 'react';
import { useInView } from '../hooks/useInView';
import { ADSENSE_CLIENT, adsEnabled, slotFor } from '../lib/adsense';
import { useAds } from './AdsProvider';

type Props = {
  placement: string;
  className?: string;
  /** Responsive AdSense format — auto sizes to container on mobile */
  format?: 'auto' | 'rectangle' | 'horizontal';
};

export default function AdSlot({ placement, className = '', format = 'auto' }: Props) {
  const insRef = useRef<HTMLModElement>(null);
  const { setRef, inView } = useInView('200px');
  const { ready, consented, pushAd } = useAds();
  const slot = slotFor(placement);
  const live = adsEnabled() && consented && ready && slot;

  useEffect(() => {
    if (!live || !inView || !insRef.current) return;
    pushAd(insRef.current);
  }, [live, inView, pushAd]);

  const minH = format === 'horizontal' ? 'min-h-[60px] sm:min-h-[90px]' : 'min-h-[250px] sm:min-h-[280px]';

  if (!adsEnabled()) {
    return (
      <div
        ref={setRef}
        className={`ad-slot ad-slot-placeholder flex ${minH} w-full max-w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/[0.06] bg-black/20 px-3 py-2 ${className}`}
        data-ad-placement={placement}
      >
        <span className="text-center text-[10px] uppercase tracking-wider text-[#7D8594]/60">
          Advertisement
        </span>
      </div>
    );
  }

  if (!consented) {
    return null;
  }

  return (
    <div
      ref={setRef}
      className={`ad-slot ad-slot-live mx-auto w-full max-w-full overflow-hidden ${minH} ${className}`}
      data-ad-placement={placement}
    >
      <ins
        ref={insRef}
        className="adsbygoogle block w-full"
        style={{ display: 'block', minHeight: format === 'horizontal' ? 60 : 250 }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

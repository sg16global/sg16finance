/** AdSense-ready placeholder — replace data-ad-slot after approval */
export default function AdSlot({ placement, className = '' }: { placement: string; className?: string }) {
  return (
    <div
      className={`ad-slot flex min-h-[90px] items-center justify-center rounded-xl border border-dashed border-white/[0.06] bg-black/20 px-4 py-3 ${className}`}
      data-ad-placement={placement}
      aria-hidden="true"
    >
      <span className="text-[10px] uppercase tracking-wider text-[#7D8594]/60">Advertisement</span>
    </div>
  );
}

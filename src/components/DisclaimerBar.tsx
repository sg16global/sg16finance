export default function DisclaimerBar() {
  return (
    <div className="disclaimer-bar border-b border-white/[0.08] bg-[#0D1118] px-3 py-1.5 text-center text-[10px] leading-snug text-[#7D8594] sm:px-4 sm:text-[11px]">
      <span className="disclaimer-bar-short hidden max-[479px]:inline">Educational only — not financial advice.</span>
      <span className="disclaimer-bar-full max-[479px]:hidden">
        For education and information only — not financial advice. Past performance does not guarantee future results.
      </span>
    </div>
  );
}

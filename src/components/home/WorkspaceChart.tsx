import { useId } from 'react';
import MiniChart from './MiniChart';

type Props = {
  data: number[];
  category: string;
};

export default function WorkspaceChart({ data, category }: Props) {
  const patternId = useId();

  return (
    <div className="workspace-chart relative overflow-hidden rounded-xl bg-black/50 ring-1 ring-white/[0.06]">
      <div className="workspace-chart-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="workspace-chart-glow pointer-events-none absolute -right-8 -bottom-8 h-48 w-48 rounded-full bg-[#C76A16]/20 blur-3xl" aria-hidden />

      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]" aria-hidden>
        <defs>
          <pattern id={patternId} width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#C76A16" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>

      <div key={category} className="workspace-chart-body relative h-[160px] p-3 md:h-[200px] md:p-4">
        <MiniChart data={data} height={180} glow strokeWidth={2} />
      </div>
    </div>
  );
}

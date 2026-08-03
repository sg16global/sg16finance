import type { ReactNode } from 'react';

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="fin-section-label">
      <span className="fin-section-accent" aria-hidden />
      <span>{children}</span>
    </div>
  );
}

export function LiveBadge() {
  return (
    <span className="live-badge">
      <span className="live-dot" aria-hidden />
      LIVE
    </span>
  );
}

export function DataTimestamp() {
  return <span className="data-timestamp font-mono-data">Updated 2m ago</span>;
}

export function ShieldCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`glass-shield ${className}`}>
      <span className="shield-accent-bar" aria-hidden />
      <div className="glass-shield-inner p-3.5 md:p-4">{children}</div>
    </div>
  );
}

export function DataCell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="fin-data-cell">
      <p className="fin-data-cell-title">{title}</p>
      {children}
    </div>
  );
}

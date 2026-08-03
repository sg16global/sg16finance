import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import AdSlot from './AdSlot';
import { SectionLabel } from './home/ui';

type PageShellProps = {
  label?: string;
  title: string;
  description?: string;
  children: ReactNode;
  wide?: boolean;
};

export default function PageShell({ label, title, description, children, wide = false }: PageShellProps) {
  return (
    <div className="dashboard-canvas min-h-full">
      <div className={`mx-auto px-4 py-10 lg:px-6 ${wide ? 'max-w-6xl' : 'max-w-3xl'}`}>
        {label && <SectionLabel>{label}</SectionLabel>}
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-white md:text-3xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl leading-relaxed text-[#7D8594]">{description}</p>}
        <AdSlot placement="top" className="mt-6" />
        <div className="mt-8">{children}</div>
        <AdSlot placement="bottom" className="mt-10" />
      </div>
    </div>
  );
}

export function ProseArticle({ children }: { children: ReactNode }) {
  return <article className="prose max-w-none">{children}</article>;
}

export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="fin-link text-sm">
      {children}
    </Link>
  );
}

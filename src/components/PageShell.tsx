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
      <div className={`mx-auto px-3 py-6 sm:px-4 sm:py-8 md:py-10 lg:px-6 ${wide ? 'max-w-6xl' : 'max-w-3xl'}`}>
        {label && <SectionLabel>{label}</SectionLabel>}
        <h1 className="mt-2 text-xl font-bold tracking-tight text-white sm:mt-3 sm:text-2xl md:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#7D8594] sm:mt-3 sm:text-base">{description}</p>}
        <AdSlot placement="top" format="horizontal" className="mt-4 sm:mt-6" />
        <div className="mt-6 sm:mt-8">{children}</div>
        <AdSlot placement="bottom" format="horizontal" className="mt-8 sm:mt-10" />
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

import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { ShieldCard } from '../components/home/ui';
import { SECTORS } from '../data/sectors';

export default function Sectors() {
  return (
    <PageShell
      label="Research"
      title="Sector overviews"
      description="What drives each part of the global equity market — key players, risks, and context without the hype."
      wide
    >
      <div className="grid gap-4 md:grid-cols-2">
        {SECTORS.map((s) => (
          <Link key={s.slug} to={`/sectors/${s.slug}`} className="group block">
            <ShieldCard className="h-full">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#C76A16]">{s.tagline}</div>
              <h2 className="mt-2 text-xl font-semibold text-white transition group-hover:text-[#FF9A3C]">{s.name}</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#7D8594]">{s.summary}</p>
              <span className="mt-4 inline-block text-sm text-[#C76A16] transition group-hover:text-[#FF9A3C]">
                Read overview →
              </span>
            </ShieldCard>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}

import { useParams } from 'react-router-dom';
import PageShell, { BackLink, ProseArticle } from '../components/PageShell';
import { DataCell, ShieldCard } from '../components/home/ui';
import { sectorBySlug } from '../data/sectors';

export default function SectorDetail() {
  const { slug = '' } = useParams();
  const sector = sectorBySlug(slug);

  if (!sector) {
    return (
      <PageShell title="Sector not found">
        <p className="text-[#7D8594]">This sector overview does not exist.</p>
        <BackLink to="/sectors">← All sectors</BackLink>
      </PageShell>
    );
  }

  return (
    <PageShell label="Sector" title={sector.name} description={sector.summary}>
      <BackLink to="/sectors">← Sectors</BackLink>
      <p className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-[#C76A16]">{sector.tagline}</p>

      <div className="not-prose mt-6 grid gap-3 sm:grid-cols-2">
        <ShieldCard>
          <DataCell title="Key companies">{sector.keyPlayers.join(' · ')}</DataCell>
        </ShieldCard>
        <ShieldCard>
          <DataCell title="Outlook">{sector.outlook}</DataCell>
        </ShieldCard>
      </div>

      <ProseArticle>
        <h2>What moves prices</h2>
        <ul>
          {sector.drivers.map((d) => (
            <li key={d} className="fin-list-item">
              {d}
            </li>
          ))}
        </ul>
        <h2>Risks to watch</h2>
        <ul>
          {sector.risks.map((r) => (
            <li key={r} className="fin-list-item">
              {r}
            </li>
          ))}
        </ul>
      </ProseArticle>
    </PageShell>
  );
}

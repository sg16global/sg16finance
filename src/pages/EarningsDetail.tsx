import { useParams } from 'react-router-dom';
import PageShell, { BackLink, ProseArticle } from '../components/PageShell';
import { DataCell, ShieldCard } from '../components/home/ui';
import { earningsBySymbol } from '../data/earnings';

export default function EarningsDetail() {
  const { symbol = '' } = useParams();
  const report = earningsBySymbol(symbol);

  if (!report) {
    return (
      <PageShell title="Report not found">
        <p className="text-[#7D8594]">This earnings report does not exist.</p>
        <BackLink to="/earnings">← All earnings</BackLink>
      </PageShell>
    );
  }

  return (
    <PageShell label="Earnings" title={report.company} description={report.headline}>
      <BackLink to="/earnings">← Earnings</BackLink>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-lg bg-[#C76A16]/15 px-3 py-1 font-mono text-[#FF9A3C]">{report.symbol}</span>
        <span className="text-[#7D8594]">{report.quarter}</span>
      </div>

      <div className="not-prose mt-6 grid gap-3 sm:grid-cols-3">
        <ShieldCard>
          <DataCell title="Revenue">
            <span className="font-mono text-lg text-white">{report.revenue}</span>
          </DataCell>
        </ShieldCard>
        <ShieldCard>
          <DataCell title="EPS">
            <span className="font-mono text-lg text-white">{report.eps}</span>
          </DataCell>
        </ShieldCard>
        <ShieldCard>
          <DataCell title="Vs consensus">
            <span className="text-sm text-[#B6BDC8]">{report.beatMiss}</span>
          </DataCell>
        </ShieldCard>
      </div>

      <ProseArticle>
        <h2>Summary</h2>
        <p>{report.summary}</p>
        <h2>Key takeaways</h2>
        <ul>
          {report.takeaways.map((t) => (
            <li key={t} className="fin-list-item">
              {t}
            </li>
          ))}
        </ul>
      </ProseArticle>
    </PageShell>
  );
}

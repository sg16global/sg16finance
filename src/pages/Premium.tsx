import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { ShieldCard } from '../components/home/ui';

const FEATURES = [
  'Deeper sector reports and earnings alerts',
  'SG16 AI summaries on demand',
  'Portfolio watchlists and price triggers',
  'Ad-free reading experience',
];

export default function Premium() {
  return (
    <PageShell
      label="Premium"
      title="SG16 Finance Premium"
      description="Deeper research, alerts, and SG16 AI summaries — for readers who want more than the free daily context."
    >
      <div className="mx-auto max-w-lg">
        <ShieldCard className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C76A16]">Coming soon</p>
          <ul className="mt-6 space-y-3 text-left text-sm text-[#B6BDC8]">
            {FEATURES.map((f) => (
              <li key={f} className="fin-list-item">
                {f}
              </li>
            ))}
          </ul>
          <a
            href="mailto:info@saiftechglobal.com?subject=SG16%20Finance%20Premium%20waitlist"
            className="fin-btn-primary mt-8 inline-block px-6 py-3 text-sm"
          >
            Join waitlist
          </a>
        </ShieldCard>
        <p className="mt-6 text-center text-xs text-[#7D8594]">
          Free content remains available on{' '}
          <Link to="/" className="fin-link">
            the dashboard
          </Link>
          .
        </p>
      </div>
    </PageShell>
  );
}

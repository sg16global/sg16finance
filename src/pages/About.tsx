import PageShell, { ProseArticle } from '../components/PageShell';

export default function About() {
  return (
    <PageShell
      label="Company"
      title="About SG16 Finance"
      description="International stock intelligence from Saif Tech Global Limited."
    >
      <ProseArticle>
        <p>
          SG16 Finance is an international stock intelligence platform from{' '}
          <a href="https://saiftechglobal.com" className="fin-link">
            Saif Tech Global Limited
          </a>{' '}
          (UK Company No. 16826361).
        </p>
        <h2>Mission</h2>
        <p>
          We explain sectors, earnings, and market moves in clear language — for readers worldwide who want context
          without jargon or hype.
        </p>
        <h2>What we are not</h2>
        <ul>
          <li className="fin-list-item">Not a broker, bank, or investment adviser</li>
          <li className="fin-list-item">Not personalised financial advice</li>
          <li className="fin-list-item">We do not execute trades or hold client funds</li>
        </ul>
        <h2>SG16 Network</h2>
        <p>
          SG16 Finance is part of the Saif Tech Global ecosystem alongside{' '}
          <a href="https://sg16engine.com" className="fin-link">
            SG16 AI Engine
          </a>{' '}
          and the{' '}
          <a href="https://saifglobal16.info" className="fin-link">
            geopolitical monitor
          </a>
          .
        </p>
        <h2>Roadmap</h2>
        <p>Premium research tools and SG16 AI-powered summaries for subscribers.</p>
      </ProseArticle>
    </PageShell>
  );
}

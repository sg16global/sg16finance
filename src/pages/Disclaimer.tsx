import PageShell, { ProseArticle } from '../components/PageShell';

export default function Disclaimer() {
  return (
    <PageShell label="Legal" title="Disclaimer">
      <ProseArticle>
        <p>
          All content on sg16finance.com is for <strong className="text-[#B6BDC8]">general information and education</strong>{' '}
          only. It is not financial, investment, tax, or legal advice.
        </p>
        <h2>No recommendation</h2>
        <p>
          Nothing here is a solicitation or recommendation to buy, sell, or hold any security. Consult a qualified
          professional before making financial decisions.
        </p>
        <h2>Data accuracy</h2>
        <p>Market data and earnings figures may be delayed, estimated, or sourced from third parties.</p>
        <h2>Advertising</h2>
        <p>
          This site may display third-party advertisements. We are not responsible for products or services advertised
          by third parties.
        </p>
        <h2>Company</h2>
        <p>
          Operated by Saif Tech Global LLC, USA. Registered office: 8206 Louisiana Blvd NE, Ste A #10595, Albuquerque,
          NM 87113, USA.
        </p>
      </ProseArticle>
    </PageShell>
  );
}

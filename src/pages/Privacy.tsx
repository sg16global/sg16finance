import PageShell, { ProseArticle } from '../components/PageShell';

export default function Privacy() {
  return (
    <PageShell
      label="Legal"
      title="Privacy Policy"
      description="How Saif Tech Global Limited collects and uses data on sg16finance.com."
    >
      <ProseArticle>
        <p className="text-sm text-[#7D8594]">Last updated: August 2026</p>

        <h2>Who we are</h2>
        <p>
          sg16finance.com is operated by Saif Tech Global Limited (UK Company No. 16826361), registered office 5
          Summercourt Road, London, E1 0SQ. Contact:{' '}
          <a href="mailto:info@saiftechglobal.com" className="fin-link">
            info@saiftechglobal.com
          </a>
          .
        </p>

        <h2>Information we collect</h2>
        <ul>
          <li>Standard server logs (IP address, browser type, pages visited, timestamps)</li>
          <li>Analytics data via Google Analytics or similar services</li>
          <li>Cookie and local storage preferences</li>
          <li>Information you send us by email (e.g. waitlist or contact enquiries)</li>
        </ul>

        <h2>Cookies and advertising</h2>
        <p>
          We use cookies to remember preferences, measure traffic, and serve relevant advertisements through partners
          such as Google AdSense. You can control cookies in your browser settings. Third-party ad partners may use
          cookies to personalise ads according to their own policies.
        </p>

        <h2>How we use data</h2>
        <ul>
          <li>Operate and improve the site</li>
          <li>Understand audience and content performance</li>
          <li>Display advertising</li>
          <li>Respond to enquiries</li>
          <li>Comply with legal obligations</li>
        </ul>

        <h2>Data sharing</h2>
        <p>
          We do not sell personal data. We may share limited technical data with hosting (Cloudflare), analytics, and
          advertising providers who process data on our behalf under appropriate agreements.
        </p>

        <h2>Retention</h2>
        <p>We retain logs and analytics for as long as needed for the purposes above, typically up to 26 months.</p>

        <h2>Your rights</h2>
        <p>
          Depending on your location, you may have rights to access, correct, or delete personal data. UK and EEA
          residents may contact us to exercise GDPR rights. California residents may have additional rights under CCPA.
        </p>

        <h2>Children</h2>
        <p>This site is not directed at children under 16. We do not knowingly collect data from children.</p>

        <h2>Changes</h2>
        <p>We may update this policy. Material changes will be reflected on this page with an updated date.</p>
      </ProseArticle>
    </PageShell>
  );
}

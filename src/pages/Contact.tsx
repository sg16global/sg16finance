import PageShell, { ProseArticle } from '../components/PageShell';
import { ShieldCard } from '../components/home/ui';

export default function Contact() {
  return (
    <PageShell label="Support" title="Contact" description="Partnerships, press, or general enquiries.">
      <ShieldCard>
        <ProseArticle>
          <p>Email us at:</p>
          <p>
            <a href="mailto:info@saiftechglobal.com" className="fin-link text-lg">
              info@saiftechglobal.com
            </a>
          </p>
          <p>
            Company site:{' '}
            <a href="https://saiftechglobal.com" className="fin-link">
              saiftechglobal.com
            </a>
          </p>
        </ProseArticle>
      </ShieldCard>
    </PageShell>
  );
}

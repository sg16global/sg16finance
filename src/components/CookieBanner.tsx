import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'sg16finance-cookie-consent';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="cookie-banner fixed bottom-0 left-0 right-0 z-[100] border-t border-white/[0.08] bg-[#0D1118]/98 p-4 backdrop-blur-md sm:p-5 md:pb-[max(1rem,env(safe-area-inset-bottom))] max-md:bottom-[calc(3.5rem+env(safe-area-inset-bottom))] max-md:pb-4"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-[#B6BDC8]">
          We use cookies for analytics and advertising. See our{' '}
          <Link to="/privacy" className="fin-link underline-offset-2 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={accept} className="fin-btn-primary px-5 py-2">
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}

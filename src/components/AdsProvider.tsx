import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { ADSENSE_CLIENT, adsEnabled } from '../lib/adsense';

const CONSENT_KEY = 'sg16finance-cookie-consent';

type AdsContextValue = {
  ready: boolean;
  consented: boolean;
  pushAd: (element: HTMLElement) => void;
};

const AdsContext = createContext<AdsContextValue>({
  ready: false,
  consented: false,
  pushAd: () => undefined,
});

let scriptLoading: Promise<void> | null = null;

function loadAdSenseScript(client: string) {
  if (typeof document === 'undefined') return Promise.resolve();
  if (document.querySelector('script[data-adsense="sg16"]')) return Promise.resolve();
  if (scriptLoading) return scriptLoading;

  scriptLoading = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
    s.crossOrigin = 'anonymous';
    s.dataset.adsense = 'sg16';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('AdSense script failed'));
    document.head.appendChild(s);
  });

  return scriptLoading;
}

export function AdsProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [consented, setConsented] = useState(() =>
    typeof localStorage !== 'undefined' ? localStorage.getItem(CONSENT_KEY) === 'accepted' : false,
  );

  useEffect(() => {
    const onStorage = () => setConsented(localStorage.getItem(CONSENT_KEY) === 'accepted');
    window.addEventListener('storage', onStorage);
    const id = window.setInterval(onStorage, 800);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (!adsEnabled() || !consented || !ADSENSE_CLIENT) {
      setReady(false);
      return;
    }
    loadAdSenseScript(ADSENSE_CLIENT)
      .then(() => setReady(true))
      .catch(() => setReady(false));
  }, [consented]);

  const pushAd = useCallback(
    (element: HTMLElement) => {
      if (!ready || !consented || element.dataset.adPushed) return;
      element.dataset.adPushed = '1';
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        /* ignore */
      }
    },
    [ready, consented],
  );

  return <AdsContext.Provider value={{ ready, consented, pushAd }}>{children}</AdsContext.Provider>;
}

export function useAds() {
  return useContext(AdsContext);
}

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

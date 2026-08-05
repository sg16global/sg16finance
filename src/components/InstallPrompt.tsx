import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'sg16finance-install-dismissed';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
}

export default function InstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const deferred = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(STORAGE_KEY) || !isMobileDevice()) return;

    const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsIos(ios);

    if (ios) {
      setVisible(true);
      return;
    }

    function onInstallable(event: Event) {
      event.preventDefault();
      deferred.current = event as BeforeInstallPromptEvent;
      setVisible(true);
    }

    window.addEventListener('beforeinstallprompt', onInstallable);
    return () => window.removeEventListener('beforeinstallprompt', onInstallable);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  }

  async function install() {
    const prompt = deferred.current;
    if (!prompt) return;
    await prompt.prompt();
    await prompt.userChoice;
    dismiss();
  }

  if (!visible) return null;

  return (
    <div
      className="install-prompt fixed left-3 right-3 z-[95] rounded-xl border border-[#C76A16]/30 bg-[#131922]/98 p-4 shadow-2xl backdrop-blur-md md:hidden"
      style={{ bottom: 'calc(4.25rem + env(safe-area-inset-bottom))' }}
      role="dialog"
      aria-label="Install SG16 Finance app"
    >
      <div className="flex items-start gap-3">
        <img src="/apple-touch-icon.png" alt="" className="h-11 w-11 rounded-xl ring-1 ring-white/10" width={44} height={44} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">Install SG16 Finance</p>
          <p className="mt-1 text-xs leading-relaxed text-[#B6BDC8]">
            {isIos
              ? 'Tap Share → Add to Home Screen for full-screen app mode.'
              : 'Add to your home screen — works like a mobile app with live markets.'}
          </p>
          <div className="mt-3 flex gap-2">
            {!isIos && (
              <button type="button" onClick={install} className="fin-btn-primary px-4 py-2 text-xs">
                Install app
              </button>
            )}
            <button type="button" onClick={dismiss} className="fin-btn-ghost px-4 py-2 text-xs">
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

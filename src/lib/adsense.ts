/** AdSense slot IDs — set via Cloudflare Pages build env (VITE_*). */
export const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined;

export const AD_SLOTS: Record<string, string | undefined> = {
  'home-top': import.meta.env.VITE_ADSENSE_SLOT_HOME_TOP,
  'home-mid': import.meta.env.VITE_ADSENSE_SLOT_HOME_MID,
  'home-bottom': import.meta.env.VITE_ADSENSE_SLOT_HOME_BOTTOM,
  top: import.meta.env.VITE_ADSENSE_SLOT_PAGE_TOP,
  bottom: import.meta.env.VITE_ADSENSE_SLOT_PAGE_BOTTOM,
  sidebar: import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR,
};

export function adsEnabled() {
  return Boolean(ADSENSE_CLIENT?.startsWith('ca-pub-'));
}

export function slotFor(placement: string) {
  return AD_SLOTS[placement] || AD_SLOTS.top;
}

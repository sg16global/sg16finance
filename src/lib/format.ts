export function formatPct(value: number, signed = true): string {
  const prefix = signed && value >= 0 ? '+' : '';
  return `${prefix}${value.toFixed(2)}%`;
}

export function formatPrice(value: number): string {
  if (value >= 10000) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
  if (value >= 1000) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  }
  if (value >= 100) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  }
  if (value >= 1) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 4, minimumFractionDigits: 2 });
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 4, minimumFractionDigits: 4 });
}

export function formatUsd(value: number): string {
  if (value >= 1000) {
    return `$${formatPrice(value)}`;
  }
  return `$${formatPrice(value)}`;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.max(1, Math.floor(diff / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

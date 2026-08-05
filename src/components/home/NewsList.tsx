import type { NewsItem } from '../../types';

type Props = {
  items: NewsItem[];
  emptyLabel?: string;
};

function formatNewsTime(pubDate: string): string | null {
  if (!pubDate) return null;
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function NewsList({ items, emptyLabel = 'No headlines available right now.' }: Props) {
  if (!items.length) {
    return <p className="text-xs leading-relaxed text-[#7D8594]">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-2.5">
      {items.map((item) => {
        const when = formatNewsTime(item.publishedAt);
        return (
          <li key={`${item.url}-${item.title}`} className="fin-list-item">
            {item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs leading-relaxed text-[#B6BDC8] transition-colors hover:text-[#FF9A3C] md:text-sm"
              >
                {item.title}
              </a>
            ) : (
              <span className="text-xs leading-relaxed text-[#B6BDC8] md:text-sm">{item.title}</span>
            )}
            {when && <p className="mt-0.5 font-mono-data text-[9px] tabular-nums text-[#7D8594]">{when}</p>}
          </li>
        );
      })}
    </ul>
  );
}

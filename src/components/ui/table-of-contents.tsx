import { cn } from '@/lib/utils';
import { smoothScrollToId } from '@/lib/scrollSpy';
import { useSectionScrollSpy } from '@/hooks/use-section-scroll-spy';

export interface TocItem {
  id: string;
  label: string;
}

export interface TableOfContentsProps {
  items: TocItem[];
  title?: string;
  className?: string;
}

/** Sticky sidebar TOC — Harpia TableOfContents / TocSidebarLayout pattern. */
export function TableOfContents({ items, title = 'Nesta página', className }: TableOfContentsProps) {
  const sectionIds = items.map((item) => item.id);
  const activeId = useSectionScrollSpy(sectionIds, 0);

  if (items.length < 2) return null;

  return (
    <nav aria-label={title} className={cn('min-w-0', className)}>
      <p className="mb-4 px-2 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </p>
      <ol className="m-0 grid list-none gap-0.5 p-0">
        {items.map((item, i) => {
          const isActive = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? 'location' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  history.replaceState(null, '', `#${item.id}`);
                  smoothScrollToId(item.id);
                }}
                className={cn(
                  'flex items-baseline gap-2.5 rounded-lg border-l-2 px-2.5 py-2 text-[0.88rem] leading-snug no-underline transition-colors',
                  isActive
                    ? 'border-brand bg-[#fff4f1] font-bold text-brand-dark shadow-sm'
                    : 'border-transparent font-medium text-[#526357] hover:bg-soft hover:text-ink',
                )}
              >
                <span
                  className={cn(
                    'shrink-0 font-mono text-[0.68rem] font-bold tracking-wide',
                    isActive ? 'text-brand-dark' : 'text-[#8a968c]',
                  )}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

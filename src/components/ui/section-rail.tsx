import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { smoothScrollToId } from '@/lib/scrollSpy';
import { SECTION_RAIL_OFFSET, useSectionScrollSpy } from '@/hooks/use-section-scroll-spy';

export interface SectionRailItem {
  id: string;
  label: string;
}

export interface SectionRailProps {
  items: SectionRailItem[];
  label?: string;
  className?: string;
}

/**
 * Sticky in-page anchor nav, styled as a shadcn TabsList. Plain anchors work
 * without JS; the island only adds scroll-spy highlighting and smooth scroll.
 */
export function SectionRail({ items, label = 'Nesta página', className }: SectionRailProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const activeId = useSectionScrollSpy(
    items.map((item) => item.id),
    SECTION_RAIL_OFFSET,
  );

  useEffect(() => {
    const list = listRef.current;
    if (!activeId || !list) return;
    const link = list.querySelector<HTMLAnchorElement>(`a[href="#${CSS.escape(activeId)}"]`);
    if (link) list.scrollTo({ left: link.offsetLeft - list.offsetWidth / 2 + link.offsetWidth / 2 });
  }, [activeId]);

  if (items.length < 2) return null;

  return (
    <nav
      aria-label={label}
      data-print-hide
      className={cn('sticky top-16 z-30 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75', className)}
    >
      <div className="container flex items-center gap-3 py-2">
        <span className="hidden shrink-0 text-xs font-semibold text-muted-foreground md:inline">{label}</span>
        <ul
          ref={listRef}
          className="flex min-w-0 flex-1 list-none items-center gap-1 overflow-x-auto rounded-lg bg-muted p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => {
            const isActive = item.id === activeId;
            return (
              <li key={item.id} className="shrink-0">
                <a
                  href={`#${item.id}`}
                  aria-current={isActive ? 'location' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    history.replaceState(null, '', `#${item.id}`);
                    smoothScrollToId(item.id);
                  }}
                  className={cn(
                    'inline-flex h-8 items-center rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                    isActive ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

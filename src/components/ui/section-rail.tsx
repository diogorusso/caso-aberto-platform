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

/** Sticky horizontal section rail — Harpia PlaybookSectionNav composition. */
export function SectionRail({ items, label = 'Nesta página', className }: SectionRailProps) {
  const navRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const didMount = useRef(false);
  const sectionIds = items.map((item) => item.id);
  const activeId = useSectionScrollSpy(sectionIds, SECTION_RAIL_OFFSET);

  useEffect(() => {
    if (!activeId || !navRef.current || !listRef.current || !indicatorRef.current) return;
    const link = navRef.current.querySelector<HTMLAnchorElement>(`a[href="#${CSS.escape(activeId)}"]`);
    if (!link) return;
    const list = listRef.current;
    const indicator = indicatorRef.current;

    list.scrollTo({
      left: link.offsetLeft - list.offsetWidth / 2 + link.offsetWidth / 2,
      behavior: 'auto',
    });

    requestAnimationFrame(() => {
      if (!navRef.current) return;
      const left = link.getBoundingClientRect().left - navRef.current.getBoundingClientRect().left;
      const width = link.getBoundingClientRect().width;
      if (!didMount.current) {
        indicator.style.transitionDuration = '0s';
        indicator.style.transform = `translateX(${left}px)`;
        indicator.style.width = `${width}px`;
        requestAnimationFrame(() => {
          indicator.style.transitionDuration = '';
          didMount.current = true;
        });
      } else {
        indicator.style.transform = `translateX(${left}px)`;
        indicator.style.width = `${width}px`;
      }
    });
  }, [activeId]);

  if (items.length < 2) return null;

  return (
    <nav
      ref={navRef}
      aria-label={label}
      className={cn(
        'sticky top-[79px] z-20 border-b border-stroke/80 bg-paper/95 shadow-[0_8px_24px_rgba(21,28,25,0.04)] backdrop-blur-md',
        className,
      )}
    >
      <div className="container flex min-w-0 items-center gap-5 py-3">
        <span className="shrink-0 rounded-md bg-soft px-2 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </span>
        <ul
          ref={listRef}
          className="flex min-w-0 list-none flex-nowrap gap-1 overflow-x-auto p-0 [-ms-overflow-style:none] [scrollbar-width:none] md:flex-wrap md:overflow-visible [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item) => {
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
                    'inline-flex items-center whitespace-nowrap rounded-md px-3 py-1.5 text-[0.84rem] no-underline transition-colors',
                    isActive
                      ? 'bg-[#fff4f1] font-bold text-brand-dark'
                      : 'font-medium text-[#6a7a6e] hover:bg-soft hover:text-ink',
                  )}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
      <span
        ref={indicatorRef}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-0 rounded-t-sm bg-brand transition-[transform,width] duration-280 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none"
      />
    </nav>
  );
}

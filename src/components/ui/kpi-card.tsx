import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type KpiTone = 'light' | 'dark' | 'accent';

export interface KpiCardProps {
  label: string;
  value: ReactNode;
  note?: string;
  href?: string;
  hrefLabel?: string;
  tone?: KpiTone;
  className?: string;
}

const toneClass: Record<KpiTone, string> = {
  light: 'border-border/80 bg-soft/60 shadow-none',
  dark: 'border-transparent bg-forest text-white shadow-none',
  accent: 'border-[#ead7cf] bg-[#fff7f3] shadow-none',
};

/**
 * Harpia AdminKpiCard pattern — quiet muted surface, no heavy accent bar.
 */
export function KpiCard({
  label,
  value,
  note,
  href,
  hrefLabel = 'Abrir ↗',
  tone = 'light',
  className,
}: KpiCardProps) {
  return (
    <Card className={cn('flex min-w-0 flex-col rounded-xl p-0', toneClass[tone], className)}>
      <CardContent className="flex flex-1 flex-col gap-1.5 p-5">
        <span
          className={cn(
            'text-xs font-medium',
            tone === 'dark' ? 'text-[#d1ddd3]' : 'text-muted-foreground',
          )}
        >
          {label}
        </span>
        <strong
          className={cn(
            'text-[1.375rem] font-semibold tabular-nums tracking-tight break-words sm:text-[1.6rem]',
            tone === 'dark' ? 'text-white' : 'text-ink',
          )}
        >
          {value}
        </strong>
        {note ? (
          <small
            className={cn(
              'text-[0.8rem] leading-snug',
              tone === 'dark' ? 'text-[#d1ddd3]/80' : 'text-muted-foreground',
            )}
          >
            {note}
          </small>
        ) : null}
        {href ? (
          <a
            href={href}
            className={cn(
              'mt-auto pt-1 text-[0.8rem] font-bold no-underline hover:underline',
              tone === 'dark' ? 'text-[#ffb39c]' : 'text-brand-dark',
            )}
          >
            {hrefLabel}
          </a>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function KpiGrid({
  children,
  cols = 2,
  className,
}: {
  children: ReactNode;
  cols?: 2 | 4;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mb-0 grid gap-4',
        cols === 4
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          : 'grid-cols-1 md:grid-cols-2',
        className,
      )}
    >
      {children}
    </div>
  );
}

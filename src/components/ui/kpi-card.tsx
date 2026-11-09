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
  light: 'border-border bg-card border-t-4 border-t-brand-dark',
  dark: 'border-forest/40 bg-forest text-white border-t-4 border-t-brand shadow-none',
  accent: 'border-[#e8d0c2] bg-[#fff4ef] border-t-4 border-t-brand-dark',
};

/**
 * Harpia AdminKpiCard pattern — composes shadcn Card with CasoAberto tones.
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
    <Card className={cn('flex min-w-0 flex-col gap-2.5 rounded-xl p-0 shadow-sm', toneClass[tone], className)}>
      <CardContent className="flex flex-1 flex-col gap-2.5 p-6 pt-5">
        <span
          className={cn(
            'text-[0.72rem] font-extrabold uppercase tracking-[0.1em]',
            tone === 'dark' ? 'text-[#ffb39c]' : 'text-brand-dark',
          )}
        >
          {label}
        </span>
        <strong
          className={cn(
            'block text-[clamp(1.7rem,2.8vw,2.8rem)] font-black leading-[1.08] tracking-[-0.06em] break-words',
            tone === 'dark' ? 'text-white' : 'text-ink',
          )}
        >
          {value}
        </strong>
        {note ? (
          <small
            className={cn(
              'text-[0.84rem] leading-snug',
              tone === 'dark' ? 'text-[#d1ddd3]' : 'text-muted-foreground',
            )}
          >
            {note}
          </small>
        ) : null}
        {href ? (
          <a
            href={href}
            className={cn(
              'mt-auto text-[0.82rem] font-extrabold no-underline hover:underline',
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
        'grid gap-3',
        cols === 4
          ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4'
          : 'grid-cols-1 md:grid-cols-2',
        className,
      )}
    >
      {children}
    </div>
  );
}

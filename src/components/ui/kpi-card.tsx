import type { ReactNode } from 'react';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type KpiTone = 'default' | 'muted' | 'dark' | 'accent';

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
  default: '',
  muted: 'bg-muted shadow-none',
  dark: 'border-forest bg-forest text-forest-foreground shadow-none',
  accent: 'border-brand-strong/20 bg-brand-soft shadow-none',
};

/** shadcn dashboard "section-cards" pattern: label, big value, footnote. */
export function KpiCard({ label, value, note, href, hrefLabel = 'Abrir ↗', tone = 'default', className }: KpiCardProps) {
  const dark = tone === 'dark';
  return (
    <Card className={cn('min-w-0 gap-3 py-5', toneClass[tone], className)}>
      <CardHeader className="gap-1.5 px-5">
        <CardDescription className={cn(dark && 'text-forest-foreground/75')}>{label}</CardDescription>
        <CardTitle className="text-2xl font-bold tracking-tight tabular-nums break-words">{value}</CardTitle>
      </CardHeader>
      {note || href ? (
        <CardFooter className="mt-auto flex-col items-start gap-1.5 px-5 text-xs leading-snug">
          {note ? <span className={cn(dark ? 'text-forest-foreground/70' : 'text-muted-foreground')}>{note}</span> : null}
          {href ? (
            <a
              href={href}
              className={cn('font-semibold underline-offset-4 hover:underline', dark ? 'text-brand' : 'text-brand-strong')}
            >
              {hrefLabel}
            </a>
          ) : null}
        </CardFooter>
      ) : null}
    </Card>
  );
}

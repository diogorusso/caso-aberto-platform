import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type SurfaceCardVariant = 'surface' | 'dark' | 'soft';

export interface SurfaceCardProps {
  label?: string;
  title?: string;
  description?: string;
  status?: string;
  href?: string;
  external?: boolean;
  variant?: SurfaceCardVariant;
  children?: ReactNode;
  className?: string;
}

const variantClass: Record<SurfaceCardVariant, string> = {
  surface: 'bg-card text-card-foreground',
  soft: 'bg-soft text-card-foreground',
  dark: 'border-[#2a4639] bg-[#1c3228] text-white',
};

/**
 * Harpia SurfaceCard pattern — shadcn Card with numbered eyebrow + hit-target link.
 */
export function SurfaceCard({
  label,
  title,
  description,
  status,
  href,
  external = false,
  variant = 'surface',
  children,
  className,
}: SurfaceCardProps) {
  const isLink = Boolean(href);
  const hasBody = Boolean(children || status || isLink);

  return (
    <Card
      className={cn(
        'group relative flex min-w-0 flex-col gap-3 rounded-xl border-border p-0 shadow-sm transition-all duration-250 hover:-translate-y-0.5 hover:border-[#c7b0a8] hover:shadow-[0_16px_40px_rgba(21,28,25,0.07)]',
        isLink && 'pb-4',
        variantClass[variant],
        className,
      )}
    >
      <CardHeader className={cn('space-y-2 p-6', hasBody ? 'pb-0' : 'pb-6')}>
        {label ? (
          <span
            className={cn(
              'text-[0.7rem] font-extrabold uppercase tracking-[0.12em]',
              variant === 'dark' ? 'text-[#ffb39c]' : 'text-brand-dark',
            )}
          >
            {label}
          </span>
        ) : null}
        {title ? (
          <CardTitle className={cn('text-[1.12rem] leading-snug tracking-[-0.02em]', variant === 'dark' && 'text-white')}>
            {title}
          </CardTitle>
        ) : null}
        {description ? (
          <CardDescription className={cn('text-[0.9rem] leading-relaxed', variant === 'dark' && 'text-[#d1ddd3]')}>
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>
      {hasBody ? (
        <CardContent className="flex flex-col gap-3 p-6 pt-3">
          {status ? (
            <Badge variant="secondary" className="w-fit rounded-full text-[0.72rem] uppercase tracking-wide">
              {status}
            </Badge>
          ) : null}
          {children}
          {isLink && href ? (
            <>
              <a
                className="absolute inset-0 z-[2] rounded-[inherit] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark"
                href={href}
                aria-label={title}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
              />
              <span
                aria-hidden="true"
                className={cn(
                  'pointer-events-none absolute bottom-[18px] right-[18px] z-[1] grid size-9 place-items-center rounded-full border border-border bg-white text-[0.95rem] text-ink transition-all duration-200 group-hover:rotate-[-45deg] group-hover:border-black group-hover:bg-black group-hover:text-white',
                  variant === 'dark' &&
                    'border-[#4a6658] bg-transparent text-white group-hover:border-[#ff9585] group-hover:bg-[#ff9585] group-hover:text-[#1a100e]',
                )}
              >
                ↗
              </span>
            </>
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  );
}

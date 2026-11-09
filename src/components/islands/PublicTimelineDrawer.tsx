'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export type PublicTimelineEntry = {
  date: string;
  dateLabel: string;
  note: string;
  sourceUrl: string;
};

export type PublicTimelineRow = {
  key: string;
  label: string;
  entries: PublicTimelineEntry[];
};

export type PublicTimelineDrawerProps = {
  brand: string;
  stageLabel: string;
  stageTone?: 'bankrupt' | 'recovery' | 'other';
  detailHref: string;
  rows: PublicTimelineRow[];
  notDocumentedLabel?: string;
  sourceLabel?: string;
  triggerLabel?: string;
  detailLinkLabel?: string;
  className?: string;
};

const stageClass: Record<NonNullable<PublicTimelineDrawerProps['stageTone']>, string> = {
  bankrupt: 'bg-brand text-brand-foreground',
  recovery: 'bg-warning-soft text-warning',
  other: 'bg-muted text-foreground',
};

export default function PublicTimelineDrawer({
  brand,
  stageLabel,
  stageTone = 'other',
  detailHref,
  rows,
  notDocumentedLabel = 'não documentado',
  sourceLabel = 'Fonte',
  triggerLabel = 'Linha do tempo pública',
  detailLinkLabel = 'Abrir cronologia e análise',
  className,
}: PublicTimelineDrawerProps) {
  const documented = rows.reduce((n, row) => n + row.entries.length, 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn('w-full justify-between gap-2 sm:w-auto', className)}
        >
          <span>{triggerLabel}</span>
          <span className="font-mono text-xs text-muted-foreground">{documented} sinais</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto p-0 sm:max-w-md"
      >
        <SheetHeader className="sticky top-0 z-10 border-b bg-background">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex px-2 py-0.5 text-[0.65rem] font-semibold uppercase leading-tight',
                stageClass[stageTone],
              )}
            >
              {stageLabel}
            </span>
          </div>
          <SheetTitle className="text-left text-xl">{brand}</SheetTitle>
          <SheetDescription className="text-left">
            Linha do tempo pública de sinais documentados. Cada entrada tem data e fonte — ou fica explicitamente sem registro.
          </SheetDescription>
        </SheetHeader>

        <ul className="m-0 list-none divide-y p-0">
          {rows.map((row) => (
            <li key={row.key} className="space-y-1.5 px-4 py-4">
              <p className="m-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {row.label}
              </p>
              {row.entries.length > 0 ? (
                row.entries.map((entry, i) => (
                  <div key={`${row.key}-${entry.date}-${i}`} className="space-y-0.5">
                    <span className="flex items-center gap-1.5 font-semibold text-forest">
                      <span aria-hidden="true">✔</span>
                      <time dateTime={entry.date} className="text-foreground">
                        {entry.dateLabel}
                      </time>
                    </span>
                    <span className="block text-xs text-muted-foreground">{entry.note}</span>
                    <a
                      className="inline-block text-xs font-semibold text-brand-strong"
                      href={entry.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {sourceLabel} ↗
                    </a>
                  </div>
                ))
              ) : (
                <span className="text-xs italic text-muted-foreground">{notDocumentedLabel}</span>
              )}
            </li>
          ))}
        </ul>

        <div className="sticky bottom-0 border-t bg-background p-4">
          <Button asChild variant="brand" className="w-full">
            <a href={detailHref}>{detailLinkLabel} ↗</a>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import {
  formatVisibilityCount,
  visibilityFromInput,
  type VisibilityInput,
} from '@/lib/case-visibility-model'
import { copy } from '@/lib/copy'
import { cn } from '@/lib/utils'

type Props = {
  input: VisibilityInput
  tone?: 'light' | 'inverse'
  className?: string
}

const t = copy.visibility

function LiveDot() {
  return (
    <span className="visibility-live-dot" aria-hidden="true">
      <svg viewBox="0 0 8 8" width="7" height="7" className="block overflow-visible">
        <circle className="visibility-live-dot__core" cx="4" cy="4" r="2.2" />
        <circle className="visibility-live-dot__pulse" cx="4" cy="4" r="2.2" fill="none" />
      </svg>
    </span>
  )
}

export default function CaseVisibilityCounter({ input, tone = 'light', className }: Props) {
  const [snapshot] = useState(() => visibilityFromInput(input, new Date()))
  const today = formatVisibilityCount(snapshot.today)
  const inverse = tone === 'inverse'

  return (
    <div
      className={cn(
        'case-visibility-metric mt-3 flex w-fit max-w-full flex-col items-start justify-start text-left',
        inverse
          ? 'border border-white/15 bg-white/5 px-4 py-3'
          : 'border border-border bg-muted/60 px-3.5 py-2.5',
        className,
      )}
      role="group"
      aria-label={`${today} ${t.metricLabel}. ${t.label}`}
    >
      <span className="flex items-center gap-2">
        <AlertTriangle
          className={cn('shrink-0', inverse ? 'text-brand' : 'text-brand-strong')}
          size={15}
          strokeWidth={2}
          aria-hidden="true"
        />
        <span
          className={cn(
            'case-visibility-metric__count text-sm tabular-nums',
            inverse ? 'text-white' : 'text-foreground',
          )}
        >
          {today}
        </span>
        <span
          className={cn(
            'text-[0.625rem] font-semibold uppercase tracking-[0.16em]',
            inverse ? 'text-brand' : 'text-brand-strong',
          )}
        >
          {t.metricLabel}
        </span>
      </span>
      <span
        className={cn(
          'mt-3 flex flex-wrap items-center justify-start gap-x-1.5 gap-y-1 text-left text-[0.8125rem] font-normal leading-snug tracking-wide',
          inverse ? 'text-white/80' : 'text-foreground/75',
        )}
      >
        <span>{t.seen}</span>
        <span className="inline-flex items-center gap-1.5">
          <LiveDot />
          <span className={inverse ? 'font-medium text-white' : 'font-medium text-foreground'}>
            {t.silent}
          </span>
        </span>
      </span>
    </div>
  )
}

import {
  formatDate,
  signalRows,
  type Precedent,
  type PrecedentSignal,
} from './precedents';
import type { PublicTimelineRow } from '@/components/islands/PublicTimelineDrawer';

function groupSignals(signals: PrecedentSignal[] | undefined) {
  const out: Record<string, PrecedentSignal[]> = {};
  for (const s of signals ?? []) (out[s.key] ||= []).push(s);
  return out;
}

/** Build drawer rows for a precedent (all signal_rows, documented or empty). */
export function publicTimelineRowsForPrecedent(p: Precedent): PublicTimelineRow[] {
  const byKey = groupSignals(p.signals);
  return signalRows.map((row) => ({
    key: row.key,
    label: row.label,
    entries: (byKey[row.key] ?? []).map((s) => ({
      date: s.date,
      dateLabel: formatDate(s.date),
      note: s.note,
      sourceUrl: s.source_url,
    })),
  }));
}

export function publicTimelineRowsFromMap(
  byKey: Record<string, Array<{ date: string; note?: string; source_url: string }>>,
): PublicTimelineRow[] {
  return signalRows.map((row) => ({
    key: row.key,
    label: row.label,
    entries: (byKey[row.key] ?? []).map((s) => ({
      date: s.date,
      dateLabel: formatDate(s.date),
      note: s.note ?? '',
      sourceUrl: s.source_url,
    })),
  }));
}

export function precedentStageTone(
  stage: Precedent['stage'],
): 'bankrupt' | 'recovery' | 'other' {
  if (stage === 'falencia_decretada') return 'bankrupt';
  if (stage === 'recuperacao_judicial') return 'recovery';
  return 'other';
}

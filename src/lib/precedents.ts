import raw from '../data/precedents.json';
export type Precedent = typeof raw.precedents[number];
export type PrecedentSource = Precedent['sources'][number];
export type TimelineEvent = Precedent['timeline'][number];
export type PrecedentSignal = NonNullable<Precedent['signals']>[number];
export type SignalRow = (typeof raw.signal_rows)[number];
export const precedents: Precedent[] = raw.precedents;
export const signalRows: SignalRow[] = raw.signal_rows;
export const precedentPath = (p: Pick<Precedent, 'slug'>) => '/precedentes/' + p.slug + '/';
export const linkedPrecedents = (caseId: string) => {
  const link = raw.case_links.find((x) => x.case_id === caseId);
  return link ? link.precedent_ids.map((id) => precedents.find((p) => p.id === id)).filter((p): p is Precedent => Boolean(p)) : [];
};
export const linkageForCase = (id: string) => raw.case_links.find((x) => x.case_id === id);
export const comparisonPath = (slug: string) => '/casos/' + slug + '/precedentes/';
export const daysUtc = (from: string, to: string) => Math.round((Date.parse(to + 'T00:00:00.000Z') - Date.parse(from + 'T00:00:00.000Z')) / 86400000);
export const formatDate = (iso: string) => iso.split('-').reverse().join('/');
export const brlCompact = (n: number) => new Intl.NumberFormat('pt-BR', { notation: 'compact', compactDisplay: 'short', style: 'currency', currency: 'BRL', maximumFractionDigits: 1 }).format(n);
export const stageDescription = (stage: string) => raw.stage_definitions[stage as keyof typeof raw.stage_definitions] || 'Desfecho em atualização';
/** Only publish elapsed days when both milestone dates are unambiguous. */
export const precedentDuration = (p: Precedent) => ('date_disputed' in p && p.date_disputed === true) ? null : p.bankruptcy_decree_date ? daysUtc(p.start_date, p.bankruptcy_decree_date) : p.recovery_acceptance_date ? daysUtc(p.start_date, p.recovery_acceptance_date) : null;
export const researchMethodology = raw.common_analysis;

export interface PrecedentEndpoint {
  date: string;
  label: string;
  kind: 'falencia' | 'recuperacao';
}
/** The verified dated end of a precedent: a bankruptcy decree or, if none, the RJ processing decision. Never an inferred date. */
export function precedentEndpoint(p: Precedent): PrecedentEndpoint | null {
  if ('date_disputed' in p && p.date_disputed === true && !p.bankruptcy_decree_date) return null;
  if (p.bankruptcy_decree_date) return { date: p.bankruptcy_decree_date, label: 'sentença de falência', kind: 'falencia' };
  if (p.recovery_acceptance_date) return { date: p.recovery_acceptance_date, label: 'deferimento da recuperação judicial', kind: 'recuperacao' };
  return null;
}

export interface FirstPublicSignal {
  date: string;
  source_url: string;
  note?: string;
  /** What the date actually is (named event), never a claimed inception of a crisis. */
  label: string;
}
export function firstPublicSignal(p: Precedent): FirstPublicSignal | null {
  const first = p.first_public_signal;
  if (first) return { date: first.date, source_url: first.source_url, note: first.note, label: 'primeiro sinal público identificado' };
  if (p.start_date && p.sources?.[0]?.url) return { date: p.start_date, source_url: p.sources[0].url, label: p.start_kind };
  return null;
}

export interface PrecedentSpan {
  precedent: Precedent;
  from: FirstPublicSignal;
  to: PrecedentEndpoint;
  days: number;
}
/** Bars rendered above the matrix: from the first identified public signal to the verified endpoint. */
export function collapseSpans(): PrecedentSpan[] {
  const spans: PrecedentSpan[] = [];
  for (const p of precedents) {
    const from = firstPublicSignal(p);
    const to = precedentEndpoint(p);
    if (!from || !to) continue;
    spans.push({ precedent: p, from, to, days: daysUtc(from.date, to.date) });
  }
  return spans.sort((a, b) => a.days - b.days);
}

export interface DurationStat { id: string; brand: string; days: number }
export interface DurationSummary { count: number; avgDays: number; items: DurationStat[] }
/** Aggregate of every decreed bankruptcy precedent that has two verified dated events. Computed, never hand-typed. */
export function bankruptcyDurationSummary(): DurationSummary {
  const items: DurationStat[] = [];
  for (const p of precedents) {
    if (p.stage !== 'falencia_decretada' || !p.bankruptcy_decree_date) continue;
    const from = firstPublicSignal(p);
    if (!from) continue;
    items.push({ id: p.id, brand: p.brand, days: daysUtc(from.date, p.bankruptcy_decree_date) });
  }
  const avgDays = items.length ? Math.round(items.reduce((sum, i) => sum + i.days, 0) / items.length) : 0;
  return { count: items.length, avgDays, items };
}

export function signalsByKey(p: Precedent): Record<string, PrecedentSignal[]> {
  const map: Record<string, PrecedentSignal[]> = {};
  for (const s of p.signals || []) (map[s.key] ||= []).push(s);
  return map;
}

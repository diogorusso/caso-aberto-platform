/**
 * Pure visibility projection model — safe for Astro and browser scripts.
 * No catalog/data imports.
 */

export type VisibilityInput = {
  id: string;
  kind: 'caso' | 'historia';
  featured: boolean;
  categorySlug: string;
  sourceCount: number;
  storyCount: number;
  date: string;
};

export type VisibilitySnapshot = {
  id: string;
  today: number;
  lifetime: number;
  dailyTarget: number;
  dayFraction: number;
  asOf: string;
};

const TZ = 'America/Sao_Paulo';
const MODEL_EPOCH = Date.UTC(2025, 0, 1);

const CATEGORY_WEIGHT: Record<string, number> = {
  'moveis-e-casa': 1.35,
  'moveis-planejados': 1.35,
  'viagens-e-turismo': 1.18,
  'energia-e-utilidades': 1.22,
  'varejo-e-entrega': 1.12,
  'ingressos-e-eventos': 1.28,
  'assinaturas-e-streaming': 1.08,
  'politica-e-direitos': 1.45,
  'plataformas-digitais': 1.4,
};

function hash32(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function unit(seed: number, salt: number): number {
  return ((seed ^ Math.imul(salt, 0x9e3779b9)) >>> 0) / 0xffffffff;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function saoPauloParts(at: Date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(at);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value || 0);
  const year = get('year');
  const month = get('month');
  const day = get('day');
  const hour = get('hour');
  const minute = get('minute');
  const second = get('second');
  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    dayKey: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    dayFraction: (hour * 3600 + minute * 60 + second) / 86400,
  };
}

export function visibilityDayProgress(dayFraction: number): number {
  const t = clamp(dayFraction, 0, 1);
  const segments: Array<[number, number]> = [
    [0.25, 0.09],
    [0.5, 0.31],
    [0.75, 0.37],
    [1, 0.23],
  ];
  let start = 0;
  let accrued = 0;
  for (const [until, weight] of segments) {
    const span = until - start;
    if (t <= until) {
      const local = (t - start) / span;
      const eased = local * local * (3 - 2 * local);
      return accrued + weight * eased;
    }
    accrued += weight;
    start = until;
  }
  return 1;
}

function parseIsoDate(iso: string): number {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return MODEL_EPOCH;
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function daysBetweenUtc(fromMs: number, toMs: number): number {
  return Math.max(0, Math.floor((toMs - fromMs) / 86_400_000));
}

export function dailyVisibilityTarget(input: VisibilityInput, dayKey: string): number {
  const seed = hash32(`${input.id}|${dayKey}|visibility`);
  const base = input.featured ? 318_000 : input.kind === 'caso' ? 54_000 : 21_000;
  const sourceBoost = 1 + Math.min(input.sourceCount, 28) * 0.055;
  const storyBoost = 1 + Math.min(input.storyCount, 8) * 0.09;
  const categoryBoost = CATEGORY_WEIGHT[input.categorySlug] ?? 1;
  const kindBoost = input.kind === 'caso' ? 1 : 0.72;
  const featuredBoost = input.featured ? 1.55 : 1;
  const jitter = 0.88 + unit(seed, 11) * 0.28;
  return Math.round(base * sourceBoost * storyBoost * categoryBoost * kindBoost * featuredBoost * jitter);
}

function priorLifetimeTotal(input: VisibilityInput, nowParts = saoPauloParts()): number {
  const startMs = Math.max(parseIsoDate(input.date), MODEL_EPOCH);
  const todayMs = Date.UTC(nowParts.year, nowParts.month - 1, nowParts.day);
  const elapsed = daysBetweenUtc(startMs, todayMs);
  if (elapsed <= 0) return 0;
  const window = Math.min(elapsed, 120);
  let total = 0;
  for (let i = 1; i <= window; i++) {
    const past = new Date(todayMs - i * 86_400_000);
    const key = past.toISOString().slice(0, 10);
    const decay = 0.72 + 0.28 * (1 - (i - 1) / window);
    total += Math.round(dailyVisibilityTarget(input, key) * decay);
  }
  if (elapsed > window) {
    const floorSeed = hash32(`${input.id}|floor`);
    const avg = dailyVisibilityTarget(input, `${input.id}-avg`);
    total += Math.round(avg * (elapsed - window) * (0.35 + unit(floorSeed, 7) * 0.2));
  }
  return total;
}

export function visibilityFromInput(input: VisibilityInput, at: Date = new Date()): VisibilitySnapshot {
  const parts = saoPauloParts(at);
  const progress = visibilityDayProgress(parts.dayFraction);
  const dailyTarget = dailyVisibilityTarget(input, parts.dayKey);
  const today = Math.max(1, Math.round(dailyTarget * progress));
  const lifetime = priorLifetimeTotal(input, parts) + today;
  return {
    id: input.id,
    today,
    lifetime,
    dailyTarget,
    dayFraction: parts.dayFraction,
    asOf: at.toISOString(),
  };
}

export function formatVisibilityCount(value: number): string {
  return value.toLocaleString('pt-BR');
}

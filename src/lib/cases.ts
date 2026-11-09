import rawCases from '../data/casos.json';
import rawReports from '../data/relatos.json';
import rawMetrics from '../data/metrics.json';
import rawUpdates from '../data/updates.json';
import rawLeadership from '../data/leadership.json';
import rawRoma from '../data/roma.json';
import rawStatements from '../data/statements.json';

export type Source = { titulo: string; tipo?: string; url: string };
export type Moment = { data: string; titulo: string; texto: string };
export type Request = { titulo: string; texto: string };
export type CollapseSignal = { key: string; date: string; source_url: string; note?: string };
export type Case = {
  id: string;
  slug: string;
  empresa: string;
  empresa_resumo: string;
  empresa_slug?: string;
  unidade_slug?: string;
  local: string;
  categoria: string;
  titulo: string;
  chamada: string;
  resumo: string;
  impacto?: string;
  status: string;
  status_data: string;
  data_publicacao: string;
  valor_brl?: number;
  prazo_original?: string;
  prazo_posterior?: string;
  procon_protocol?: string;
  legal_entity_note?: string;
  cronologia: Moment[];
  pedidos: Request[];
  fontes: Source[];
  imprensa_perguntas?: string[];
  collapse_signals?: CollapseSignal[];
};
export type Report = {
  id: string;
  case_id?: string;
  data: string;
  cidade: string;
  tema: string;
  status: string;
  titulo: string;
  resumo: string;
  url: string;
  destaque?: boolean;
  company?: string;
  unit?: string | null;
  location?: string;
  source_name?: string;
  source_url?: string;
  published_at?: string;
  last_checked_at?: string;
  issue_type?: string;
  headline?: string;
  summary?: string;
  evidence_type?: string;
  verification?: string;
  notes?: string;
};

export type CaseUpdate = {
  id: string;
  case_id: string;
  date: string;
  title: string;
  summary: string;
  source_url?: string | null;
};

export const cases: Case[] = rawCases as Case[];
export const reports: Report[] = rawReports as Report[];
export const updates: CaseUpdate[] = rawUpdates as CaseUpdate[];
export const metrics = rawMetrics as typeof rawMetrics;
export const leadership = rawLeadership as typeof rawLeadership;
export const roma = rawRoma as typeof rawRoma;
export const statements = rawStatements as typeof rawStatements;

export const casePath = (item: Case) => `/casos/${item.slug}/`;
export const reportsFor = (item: Case) => reports.filter((r) => (r.case_id ?? 'CA-001') === item.id);
export const updatesFor = (item: Case) => updates.filter((u) => u.case_id === item.id).sort((a, b) => b.date.localeCompare(a.date));
export const metricsFor = (item: Case) => metrics.cases[item.id as keyof typeof metrics.cases];
export const brl = (amount: number) => new Intl.NumberFormat('pt-BR', {style:'currency',currency:'BRL',maximumFractionDigits:0}).format(amount);
export const dateBR = (date: string) => new Intl.DateTimeFormat('pt-BR', {timeZone:'UTC'}).format(new Date(`${date}T12:00:00Z`));
export const crumbFor = (item: Case) => [
  {label:'Início', href:'/'},
  {label:'Casos', href:'/casos/'},
  {label:item.empresa_resumo, href:casePath(item)}
];
export const findCase = (slug: string) => cases.find((c) => c.slug === slug);
export const siteOrigin = 'https://casoaberto.pages.dev';

import rawCases from '../data/casos.json';
import rawReports from '../data/relatos.json';

export type Source = { titulo: string; tipo?: string; url: string };
export type Moment = { data: string; titulo: string; texto: string };
export type Request = { titulo: string; texto: string };
export type Case = {
  id: string;
  slug: string;
  empresa: string;
  empresa_resumo: string;
  local: string;
  categoria: string;
  titulo: string;
  chamada: string;
  resumo: string;
  status: string;
  status_data: string;
  data_publicacao: string;
  valor_brl?: number;
  prazo_original?: string;
  prazo_posterior?: string;
  cronologia: Moment[];
  pedidos: Request[];
  fontes: Source[];
  imprensa_perguntas?: string[];
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
};

export const cases: Case[] = rawCases as Case[];
export const reports: Report[] = rawReports as Report[];
export const casePath = (item: Case) => `/casos/${item.slug}/`;
export const reportsFor = (item: Case) => reports.filter((r) => (r.case_id ?? 'CA-001') === item.id);
export const brl = (amount: number) => new Intl.NumberFormat('pt-BR', {style:'currency',currency:'BRL',maximumFractionDigits:0}).format(amount);
export const dateBR = (date: string) => new Intl.DateTimeFormat('pt-BR', {timeZone:'UTC'}).format(new Date(`${date}T12:00:00Z`));
export const crumbFor = (item: Case) => [
  {label:'Início', href:'/'},
  {label:'Casos', href:'/casos/'},
  {label:item.empresa_resumo, href:casePath(item)}
];

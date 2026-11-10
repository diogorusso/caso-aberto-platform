/** Browser-only, user-owned draft model. No network or background submission. */
export const WORKSPACE_VERSION = 1 as const;
export type CauseDomain = 'consumo' | 'comunidade' | 'servico-publico' | 'plataformas' | 'outro';
export type EvidenceStatus = 'relato' | 'documento' | 'resposta' | 'decisao' | 'analise';
export type CauseStatus = 'em-preparacao' | 'em-acompanhamento' | 'respondida' | 'encerrada';
export type RequestStatus = 'rascunho' | 'enviada-externamente' | 'respondida' | 'encerrada';
export interface Evidence {
  id: string; title: string; url: string; date: string; kind: EvidenceStatus;
  summary: string; limitations: string; created_at: string;
}
export interface CauseTask {
  id: string; title: string; deadline: string; completed: boolean; created_at: string;
}
export interface PublicRequest {
  id: string; title: string; institution: string; question: string; due_date: string;
  status: RequestStatus; evidence_ids: string[]; created_at: string;
}
export interface CauseUpdate { id: string; title: string; detail: string; date: string }
export interface Cause {
  id: string; title: string; domain: CauseDomain; objective: string; jurisdiction: string;
  status: CauseStatus; created_at: string; updated_at: string;
  evidence: Evidence[]; tasks: CauseTask[]; requests: PublicRequest[]; updates: CauseUpdate[];
}
export interface Workspace { version: typeof WORKSPACE_VERSION; causes: Cause[] }
export const blankWorkspace = (): Workspace => ({ version: 1, causes: [] });
export const today = () => new Date().toISOString().slice(0, 10);
export const uniqueId = (): string => crypto.randomUUID();
const limit = (s: unknown, size: number, field: string): string => {
  if (typeof s !== 'string' || s.length > size) throw new Error('Campo inválido: ' + field);
  return s.trim();
};
const valueIn = <T extends string>(value: unknown, allowed: readonly T[], field: string): T => {
  if (!allowed.includes(value as T)) throw new Error('Valor inválido: ' + field);
  return value as T;
};
const obj = (v: unknown, name: string): Record<string, unknown> => {
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error('Registro inválido: ' + name);
  return v as Record<string, unknown>;
};
const list = <T>(v: unknown, parser: (x: unknown) => T, field: string, cap: number): T[] => {
  if (!Array.isArray(v) || v.length > cap) throw new Error('Lista inválida: ' + field);
  return v.map(parser);
};
const date = (v: unknown, field: string): string => {
  const s = limit(v, 10, field);
  if (s && (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(Date.parse(s)))) throw new Error('Data inválida: ' + field);
  return s;
};
const id = (v: unknown, field: string) => {
  const s = limit(v, 80, field);
  if (!/^[a-zA-Z0-9_-]+$/.test(s)) throw new Error('ID inválido: ' + field);
  return s;
};
const url = (v: unknown) => {
  const s = limit(v, 2048, 'URL');
  try { const link = new URL(s); if (!['https:', 'http:'].includes(link.protocol)) throw new Error(); }
  catch { throw new Error('Informe uma URL pública http(s) válida para a fonte.'); }
  return s;
};
export function validateWorkspace(data: unknown): Workspace {
  const v = obj(data, 'arquivo');
  if (v.version !== WORKSPACE_VERSION) throw new Error('Versão de arquivo não suportada.');
  const causes = list(v.causes, (item): Cause => {
    const c = obj(item, 'causa');
    const evidence = list(c.evidence, (entry): Evidence => {
      const e = obj(entry, 'evidência');
      return {
        id: id(e.id, 'evidência'), title: limit(e.title, 200, 'título de evidência'),
        url: url(e.url), date: date(e.date, 'data da evidência'),
        kind: valueIn(e.kind, ['relato', 'documento', 'resposta', 'decisao', 'analise'] as const, 'tipo de evidência'),
        summary: limit(e.summary, 1500, 'descrição'), limitations: limit(e.limitations, 1200, 'limites'),
        created_at: date(e.created_at, 'data de criação')
      };
    }, 'evidências', 200);
    const evidenceIds = new Set(evidence.map(e => e.id));
    if (evidenceIds.size !== evidence.length) throw new Error('IDs repetidos nas fontes.');
    const requests = list(c.requests, (entry): PublicRequest => {
      const r = obj(entry, 'pedido');
      const related = list(r.evidence_ids, v => id(v, 'referência'), 'vínculos', 25);
      if (related.some(sourceId => !evidenceIds.has(sourceId))) throw new Error('Pedido com fonte desconhecida.');
      return { id: id(r.id, 'pedido'), title: limit(r.title, 200, 'título'),
        institution: limit(r.institution, 160, 'destinatário'), question: limit(r.question, 1600, 'pergunta'),
        due_date: date(r.due_date, 'prazo'), status: valueIn(r.status, ['rascunho', 'enviada-externamente', 'respondida', 'encerrada'] as const, 'status pedido'),
        evidence_ids: related, created_at: date(r.created_at, 'criado em') };
    }, 'pedidos', 100);
    const tasks = list(c.tasks, (entry): CauseTask => {
      const t = obj(entry, 'tarefa');
      if (typeof t.completed !== 'boolean') throw new Error('Status inválido de tarefa.');
      return { id: id(t.id, 'tarefa'), title: limit(t.title, 200, 'tarefa'), deadline: date(t.deadline, 'prazo'),
        completed: t.completed, created_at: date(t.created_at, 'criado em') };
    }, 'tarefas', 250);
    const updates = list(c.updates, (entry): CauseUpdate => {
      const u = obj(entry, 'atualização');
      return { id: id(u.id, 'atualização'), title: limit(u.title, 180, 'título'), detail: limit(u.detail, 1400, 'descrição'),
        date: date(u.date, 'data') };
    }, 'atualizações', 150);
    const allIds = [...evidence, ...requests, ...tasks, ...updates].map(x => x.id);
    if (new Set(allIds).size !== allIds.length) throw new Error('IDs repetidos na causa.');
    return {
      id: id(c.id, 'causa'), title: limit(c.title, 160, 'causa'),
      domain: valueIn(c.domain, ['consumo', 'comunidade', 'servico-publico', 'plataformas', 'outro'] as const, 'domínio'),
      objective: limit(c.objective, 1600, 'objetivo'), jurisdiction: limit(c.jurisdiction, 120, 'localidade'),
      status: valueIn(c.status, ['em-preparacao', 'em-acompanhamento', 'respondida', 'encerrada'] as const, 'status'),
      created_at: date(c.created_at, 'criado em'), updated_at: date(c.updated_at, 'atualizado em'),
      evidence, requests, tasks, updates
    };
  }, 'causas', 50);
  if (new Set(causes.map(c => c.id)).size !== causes.length) throw new Error('ID de causa repetido.');
  return {version: WORKSPACE_VERSION, causes};
}
export function createCause(title: string, domain: CauseDomain, objective: string, jurisdiction: string): Cause {
  const now = today();
  return {id: uniqueId(), title: title.trim().slice(0, 160), domain, objective: objective.trim().slice(0, 1600),
    jurisdiction: jurisdiction.trim().slice(0, 120), status: 'em-preparacao', created_at: now,
    updated_at: now, evidence: [], tasks: [], requests: [], updates: [] };
}
export function updateCause(workspace: Workspace, causeId: string, updater: (cause: Cause) => Cause): Workspace {
  return {...workspace, causes: workspace.causes.map(c =>
    c.id === causeId ? {...updater(c), updated_at: today()} : c)};
}

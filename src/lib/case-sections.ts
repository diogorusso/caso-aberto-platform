/**
 * Case information architecture: the single source of truth for every case sub-route.
 *
 * - URLs never change here (AGENTS.md §7): we only group and label existing routes.
 * - CaseSectionHub renders the 4 groups; pages use `nextStep()` / `sectionHref()` instead of
 *   hand-written links, so each destination is linked once, from the right place.
 */
import { type Case, casePath } from './cases';
import { linkageForCase } from './precedents';
import { printKitForCase } from './print-kits';
import scenarioData from '../data/action-scenarios.json';

export type SectionKey =
  | 'resumo' | 'linha-do-tempo' | 'atualizacoes'
  | 'evidencias' | 'reclamacoes-publicas' | 'responsaveis'
  | 'impacto' | 'risco-roma-mobili' | 'precedentes' | 'cenarios'
  | 'kit-boca-a-boca' | 'imprensa' | 'materiais-imprensa';

export type GroupKey = 'caso' | 'provas' | 'risco' | 'mobilize';

export interface CaseSection {
  key: SectionKey;
  group: GroupKey;
  /** Short label for navigation. */
  label: string;
  /** One-line promise shown under the label in grouped menus and "next step" cards. */
  hint: string;
  href: string;
}

export interface CaseGroup {
  key: GroupKey;
  label: string;
  /** What the reader gets from this group, in one line. */
  pitch: string;
  sections: CaseSection[];
}

export const groupMeta: Record<GroupKey, { label: string; pitch: string }> = {
  caso: { label: 'O caso', pitch: 'O que foi pago, o que foi prometido e o que não foi cumprido.' },
  provas: { label: 'As provas', pitch: 'Documentos, reclamações públicas e quem responde pelo contrato.' },
  risco: { label: 'O risco', pitch: 'Quanto está em jogo e até onde o prejuízo pode chegar.' },
  mobilize: { label: 'Mobilize', pitch: 'Leve a cobrança para a rua, para a imprensa e para as redes.' },
};

const has = {
  scenarios: (c: Case) => scenarioData.cases.some((x) => x.case_id === c.id),
  precedents: (c: Case) => Boolean(linkageForCase(c.id)),
  printKit: (c: Case) => Boolean(printKitForCase(c)),
  // Pages currently generated only for CA-001 (see getStaticPaths of each route).
  romaAlert: (c: Case) => c.id === 'CA-001',
  contractEntities: (c: Case) => c.id === 'CA-001',
};

export function caseSections(item: Case): CaseSection[] {
  const p = casePath(item);
  const all: (CaseSection & { when?: boolean })[] = [
    { key: 'resumo', group: 'caso', label: 'Resumo da cobrança', hint: 'O caso em 30 segundos e o que exigimos.', href: p },
    { key: 'linha-do-tempo', group: 'caso', label: 'Cronologia', hint: 'Do pagamento ao prazo estourado, data por data.', href: `${p}linha-do-tempo/` },
    { key: 'atualizacoes', group: 'caso', label: 'Atualizações', hint: 'Cada movimentação, com data e origem.', href: `${p}atualizacoes/` },

    { key: 'evidencias', group: 'provas', label: 'Documentos', hint: 'Índice de evidências que sustenta a cobrança.', href: `${p}evidencias/` },
    { key: 'reclamacoes-publicas', group: 'provas', label: 'Outras reclamações', hint: 'Quem mais reclamou, com status de cada registro.', href: `${p}reclamacoes-publicas/` },
    { key: 'responsaveis', group: 'provas', label: 'Quem responde', hint: 'O CNPJ do contrato, não o nome da fachada.', href: `${p}responsaveis/`, when: has.contractEntities(item) },

    { key: 'impacto', group: 'risco', label: 'Impacto em números', hint: 'Dinheiro parado, dias de espera, reclamações.', href: `${p}impacto/` },
    { key: 'risco-roma-mobili', group: 'risco', label: 'Alerta Roma Mobili', hint: 'O que aconteceu com quem pagou e não recebeu.', href: `${p}risco-roma-mobili/`, when: has.romaAlert(item) },
    { key: 'precedentes', group: 'risco', label: 'Precedentes', hint: 'Processos reais de empresas do setor, lado a lado.', href: `${p}precedentes/`, when: has.precedents(item) },
    { key: 'cenarios', group: 'risco', label: 'Cenários', hint: 'O que a empresa precisa fazer — e o que acontece se não fizer.', href: `${p}cenarios/`, when: has.scenarios(item) },

    { key: 'kit-boca-a-boca', group: 'mobilize', label: 'Kit Boca a Boca', hint: 'Cartazes e panfletos com QR code, prontos para imprimir.', href: `${p}kit-boca-a-boca/`, when: has.printKit(item) },
    { key: 'imprensa', group: 'mobilize', label: 'Para a imprensa', hint: 'Fact sheet, números e perguntas à empresa.', href: `${p}imprensa/` },
    { key: 'materiais-imprensa', group: 'mobilize', label: 'Artes para compartilhar', hint: 'Cards e arquivos prontos para redes e matérias.', href: `${p}materiais-imprensa/` },
  ];
  return all.filter((s) => s.when !== false).map(({ when: _when, ...s }) => s);
}

export function caseGroups(item: Case): CaseGroup[] {
  const sections = caseSections(item);
  return (Object.keys(groupMeta) as GroupKey[])
    .map((key) => ({ key, ...groupMeta[key], sections: sections.filter((s) => s.group === key) }))
    .filter((g) => g.sections.length > 0);
}

export function sectionHref(item: Case, key: SectionKey): string | undefined {
  return caseSections(item).find((s) => s.key === key)?.href;
}

export function groupOf(key: SectionKey | string): GroupKey {
  return ({
    resumo: 'caso', 'linha-do-tempo': 'caso', atualizacoes: 'caso',
    evidencias: 'provas', 'reclamacoes-publicas': 'provas', responsaveis: 'provas',
    impacto: 'risco', 'risco-roma-mobili': 'risco', precedentes: 'risco', cenarios: 'risco',
    'kit-boca-a-boca': 'mobilize', imprensa: 'mobilize', 'materiais-imprensa': 'mobilize',
  } as Record<string, GroupKey>)[key] ?? 'caso';
}

/**
 * The single "next step" a page should offer at its end. Keeps a linear reading path:
 * caso → provas → risco → mobilize → (back to) resumo/apoio.
 */
export function nextStep(item: Case, current: SectionKey): CaseSection | undefined {
  const order = caseSections(item);
  const i = order.findIndex((s) => s.key === current);
  return order[i + 1] ?? order[0];
}

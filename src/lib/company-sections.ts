/**
 * Company / unit page IA: 6 anchors in reading order (was 11).
 * Position first, then the cases that justify it, the numbers, the risk,
 * who the company is, and finally the company's right to answer.
 * Ranking and directory links are "continue" material at the end, not rail items.
 */
import type { SectionRailItem } from '../components/ui/section-rail';

export function companySections(opts: { unit?: boolean; hasPrecedent?: boolean }): SectionRailItem[] {
  return [
    { id: 'avaliacao-editorial', label: 'Nossa posição' },
    { id: 'casos-associados', label: 'Casos' },
    { id: 'analisar-impacto', label: 'Números' },
    ...(opts.hasPrecedent ? [{ id: 'precedentes-documentados', label: 'Risco' }] : []),
    { id: opts.unit ? 'perfis-cnpj' : 'observatorio-empresa', label: 'Quem é' },
    { id: 'resposta-institucional', label: 'Resposta' },
  ];
}

import { Badge } from '@/components/ui/badge';

export interface EvidenceRow {
  id: string;
  event_date: string;
  title: string;
  description: string;
  source_url?: string | null;
  statusLabel: string;
  isPrivate: boolean;
  needs: string;
}

/** Evidências como cartões responsivos (sem tabela). */
export default function EvidenceTable({ rows }: { rows: EvidenceRow[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((e) => (
        <article key={e.id} className="flex flex-col gap-2 border bg-card p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <strong className="font-mono text-xs">{e.id}</strong>
            <span className="text-xs text-muted-foreground">{e.event_date}</span>
          </div>
          <strong className="text-base leading-snug">{e.title}</strong>
          <p className="m-0 text-xs leading-relaxed text-muted-foreground">{e.description}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={e.isPrivate ? 'warning' : 'success'} className="whitespace-normal">{e.statusLabel}</Badge>
            <small className="text-xs text-muted-foreground">{e.isPrivate ? 'Acesso restrito' : 'Disponível na origem'}</small>
          </div>
          <p className="m-0 text-xs leading-relaxed text-muted-foreground">{e.needs}</p>
          {e.source_url ? (
            <a className="text-link mt-auto pt-1 text-xs" href={e.source_url} target="_blank" rel="noopener noreferrer">
              Fonte original ↗
            </a>
          ) : null}
        </article>
      ))}
    </div>
  );
}

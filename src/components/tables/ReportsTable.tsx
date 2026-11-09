export interface ReportRow {
  id: string;
  data: string;
  cidade: string;
  titulo: string;
  tema: string;
  status: string;
  url: string;
}

/** Reclamações públicas como cartões responsivos (sem tabela). */
export default function ReportsTable({ rows }: { rows: ReportRow[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((r) => (
        <article key={r.id} className="flex flex-col gap-2 border bg-card p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <time dateTime={r.data} className="font-medium">{r.data.split('-').reverse().join('/')}</time>
            <span>{r.cidade}</span>
          </div>
          <strong className="text-base leading-snug">{r.titulo}</strong>
          <span className="text-xs text-muted-foreground">{r.tema}</span>
          <span className="mt-1 inline-flex w-fit border px-2 py-0.5 text-xs font-medium">{r.status}</span>
          <a className="text-link mt-auto pt-1 text-sm" href={r.url} target="_blank" rel="noopener noreferrer">
            Abrir publicação ↗
          </a>
        </article>
      ))}
    </div>
  );
}

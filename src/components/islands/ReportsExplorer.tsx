import { useMemo, useState } from 'react';
import type { Report } from '../../lib/cases';

interface Props { reports: Report[] }
export default function ReportsExplorer({ reports }: Props) {
  const [filter, setFilter] = useState('Todas');
  const [query, setQuery] = useState('');
  const themes = useMemo(() => ['Todas', ...new Set(reports.map((r) => r.tema))], [reports]);
  const filtered = useMemo(() => {
    const needle = query.toLocaleLowerCase('pt-BR').trim();
    return reports.filter((r) => (filter === 'Todas' || r.tema === filter) && (!needle || `${r.titulo} ${r.cidade} ${r.resumo} ${r.status}`.toLocaleLowerCase('pt-BR').includes(needle)));
  }, [reports, filter, query]);
  return <>
    <label htmlFor="search-reports" className="report-search-label">Buscar por cidade, assunto ou palavra-chave</label>
    <input id="search-reports" className="report-search" type="search" value={query} onChange={(e) => setQuery(e.currentTarget.value)} placeholder="Ex.: Ipanema, atraso, montagem" />
    <div className="filters" role="group" aria-label="Filtrar reclamações por tema">
      {themes.map((theme) => <button key={theme} type="button" aria-pressed={filter===theme} onClick={()=>setFilter(theme)}>{theme}</button>)}
    </div>
    <p aria-live="polite" className="filter-count">{filtered.length} {filtered.length===1?'registro':'registros'}</p>
    <div className="reports-grid">
      {filtered.map((r) => <article className="record" key={r.id}>
        <div className="record-top"><span>{r.data.split('-').reverse().join('/')}</span><span>·</span><span>{r.cidade}</span></div>
        <span className="tag">{r.tema}</span>
        <h3>{r.titulo}</h3><p>{r.resumo}</p><small>Último status registrado: {r.status}</small>
        <a href={r.url} className="text-link" target="_blank" rel="noopener noreferrer">Ler fonte original ↗</a>
      </article>)}
    </div>
    {!filtered.length && <div className="note"><strong>Nenhum registro encontrado</strong><p>Tente outra cidade, termo ou filtro.</p></div>}
  </>;
}

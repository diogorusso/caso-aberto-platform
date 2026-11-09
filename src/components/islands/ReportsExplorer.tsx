import { useMemo, useState } from 'react';
import type { Report } from '../../lib/cases';

interface Props { reports: Report[] }
export default function ReportsExplorer({ reports }: Props) {
  const [theme, setTheme] = useState('Todas');
  const [status, setStatus] = useState('Todos');
  const [year, setYear] = useState('Todos');
  const [query, setQuery] = useState('');
  const themes = useMemo(() => ['Todas', ...new Set(reports.map((r) => r.tema))], [reports]);
  const statuses = useMemo(() => ['Todos', ...new Set(reports.map((r) => r.status))], [reports]);
  const years = useMemo(() => ['Todos', ...new Set(reports.map((r) => (r.published_at || r.data || '').slice(0, 4)).filter(Boolean))].sort(), [reports]);
  const filtered = useMemo(() => {
    const needle = query.toLocaleLowerCase('pt-BR').trim();
    return reports.filter((r) => {
      const y = (r.published_at || r.data || '').slice(0, 4);
      const hay = `${r.titulo} ${r.cidade} ${r.resumo} ${r.status} ${r.unit || ''} ${r.location || ''}`;
      return (theme === 'Todas' || r.tema === theme)
        && (status === 'Todos' || r.status === status)
        && (year === 'Todos' || y === year)
        && (!needle || hay.toLocaleLowerCase('pt-BR').includes(needle));
    });
  }, [reports, theme, status, year, query]);
  return <>
    <label htmlFor="search-reports" className="report-search-label">Buscar por cidade, unidade, assunto ou palavra-chave</label>
    <input id="search-reports" className="report-search" type="search" value={query} onChange={(e) => setQuery(e.currentTarget.value)} placeholder="Ex.: Ipanema, atraso, montagem, Fortaleza" />
    <div className="filters" role="group" aria-label="Filtrar por tema">
      {themes.map((t) => <button key={t} type="button" aria-pressed={theme===t} onClick={()=>setTheme(t)}>{t}</button>)}
    </div>
    <div className="filters" role="group" aria-label="Filtrar por status">
      {statuses.map((s) => <button key={s} type="button" aria-pressed={status===s} onClick={()=>setStatus(s)}>{s}</button>)}
    </div>
    <div className="filters" role="group" aria-label="Filtrar por ano">
      {years.map((y) => <button key={y} type="button" aria-pressed={year===y} onClick={()=>setYear(y)}>{y}</button>)}
    </div>
    <p aria-live="polite" className="filter-count">{filtered.length} {filtered.length===1?'registro':'registros'}</p>
    <div className="reports-grid">
      {filtered.map((r) => <article className="record" key={r.id}>
        <div className="record-top"><span>{(r.published_at||r.data).split('-').reverse().join('/')}</span><span>·</span><span>{r.cidade}</span>{r.unit ? <><span>·</span><span>{r.unit}</span></> : null}</div>
        <span className="tag">{r.tema}</span>
        <h3>{r.titulo}</h3><p>{r.resumo}</p>
        <small>Status: {r.status}{r.last_checked_at ? ` · verificado ${r.last_checked_at.split('-').reverse().join('/')}` : ''}</small>
        {r.notes ? <small>{r.notes}</small> : null}
        <a href={r.url} className="text-link" target="_blank" rel="noopener noreferrer">Ler fonte original ↗</a>
      </article>)}
    </div>
    {!filtered.length && <div className="note"><strong>Nenhum registro encontrado</strong><p>Tente outra cidade, ano, status ou termo.</p></div>}
  </>;
}

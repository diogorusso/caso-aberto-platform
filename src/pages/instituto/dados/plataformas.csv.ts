import type { APIRoute } from 'astro';
import ledger from '../../../data/platform-observatory.json';
// Escape quotes/newlines and guard spreadsheet formula execution on user-downloaded CSV.
const cell = (raw: unknown): string => {
  let s = String(raw ?? '');
  if (/^[\\s]*[=+@-]/.test(s)) s = "'" + s;
  return '"' + s.replaceAll('"','""') + '"';
};
export const GET: APIRoute = () => {
  const columns = ['id','date','platform','type','source_kind','headline','finding','scope','limits','source_label','source_url'] as const;
  const rows = [columns.map(cell).join(','),...ledger.records.map(item=>columns.map(key=>cell(item[key])).join(','))];
  return new Response('\uFEFF'+rows.join('\r\n')+'\r\n',{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="casoaberto-observatorio-plataformas.csv"','Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff'}});
};

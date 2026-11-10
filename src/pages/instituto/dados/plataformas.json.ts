import type { APIRoute } from 'astro';
import ledger from '../../../data/platform-observatory.json';
export const GET: APIRoute = () => new Response(JSON.stringify({
  version: 1, reviewed_at: ledger.reviewed_at, description: ledger.framing,
  license_note: 'Dados editoriais selecionados e links para fontes de terceiros; consulte os direitos dos documentos originais.',
  records: ledger.records
}, null, 2), {headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff'}});

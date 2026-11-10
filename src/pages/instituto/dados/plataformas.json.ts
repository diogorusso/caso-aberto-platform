import type { APIRoute } from 'astro';
import ledger from '../../../data/platform-observatory.json';
export const GET: APIRoute = () => new Response(JSON.stringify({
  version: 2,
  reviewed_at: ledger.reviewed_at,
  description: ledger.framing,
  methodology: ledger.methodology,
  version_history: ledger.version_history,
  license_note: 'Dados editoriais selecionados e links para fontes de terceiros; consulte os direitos dos documentos originais.',
  evidence_classes: ['observed','alleged','official_decision','company_response','analysis'],
  records: ledger.records
}, null, 2), {headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff'}});

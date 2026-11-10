import type { APIRoute } from 'astro';
import ledger from '../../../data/political-observatory.json';

/** Static, versioned public-evidence graph; no API token, cookie or private visitor data. */
export const GET: APIRoute = () => new Response(JSON.stringify({
  version: ledger.version,
  reviewed_at: ledger.reviewed_at,
  purpose: ledger.editorial_scope,
  method: 'Link assertions to source identifiers. Sponsorships are snapshots as of 2026-09-18, not assertions of current legal operation. Names do not imply guilt.',
  case_count: ledger.cases.length,
  cases: ledger.cases,
  sources: ledger.sources,
  entities: ledger.entities,
  relationships: ledger.relationships,
  sponsorships: ledger.sponsorships,
}, null, 2), {
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=3600',
    'X-Content-Type-Options': 'nosniff',
  }
});

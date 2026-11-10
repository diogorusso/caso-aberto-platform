import {readFileSync, existsSync} from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../src/data/platform-observatory.json', import.meta.url), 'utf8'));
let errors = 0;
const fail = (message) => { console.error('[civic research]', message); errors++; };
const validDate = value => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const parsed = new Date(value + 'T00:00:00Z');
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0,10) === value;
};
const evidenceClasses = new Set(['observed','alleged','official_decision','company_response','analysis']);
if (!validDate(data.reviewed_at)) fail('Missing/invalid reviewed_at');
if (typeof data.methodology !== 'string' || data.methodology.trim().length < 80) fail('Missing methodology note');
if (!Array.isArray(data.version_history) || data.version_history.length < 1) fail('Missing version_history');
if (!Array.isArray(data.records) || data.records.length < 25) fail('Research ledger requires at least 25 independently sourced records; found ' + (data.records?.length || 0));
const ids = new Set();
const sourceKeys = new Set();
for (const item of data.records || []) {
  if (!/^PLAT-\d{4}-\d{3}$/.test(item.id || '')) fail('Invalid stable ID ' + item.id);
  if (ids.has(item.id)) fail('Duplicate record ID ' + item.id);
  ids.add(item.id);
  if (!validDate(item.date) || item.date > data.reviewed_at) fail('Invalid/future event date for ' + item.id);
  if (!validDate(item.review_due) || item.review_due <= data.reviewed_at) fail('Invalid review_due for ' + item.id);
  if (!evidenceClasses.has(item.evidence_class)) fail('Invalid evidence_class for ' + item.id);
  if (item.status !== 'published' && item.status !== 'corrected' && item.status !== 'superseded') fail('Invalid status for ' + item.id);
  for (const field of ['platform','type','source_kind','headline','finding','scope','limits','source_label','right_of_reply']) {
    if (typeof item[field] !== 'string' || item[field].trim().length < 12) fail('Missing short/empty ' + field + ': ' + item.id);
  }
  try {
    const link = new URL(item.source_url);
    if (link.protocol !== 'https:' || !link.hostname.includes('.')) throw new Error('Must be HTTPS public URL');
  } catch { fail('Invalid primary source URL: ' + item.id); }
  const sourceKey = item.source_url + '|' + item.headline;
  if (sourceKeys.has(sourceKey)) fail('Duplicate source/headline pair for ' + item.id);
  sourceKeys.add(sourceKey);
}
for (const route of [
  '../src/pages/instituto/index.astro',
  '../src/pages/organizar/index.astro',
  '../src/pages/autonomia-digital/index.astro',
  '../src/pages/autonomia-digital/diagnostico/index.astro',
  '../src/pages/autonomia-digital/fingerprinting/index.astro',
  '../src/pages/autonomia-digital/algoritmos-e-influencia/index.astro',
  '../src/pages/organizar/caderno-de-acao/index.astro',
  '../src/pages/observatorio/plataformas/index.astro'
]) if (!existsSync(new URL(route, import.meta.url))) fail('Missing civic route: ' + route);
if (errors) process.exit(1);
console.log('Verified civic routes and ' + ids.size + ' source-led observatory records.');

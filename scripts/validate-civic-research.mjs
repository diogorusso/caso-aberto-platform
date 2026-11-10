import {readFileSync, existsSync} from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../src/data/platform-observatory.json', import.meta.url), 'utf8'));
let errors = 0;
const fail = (message) => { console.error('[civic research]', message); errors++; };
const validDate = value => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const parsed = new Date(value + 'T00:00:00Z');
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0,10) === value;
};
if (!validDate(data.reviewed_at)) fail('Missing/invalid reviewed_at');
if (!Array.isArray(data.records) || !data.records.length) fail('No published evidence records');
const ids = new Set();
for (const item of data.records || []) {
  if (!/^PLAT-\d{4}-\d{3}$/.test(item.id || '')) fail('Invalid stable ID ' + item.id);
  if (ids.has(item.id)) fail('Duplicate record ID ' + item.id);
  ids.add(item.id);
  if (!validDate(item.date) || item.date > data.reviewed_at) fail('Invalid/future event date for ' + item.id);
  for (const field of ['platform','type','source_kind','headline','finding','scope','limits','source_label']) {
    if (typeof item[field] !== 'string' || item[field].trim().length < 12) fail('Missing short/empty ' + field + ': ' + item.id);
  }
  try {
    const link = new URL(item.source_url);
    if (link.protocol !== 'https:' || !link.hostname.includes('.')) throw new Error('Must be HTTPS public URL');
  } catch { fail('Invalid primary source URL: ' + item.id); }
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

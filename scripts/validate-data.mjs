import {readFileSync} from 'node:fs';
const read = name => JSON.parse(readFileSync(new URL(`../src/data/${name}.json`,import.meta.url),'utf8'));
const cases=read('casos'), reports=read('relatos'), updates=read('updates'), metrics=read('metrics');
let bad=0;
const required=['id','slug','empresa','empresa_resumo','local','titulo','chamada','resumo','status','status_data','cronologia','pedidos','fontes'];
const seen=new Set();
for (const item of cases) {
  const missing=required.filter(k=>item[k] == null);
  if (missing.length) {console.error('Missing required fields',item.id,missing);bad++;}
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)) {console.error('Invalid slug',item.slug);bad++;}
  if(seen.has(item.slug)){console.error('Duplicate slug',item.slug);bad++;} seen.add(item.slug);
  for (const link of item.fontes||[]) if(!/^https:\/\//.test(link.url)) {console.error('Invalid source URL',link.url);bad++;}
}
const reportIds=new Set();
for (const r of reports) {
  const url=r.url||r.source_url;
  if(!url || !/^https:\/\//.test(url)) {console.error('Invalid report URL',r.id);bad++;}
  if(r.case_id && !cases.some(c=>c.id===r.case_id)) {console.error('Unknown linked case',r.id);bad++;}
  if(reportIds.has(r.id)) {console.error('Duplicate report id',r.id);bad++;} reportIds.add(r.id);
  for (const f of ['titulo','resumo','data','cidade','tema','status']) if(r[f]==null){console.error('Report missing',f,r.id);bad++;}
}
for (const u of updates) {
  if(!cases.some(c=>c.id===u.case_id)) {console.error('Update unknown case',u.id);bad++;}
}
const counted=metrics.cases?.['CA-001']?.public_complaints_indexed;
if (counted != null && counted !== reports.length) {
  console.error('metrics public_complaints_indexed mismatch', counted, reports.length); bad++;
}
if (bad) process.exit(1);
console.log(`OK: ${cases.length} case(s); ${reports.length} linked reports; ${updates.length} updates; static routes expand with guides/empresas`);

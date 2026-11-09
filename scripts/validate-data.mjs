import {readFileSync} from 'node:fs';
const read = name => JSON.parse(readFileSync(new URL(`../src/data/${name}.json`,import.meta.url),'utf8'));
const cases=read('casos'), reports=read('relatos');
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
for (const r of reports) {
  if(!/^https:\/\//.test(r.url)) {console.error('Invalid report URL',r.id);bad++;}
  if(r.case_id && !cases.some(c=>c.id===r.case_id)) {console.error('Unknown linked case',r.id);bad++;}
}
if (bad) process.exit(1);
console.log(`OK: ${cases.length} case(s); ${reports.length} linked reports; ${4*cases.length+4} generated content pages expected`);

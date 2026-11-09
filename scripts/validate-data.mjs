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

const profiles=read('company-profiles'), evidence=read('evidence-index');
const validCnpj=(raw)=>{
  const v=String(raw).replace(/\D/g,'');
  if(!/^\d{14}$/.test(v)||/^(\d)\1+$/.test(v))return false;
  const digit=(base,weights)=>{const remainder=base.split('').reduce((sum,d,i)=>sum+Number(d)*weights[i],0)%11;const check=11-remainder;return check>=10?0:check;};
  return Number(v[12])===digit(v.slice(0,12),[5,4,3,2,9,8,7,6,5,4,3,2]) &&
         Number(v[13])===digit(v.slice(0,13),[6,5,4,3,2,9,8,7,6,5,4,3,2]);
};
const companyIds=new Set(),companyCnpjs=new Set();
for(const c of profiles.entities){
  if(companyIds.has(c.id)){console.error('Duplicate company profile',c.id);bad++;}companyIds.add(c.id);
  if(!validCnpj(c.cnpj)){console.error('Invalid CNPJ',c.cnpj);bad++;}
  if(companyCnpjs.has(c.cnpj)){console.error('Duplicate CNPJ',c.cnpj);bad++;}companyCnpjs.add(c.cnpj);
  if(!c.sources?.length||!c.sources.every(s=>/^https:\/\//.test(s.url))){console.error('Company source URL missing',c.id);bad++;}
}
const evidenceIds=new Set();
for(const e of evidence.items){
  if(evidenceIds.has(e.id)){console.error('Duplicate evidence ID',e.id);bad++;}evidenceIds.add(e.id);
  if(!cases.some(c=>c.id===evidence.case_id)){console.error('Evidence unknown case',e.id);bad++;}
  if(e.visibility==='publico' && !/^https:\/\//.test(e.source_url||'')){console.error('Public evidence missing URL',e.id);bad++;}
  if(e.visibility==='privado' && e.source_url){console.error('Private evidence published URL',e.id);bad++;}
}

const counted=metrics.cases?.['CA-001']?.public_complaints_indexed;
if (counted != null && counted !== reports.length) {
  console.error('metrics public_complaints_indexed mismatch', counted, reports.length); bad++;
}
if (bad) process.exit(1);
console.log(`OK: ${cases.length} case(s); ${reports.length} linked reports; ${updates.length} updates; static routes expand with guides/empresas`);

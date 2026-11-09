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


const brandsData=read('brands'), issueData=read('issues');
const validStatuses=new Set(brandsData.ratings.map(x=>x.code));
const brandSlugs=new Set(), brandCaseIds=new Set();
for(const brand of brandsData.brands){
  if(brandSlugs.has(brand.slug)){console.error('Duplicate company slug',brand.slug);bad++;}
  brandSlugs.add(brand.slug);
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(brand.slug)){console.error('Invalid company slug',brand.slug);bad++;}
  for(const cid of brand.case_ids||[]){
    if(!cases.some(c=>c.id===cid)){console.error('Unknown company case',brand.slug,cid);bad++;}
    brandCaseIds.add(cid);
  }
  for(const pid of [...(brand.primary_company_profile_ids||[]),...(brand.related_company_profile_ids||[])]){
    if(!companyIds.has(pid)){console.error('Unknown company profile ID',brand.slug,pid);bad++;}
  }
  const checkVerdict=(v,who,published)=>{
    if(!validStatuses.has(v?.status)){console.error('Invalid editorial verdict',who,v?.status);bad++;}
    if(published){
      for(const key of ['scope','headline','lead','context','valid_as_of']){
        if(!v[key]||!String(v[key]).trim()){console.error('Missing published verdict field',who,key);bad++;}
      }
      if(!v.source_urls?.length||!v.source_urls.every(x=>/^https:\/\//.test(x))){console.error('Published verdict needs source URLs',who);bad++;}
      if(!v.basis?.length||!v.review_triggers?.length){console.error('Published verdict needs evidence and review criteria',who);bad++;}
      if(!(brand.case_ids||[]).length){console.error('Published brand needs linked cases',brand.slug);bad++;}
      if(!brand.summary||brand.summary.includes('PENDENTE')){console.error('Published brand missing reviewed summary',who);bad++;}
      if(!brand.primary_company_profile_ids?.length){console.error('Published brand missing primary CNPJ profile',brand.slug);bad++;}
    }
  };
  checkVerdict(brand.verdict,brand.slug,brand.published);
  const unitSlugs=new Set();
  for(const unit of brand.units||[]){
    if(unitSlugs.has(unit.slug)){console.error('Duplicate unit slug',brand.slug,unit.slug);bad++;}
    unitSlugs.add(unit.slug);
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(unit.slug)){console.error('Invalid unit slug',unit.slug);bad++;}
    for(const pid of unit.company_profile_ids||[]){
      if(!companyIds.has(pid)){console.error('Unknown unit CNPJ registry',unit.slug,pid);bad++;}
    }
    for(const cid of unit.case_ids||[]){
      if(!brand.case_ids.includes(cid)){console.error('Unit case not in brand case list',unit.slug,cid);bad++;}
      const c=cases.find(x=>x.id===cid);
      if(c?.unidade_slug!==unit.slug||c?.empresa_slug!==brand.slug){console.error('Mismatched case relationship',unit.slug,cid);bad++;}
    }
    if(unit.published&&brand.published&&!unit.company_profile_ids?.length){console.error('Published unit missing CNPJ profile',unit.slug);bad++;}
    checkVerdict(unit.verdict,brand.slug+'/'+unit.slug,unit.published&&brand.published);
  }
}
for(const c of cases){
  const brand=brandsData.brands.find(b=>b.slug===c.empresa_slug);
  if(!brand||!brand.case_ids.includes(c.id)){console.error('Case not linked from brand',c.id,c.empresa_slug);bad++;}
  if(c.unidade_slug && !brand?.units.some(u=>u.slug===c.unidade_slug&&u.case_ids.includes(c.id))){console.error('Case not linked from unit',c.id,c.unidade_slug);bad++;}
}
const topicSlugs=new Set();
for(const topic of issueData.items){
  if(topicSlugs.has(topic.slug)){console.error('Duplicate issue topic',topic.slug);bad++;}
  topicSlugs.add(topic.slug);
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(topic.slug)){console.error('Invalid issue slug',topic.slug);bad++;}
  const count=reports.filter(r=>r.tema===topic.theme).length;
  if(count<2){console.error('Published issue topic with <2 records',topic.slug);bad++;}
  if(!topic.intro||!topic.what_to_check?.length){console.error('Issue topic lacks editorial content',topic.slug);bad++;}
}
const evidenceItemIds=new Set();
for(const e of evidence.items){
  if(evidenceItemIds.has(e.id)){console.error('Duplicate evidence reference',e.id);bad++;}evidenceItemIds.add(e.id);
  if(!cases.some(c=>c.id===e.case_id)){console.error('Evidence item unlinked to case',e.id,e.case_id);bad++;}
}

const counted=metrics.cases?.['CA-001']?.public_complaints_indexed;
if (counted != null && counted !== reports.filter(r=>r.case_id==='CA-001').length) {
  console.error('metrics public_complaints_indexed mismatch', counted, reports.length); bad++;
}
if (bad) process.exit(1);
console.log(`OK: ${cases.length} case(s); ${reports.length} linked reports; ${updates.length} updates; static routes expand with guides/empresas`);

import {readFileSync,existsSync} from 'node:fs';
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


const impact=read('impact-models');
const impactIds=new Set(Object.keys(impact.case_models||{}));
for(const id of impactIds){
 const c=cases.find(x=>x.id===id);
 if(!c){console.error('Impact model references unknown case',id);bad++;continue;}
 const m=impact.case_models[id];
 const iso=(x)=>/^\d{4}-\d{2}-\d{2}$/.test(String(x))&&new Date(x+'T00:00:00Z').toISOString().slice(0,10)===x;
 for(const key of ['snapshot_date','payment_date_reported','original_due_window_start','original_due_window_end']){
   if(!iso(m[key])){console.error('Impact model invalid date',id,key,m[key]);bad++;}
 }
 if(iso(m.snapshot_date)&&iso(m.original_due_window_end)&&m.snapshot_date<m.original_due_window_end){console.error('Impact snapshot before original due date',id);bad++;}
 if(iso(m.original_due_window_start)&&iso(m.original_due_window_end)&&m.original_due_window_end<m.original_due_window_start){console.error('Impact due window reversed',id);bad++;}
 if(iso(m.snapshot_date)&&m.snapshot_date>c.status_data){console.error('Impact snapshot newer than case status; review needed',id);bad++;}
 if(m.confirmed_added_costs_brl!==null&&(!Number.isFinite(m.confirmed_added_costs_brl)||m.confirmed_added_costs_brl<0)){console.error('Invalid confirmed additional costs',id);bad++;}
 for(const key of ['actual_site_views','actual_site_unique_visitors','actual_social_impressions','verified_judicial_filings']){
  if(m[key]!==null&&(!Number.isSafeInteger(m[key])||m[key]<0)){console.error('Invalid observed impact count',id,key);bad++;}
 }
 for(const [key,value] of Object.entries(m.scenario_defaults||{})){
   if(!Number.isFinite(value)||value<0){console.error('Invalid scenario assumption',id,key);bad++;}
 }
 for(const key of ['purchase_ready_share_pct','decision_change_share_pct']){
   if(m.scenario_defaults[key]>100){console.error('Scenario percentage out of bounds',id,key);bad++;}
 }
 if(!m.reference_urls?.length||!m.reference_urls.every(x=>/^https:\/\//.test(x))){console.error('Impact model missing source links',id);bad++;}
}
const impactBrands=new Set();
for(const snapshot of impact.external_brand_snapshots||[]){
 if(impactBrands.has(snapshot.brand_slug)){console.error('Duplicate external brand snapshot',snapshot.brand_slug);bad++;}
 impactBrands.add(snapshot.brand_slug);
 if(!brandsData.brands.some(b=>b.slug===snapshot.brand_slug)){console.error('External snapshot brand unknown',snapshot.brand_slug);bad++;}
 if(!/^https:\/\//.test(snapshot.page_url)){console.error('External snapshot missing source',snapshot.brand_slug);bad++;}
 if(snapshot.delivery_delay_category_records>snapshot.total_active_records){console.error('External category count exceeds total',snapshot.brand_slug);bad++;}
 if(snapshot.total_active_records<0||snapshot.delivery_delay_category_records<0){console.error('External snapshot counts invalid',snapshot.brand_slug);bad++;}
 if(!/^\d{4}-\d{2}-\d{2}$/.test(snapshot.as_of)){console.error('External snapshot date missing',snapshot.brand_slug);bad++;}
}


// Company identity photos/logos require origin metadata; no fabricated website screenshots.
const visuals=read('company-media'),contractEntities=read('case-contract-entities');
const secureUrl=x=>typeof x==='string'&&/^https:\/\//.test(x);
// Local media lives in public/media (hashed inventory). Remote sources stay as attribution.
const localMedia=x=>typeof x==='string'&&/^\/media\/[A-Za-z0-9._/-]+$/.test(x);
const assetSrc=x=>secureUrl(x)||localMedia(x);
for(const [slug,asset] of Object.entries(visuals.brands||{})){
  const brand=brandsData.brands.find(b=>b.slug===slug);
  if(!brand){console.error('Media belongs to unknown brand',slug);bad++;continue;}
  if(!secureUrl(asset.website)){console.error('Company website URL missing',slug);bad++;}
  if(asset.logo?.src&&!assetSrc(asset.logo.src)){console.error('Company logo invalid URL',slug);bad++;}
  if(asset.logo?.src&&(!secureUrl(asset.logo.source_url)||!asset.logo.alt||!asset.logo.credit)){console.error('Company logo missing attribution',slug);bad++;}
  const checkCapture=(capture,context)=>{
    if(!capture)return;
    if(!secureUrl(capture.page_url)){console.error('Website capture missing original page URL',context);bad++;}
    if(capture.status==='pending_verified_capture'){
      if(capture.src||capture.captured_at){console.error('Pending screenshot cannot claim saved image or capture date',context);bad++;}
    }else if(!capture.src||!capture.captured_at||!capture.credit){console.error('Verified screenshot missing image/date/credit',context);bad++;}
  };
  checkCapture(asset.website_capture,slug);
  for(const [unitSlug,unitAsset] of Object.entries(asset.units||{})){
    if(!brand.units.some(u=>u.slug===unitSlug)){console.error('Media references unknown unit',slug,unitSlug);bad++;}
    if(unitAsset.image?.src&&(!assetSrc(unitAsset.image.src)||!secureUrl(unitAsset.image.source_url)||!unitAsset.image.alt||!unitAsset.image.credit||!unitAsset.image.collected_at)){
      console.error('Store photo missing provenance metadata',slug,unitSlug);bad++;
    }
    checkCapture(unitAsset.website_capture,slug+'/'+unitSlug);
  }
}
// Recognition gate: a published brand/unit must be visually identifiable (logo + sourced store
// photo + explicit editorial badge) so a text-only case never leaves the reader guessing the store
// (AGENTS.md §20, §22). Copy lives in brands.json; images and provenance in company-media.json.
const checkRecognition=(rec,who)=>{
  if(!rec){console.error('Published brand/unit missing recognition copy',who);bad++;return;}
  for(const key of ['badge','headline','cta']){
    if(!rec[key]||!String(rec[key]).trim()){console.error('Recognition copy missing field',who,key);bad++;}
  }
  if(!/^\d{4}-\d{2}-\d{2}$/.test(rec.valid_as_of||'')){console.error('Recognition copy missing review date',who);bad++;}
};
for(const brand of brandsData.brands){
  if(!brand.published)continue;
  const asset=visuals.brands?.[brand.slug];
  if(!asset?.logo?.src){console.error('Published brand missing logo asset',brand.slug);bad++;}
  checkRecognition(brand.recognition,brand.slug);
  for(const unit of brand.units||[]){
    if(!unit.published)continue;
    if(unit.case_ids?.length&&!asset?.units?.[unit.slug]?.image?.src){
      console.error('Published unit with cases missing store photo',brand.slug,unit.slug);bad++;
    }
    checkRecognition(unit.recognition||brand.recognition,brand.slug+'/'+unit.slug);
  }
}
for(const [caseId,record] of Object.entries(contractEntities.cases||{})){
  if(!cases.some(c=>c.id===caseId)){console.error('Contract entity refers to unknown case',caseId);bad++;}
  const slots=new Set();
  for(const slot of record.slots||[]){
    if(slots.has(slot.slot_id)){console.error('Duplicate contract role',caseId,slot.slot_id);bad++;}
    slots.add(slot.slot_id);
    const complete=Boolean(slot.display_name&&slot.cnpj&&slot.verified_at&&slot.verification_source_url);
    const partial=Boolean(slot.display_name||slot.cnpj||slot.verified_at||slot.verification_source_url);
    if(partial&&!complete){console.error('Partial contract identity cannot be published',caseId,slot.slot_id);bad++;}
    if(complete&&(!validCnpj(slot.cnpj)||!secureUrl(slot.verification_source_url))){console.error('Invalid verified contracted company',caseId,slot.slot_id);bad++;}
    if(!complete&&(slot.directors||[]).length){console.error('Unverified contract role cannot publish directors',caseId,slot.slot_id);bad++;}
    for(const director of slot.directors||[]){
      if(!director.name||!director.role||!secureUrl(director.source_url)){console.error('Contract director missing evidence',caseId,slot.slot_id);bad++;}
    }
  }
}


const precedentData=read('precedents');
const isoDate=(v)=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v+'T00:00:00Z'))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;
const precedentDays=(a,b)=>Math.round((Date.parse(b+'T00:00:00Z')-Date.parse(a+'T00:00:00Z'))/86400000);
const precedentSignalKeys=new Set((precedentData.signal_rows||[]).map(r=>r.key));
if(!precedentSignalKeys.size){console.error('Precedent signal registry missing');bad++;}
for(const row of precedentData.signal_rows||[]){
 if(!row.key||!row.label){console.error('Invalid precedent signal row',row.key);bad++;}
}
const precedentIds=new Set(),precedentSlugs=new Set();
for(const p of precedentData.precedents){
 if(precedentIds.has(p.id)||precedentSlugs.has(p.slug)){console.error('Duplicate precedent ID or slug',p.id,p.slug);bad++;}
 precedentIds.add(p.id);precedentSlugs.add(p.slug);
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)){console.error('Invalid precedent slug',p.slug);bad++;}
 if(p.process_number===null){
  if(p.stage!=='encerramento_operacional'){console.error('Only operational closure may omit a CNJ process number',p.id);bad++;}
  if(p.court!==null){console.error('Precedent without process cannot claim a court',p.id);bad++;}
 }else if(!/^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/.test(p.process_number)){console.error('Invalid CNJ process number syntax',p.id,p.process_number);bad++;}
 if(p.first_public_signal&&(!isoDate(p.first_public_signal.date)||!/^https:\/\//.test(p.first_public_signal.source_url||''))){console.error('Precedent first public signal lacks date/source',p.id);bad++;}
 if(!Array.isArray(p.signals)||!p.signals.length){console.error('Precedent missing dated signals',p.id);bad++;}
 for(const s of p.signals||[]){
  if(typeof s==='string'||!s?.key||!isoDate(s.date)||!/^https:\/\//.test(s.source_url||'')){console.error('Precedent signal must carry key, date and source',p.id,s?.key||s);bad++;continue;}
  if(!precedentSignalKeys.has(s.key)){console.error('Unknown precedent signal key',p.id,s.key);bad++;}
 }
 if(!Object.hasOwn(precedentData.stage_definitions,p.stage)){console.error('Unknown precedent court stage',p.id,p.stage);bad++;}
 if(!isoDate(p.start_date)){console.error('Invalid precedent start date',p.id);bad++;}
 if(p.stage==='falencia_decretada'&&!isoDate(p.bankruptcy_decree_date)){console.error('Bankruptcy precedent missing court decree date',p.id);bad++;}
 if(p.stage==='recuperacao_judicial'&&(p.bankruptcy_decree_date!==null||!isoDate(p.recovery_acceptance_date))){console.error('Recovery must not be presented as bankruptcy',p.id);bad++;}
 if(!p.sources?.length||!p.sources.every(s=>/^https:\/\//.test(s.url)&&isoDate(s.checked_at))){console.error('Missing source or verification date',p.id);bad++;}
 if(!p.timeline?.length){console.error('Precedent missing timeline',p.id);bad++;}
 for(let i=0;i<(p.timeline?.length||0);i++){
  const ev=p.timeline[i];
  if(!isoDate(ev.date)||!/^https:\/\//.test(ev.source_url)){console.error('Precedent event lacks dated source',p.id,i);bad++;}
  if(i>0&&ev.date<p.timeline[i-1].date){console.error('Precedent timeline not chronological',p.id);bad++;}
 }
 if(isoDate(p.start_date)&&isoDate(p.bankruptcy_decree_date)&&p.start_date>p.bankruptcy_decree_date){console.error('Bankruptcy before starting event',p.id);bad++;}
 for(const m of p.metrics||[]){
  if(m.kind==='calculated'){
   if(!Array.isArray(m.basis)||m.basis.length!==2||!m.basis.every(isoDate)){console.error('Calculated precedent metric missing two dates',p.id);bad++;continue;}
   const actual=precedentDays(m.basis[0],m.basis[1]);
   const displayed=/^(\d+) dias?$/.exec(m.label);
   if(actual<0||!displayed||Number(displayed[1])!==actual){console.error('Inconsistent precedent-day calculation',p.id,m.label,actual);bad++;}
  }else if(!/^https:\/\//.test(m.source_url||'')){console.error('Reported numeric precedent metric needs source',p.id,m.label);bad++;}
 }
 if(!p.known_limits||!p.relevance){console.error('Precedent must disclose limits',p.id);bad++;}
}
const precedentCases=new Set();
for(const relation of precedentData.case_links){
 if(precedentCases.has(relation.case_id)){console.error('Duplicate case precedent linkage',relation.case_id);bad++;}
 precedentCases.add(relation.case_id);
 const sourceCase=cases.find(c=>c.id===relation.case_id);
 if(!sourceCase){console.error('Precedent relation unknown case',relation.case_id);bad++;continue;}
 if(sourceCase.empresa_slug!==relation.brand_slug||sourceCase.unidade_slug!==relation.unit_slug){console.error('Precedent relation mismatches linked company/unit',relation.case_id);bad++;}
 if(!relation.precedent_ids?.length||!relation.precedent_ids.every(id=>precedentIds.has(id))){console.error('Case relation has unknown precedent',relation.case_id);bad++;}
 if(!relation.established_similarities?.length||!relation.established_differences?.length){console.error('Precedent linkage missing similarities or distinctions',relation.case_id);bad++;}
}


// Print kits are published only for existing cases with actual source and QR assets.
const printKits=read('print-kits'), actionScenarios=read('action-scenarios');
const seenPrintCases=new Set();
for(const k of printKits.cases||[]){
 if(seenPrintCases.has(k.case_id)){console.error('Duplicate print kit',k.case_id);bad++;}seenPrintCases.add(k.case_id);
 if(!cases.some(c=>c.id===k.case_id)){console.error('Print kit has unknown case',k.case_id);bad++;}
 if(!k.published)continue;
 for(const key of ['headline','short_headline','source_note','editorial_warning','call_to_action','print_question']){
  if(!String(k[key]||'').trim()){console.error('Published print kit missing',k.case_id,key);bad++;}
 }
 for(const format of ['cartaz-a4','ficha-a4','panfletos-a5','cartoes-a6','organizador-a4']){
  if(!k.formats?.includes(format)){console.error('Print kit format missing',k.case_id,format);bad++;}
 }
 if(!k.source_urls?.length||k.source_urls.some(u=>!/^https:\/\//.test(u))){console.error('Print kit lacks valid sources',k.case_id);bad++;}
 if(!k.qr_svg?.startsWith('/media/print/')||k.qr_svg.includes('..')){console.error('Invalid print QR path',k.case_id);bad++;}
 else if(!existsSync(new URL('../public'+k.qr_svg,import.meta.url))){console.error('QR file missing',k.case_id,k.qr_svg);bad++;}
}
if(!/^https:\/\//.test(printKits.public_url_origin||'')){console.error('Print kit lacks site URL');bad++;}
const actorIds=new Set(actionScenarios.actor_roles.map(x=>x.id));
const scenarioIds=new Set();
for(const s of actionScenarios.scenarios){
 if(scenarioIds.has(s.id)){console.error('Duplicate scenario',s.id);bad++;}scenarioIds.add(s.id);
 if(!s.title||!s.evidence_trigger||!s.next_steps?.length||!s.observe?.length){console.error('Scenario missing content',s.id);bad++;}
 if(s.actors?.some(id=>!actorIds.has(id))){console.error('Scenario has unknown actor',s.id);bad++;}
}
for(const v of actionScenarios.cases){
 if(!cases.some(c=>c.id===v.case_id)){console.error('Scenario linked to unknown case',v.case_id);bad++;}
 if(!v.scenario_ids?.length||v.scenario_ids.some(id=>!scenarioIds.has(id))){console.error('Unknown linked scenario',v.case_id);bad++;}
}

const counted=metrics.cases?.['CA-001']?.public_complaints_indexed;
if (counted != null && counted !== reports.filter(r=>r.case_id==='CA-001').length) {
  console.error('metrics public_complaints_indexed mismatch', counted, reports.length); bad++;
}
if (bad) process.exit(1);
console.log(`OK: ${cases.length} case(s); ${reports.length} linked reports; ${updates.length} updates; static routes expand with guides/empresas`);

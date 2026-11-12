/** Verify identity-scoped, deduplicated documentary registry for the Cacofonias/SIS dossier.
 * This is structural provenance validation, not authentication of underlying court files.
 */
import {readFileSync,existsSync} from 'node:fs';
const read=name=>JSON.parse(readFileSync(new URL('../src/data/'+name+'.json',import.meta.url),'utf8'));
const records=read('sis-related-proceedings');
const dossier=read('cacofonias-escola-suico-brasileira');
const categories=read('case-categories');
const watch=read('case-watch-policy');
const visual=read('case-visual-assets');
const fail=[],check=(ok,message)=>{if(!ok)fail.push(message)};
const iso=x=>typeof x==='string'&&/^\d{4}-\d\d-\d\d$/.test(x)&&new Date(x+'T12:00:00Z').toISOString().slice(0,10)===x;
const https=x=>{try{const v=new URL(x);return v.protocol==='https:'&&!v.username&&!v.password;}catch{return false;}};
check(records.version===1&&dossier.version===1,'Unexpected SIS dossier version');
check(iso(records.reviewed_at)&&iso(dossier.reviewed_at),'Invalid documentary review date');
check(records.reviewed_at===dossier.reviewed_at,'Review dates diverge');
check(dossier.id==='EXT-016'&&dossier.slug==='cacofonias-escola-suico-brasileira','Unexpected dossier identifier');
check(records.primary_cnpj==='10.883.230/0001-08','Corporate identity changed without review');
check(Array.isArray(records.records)&&records.records.length>=10,'Research coverage dropped unexpectedly');
const entities=new Map(records.entities.map(item=>[item.id,item]));
const ids=new Set();
for(const entity of records.entities){
 check(Boolean(entity.name&&entity.relation&&entity.caution),'Incomplete entity attribution: '+entity.id);
 check(https(entity.source),'Invalid entity source: '+entity.id);
}
for(const item of records.records){
 check(!ids.has(item.id),'Duplicate research reference '+item.id);ids.add(item.id);
 check(entities.has(item.entity_id),'Unknown corporate entity '+item.id);
 check(Boolean(item.cluster&&item.family&&item.court&&item.subject&&item.status&&item.result&&item.meaning&&item.question),'Missing evidentiary qualification '+item.id);
 check(iso(item.source_date)&&item.source_date<=records.reviewed_at,'Unverifiable/future research date '+item.id);
 check(https(item.source_url),'Invalid process source '+item.id);
 if(item.cluster==='historico-legado')check(item.entity_id==='legacy-rio','Historical case incorrectly attributed to 2026 maintained school: '+item.id);
 if(item.cluster==='administrativo')check(item.place.includes('Brasília')&&item.source_url.includes('sinj.df.gov.br'),'DF official act conflated with Rio '+item.id);
}
check(ids.size===records.records.length,'Research reference count mismatch');
check(records.excluded.length>=3&&records.excluded.every(e=>https(e.source)&&e.reason.length>=45),'Deduplication evidence missing');
check(entities.has('legacy-rio')&&entities.get('legacy-rio').cnpj!==records.primary_cnpj,'Historical corporate identity not separated');
check(categories.categories.some(c=>c.slug==='politica-e-direitos'&&c.case_ids.includes(dossier.id)),'Legal dossier absent from one research category');
check(watch.cases.some(item=>item.id===dossier.id&&item.mode==='active'&&item.interval_days<=3),'New case not in source watch');
const cover=visual.assets.find(item=>item.case_id===dossier.id);
check(cover?.photo===null&&cover?.logo===null&&cover?.non_photo_reason?.length>100,'Protected family illustration exception missing');
for(const source of dossier.sources)check(https(source.url)&&iso(source.date),'Invalid journalistic case source '+source.id);
const sourceIds=new Set(dossier.sources.map(s=>s.id));
for(const event of dossier.timeline)check(iso(event.date)&&sourceIds.has(event.source_id),'Timeline event lacks source/date '+event.label);
for(const path of ['src/pages/casos/cacofonias-escola-suico-brasileira/index.astro','src/pages/casos/cacofonias-escola-suico-brasileira/processos-relacionados/index.astro','src/pages/casos/cacofonias-escola-suico-brasileira/processos-relacionados/indice.csv.ts','docs/casos/cacofonias-escola-suico-brasileira/PROCESSOS-RELACIONADOS.md']){
 check(existsSync(new URL('../'+path,import.meta.url)),'Missing public/attorney registry path '+path);
}
if(fail.length){fail.forEach(e=>console.error('[sis-dossier] '+e));process.exit(1);}
console.log('SIS legal dossier: '+records.records.length+' attributed case references; '+records.entities.length+' corporate identities; '+records.excluded.length+' duplicate/excluded leads; sensitive family data withheld.');

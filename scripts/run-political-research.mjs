#!/usr/bin/env node
/** Offline editorial workbench for political observatory updates.
 * Chat/editor supplies independently verified, attributed evidence packets.
 * No scraping, sending, publication, deployment or background monitoring.
 */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
const dataPath=new URL('../src/data/political-observatory.json',import.meta.url);
const data=JSON.parse(readFileSync(dataPath,'utf8'));
const args=process.argv.slice(2);
const option=(flag)=>{const index=args.indexOf(flag);return index>=0?args[index+1]:undefined;};
const list=args.includes('--list')||args.length===0;
const caseId=option('--case');
const packetPath=option('--apply');
const today=new Date().toISOString().slice(0,10);
const dateOk=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&d<=today&&!Number.isNaN(Date.parse(d));
const https=u=>{try{const parsed=new URL(u);return parsed.protocol==='https:'&&!parsed.username&&!parsed.password;}catch{return false;}};
const fail=message=>{console.error('[research:politics] '+message);process.exit(1);};
const getCase=id=>{const found=data.cases.find(c=>c.id===id||c.slug===id);if(!found)fail('Unknown case: '+id);return found;};
const printCase=study=>{
 console.log('\n'+study.id+' | '+study.title+'\n'+study.status+'\n');
 console.log('Case route: /observatorio/politica/'+study.slug+'/');
 console.log('Research checkpoint: '+study.next_check);
 console.log('\nUnresolved verification questions:');
 console.log('Last evidence revision: '+study.reviewed_at);
 study.questions.forEach((q,i)=>console.log(' '+(i+1)+'. '+q));
 console.log('\nSource register:');
 study.source_ids.forEach(id=>{const s=data.sources.find(x=>x.id===id);if(s)console.log(' - '+s.id+' | '+(s.published_at||'no date')+' | '+s.url);});
};
if(packetPath){
 const packet=JSON.parse(readFileSync(resolve(packetPath),'utf8'));
 const study=getCase(packet.case_id||'');
 if(!packet.editorial_review||packet.editorial_review.approved!==true||typeof packet.editorial_review.reviewer!=='string'||packet.editorial_review.reviewer.trim().length<3||typeof packet.editorial_review.review_note!=='string'||packet.editorial_review.review_note.length<40)fail('Human editorial approval and review note are required. Do not fake approval.');
 if(!dateOk(packet.reviewed_at)||packet.reviewed_at<data.reviewed_at||packet.reviewed_at<study.reviewed_at)fail('Review date invalid, in the future or older than current published review');
 if(!Array.isArray(packet.sources)||packet.sources.length<1)fail('Evidence packet must supply at least one independently checked source');
 if(!Array.isArray(packet.facts)||packet.facts.length<1)fail('Evidence packet must contain at least one document-linked factual update');
 const incoming=new Map();
 for(const source of packet.sources){
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(source.id)||!https(source.url)||source.title?.length<15||source.kind?.length<6|| (source.published_at&&!dateOk(source.published_at)))fail('Invalid incoming source');
  const previous=data.sources.find(s=>s.id===source.id);
  if(previous&&previous.url!==source.url)fail('Source IDs are immutable; choose new ID for changed URL');
  if(incoming.has(source.id))fail('Duplicate incoming source');
  incoming.set(source.id,source);
 }
 const known=new Set([...data.sources.map(s=>s.id),...incoming.keys()]);
 for(const fact of packet.facts){
  if(fact.finding?.length<55||!known.has(fact.source)||!['documentado','valor-reportado','posição-da-parte','levantamento-histórico','reportagem-a-confirmar-nos-autos','apuração-noticiada','apuração-com-versão','versão-do-citado','medidas-oficiais-reportadas','levantamento-independente','denúncias-reportadas','apuração-jornalística','declaração-governamental','relatos-registrados','levantamento-jornalístico'].includes(fact.kind))fail('Unattributed or unclassified factual update');
 }
 for(const event of packet.timeline||[]){
  if(!dateOk(event.date)||event.title?.length<8||event.detail?.length<30||!known.has(event.source))fail('Invalid event date, detail or evidence link');
 }
 if(packet.status!==undefined&&(!packet.status||packet.status.length>180))fail('Invalid status');
 if(packet.next_check!==undefined&&packet.next_check.length<50)fail('Next checkpoint must be concrete');
 if(packet.questions!==undefined&&(!Array.isArray(packet.questions)||packet.questions.length<3||packet.questions.some(q=>q.length<40)))fail('Questions must preserve minimum depth');
 for(const source of incoming.values()){if(!data.sources.some(s=>s.id===source.id))data.sources.push(source);}
 const linked=new Set(study.source_ids);
 for(const source of [...packet.facts,...(packet.timeline||[])])linked.add(source.source);
 study.source_ids=[...linked];
 const existingFacts=new Set(study.facts.map(f=>f.source+'|'+f.finding));
 study.facts.push(...packet.facts.filter(f=>!existingFacts.has(f.source+'|'+f.finding)));
 const events=new Set(study.timeline.map(e=>e.source+'|'+e.date+'|'+e.title));
 study.timeline.push(...(packet.timeline||[]).filter(e=>!events.has(e.source+'|'+e.date+'|'+e.title)));
 study.timeline.sort((a,b)=>a.date.localeCompare(b.date));
 for(const key of ['status','next_check','questions','limits'])if(packet[key]!==undefined)study[key]=packet[key];
 study.reviewed_at=packet.reviewed_at;
 data.reviewed_at=packet.reviewed_at;
 if(!Array.isArray(data.revision_log))data.revision_log=[];
 data.revision_log.push({date:packet.reviewed_at,case_id:study.id,reviewer:packet.editorial_review.reviewer,review_note:packet.editorial_review.review_note,source_ids:[...incoming.keys()],fact_count:packet.facts.length});
 writeFileSync(dataPath,JSON.stringify(data,null,2)+'\n');
 console.log('Updated '+study.id+' with '+packet.facts.length+' documented facts. Now run npm run verify:politics, npm run check, npm run build, review diff and commit. No deploy has occurred.');
 process.exit(0);
}
if(list){
 console.log('OBSERVATÓRIO POLÍTICO | last editorial revision '+data.reviewed_at);
 for(const c of data.cases)console.log(c.id+' | '+c.status+' | '+c.title);
 console.log('\nRun --case POL-001 for questions, checkpoints and source links. Use --apply reviewed-packet.json only after a human editorial review.');
}
if(caseId)printCase(getCase(caseId));

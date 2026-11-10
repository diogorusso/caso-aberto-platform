/** Validate the public political observatory before building a static site.
 * Does not claim to check factual truth or live judicial status: editorial verification is separate.
 */
import {readFileSync} from 'node:fs';
const path=new URL('../src/data/political-observatory.json',import.meta.url);
const data=JSON.parse(readFileSync(path,'utf8'));
const errors=[];
const assert=(condition,message)=>{if(!condition)errors.push(message);};
const dateOk=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value&&value<='2026-11-10';
const linkOk=value=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!/^(localhost|127\.)/.test(u.hostname);}catch{return false;}};
const unique=(items,name)=>{const s=new Set(items);assert(s.size===items.length,'Duplicate '+name);return s;};
const slug=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
assert(data.version===1,'Unsupported schema version');
assert(dateOk(data.reviewed_at),'Invalid review date');
assert(Array.isArray(data.cases)&&data.cases.length>=6,'Missing distinct political dossier coverage');
assert(Array.isArray(data.sources)&&data.sources.length>=12,'Source register incomplete');
assert(Array.isArray(data.entities)&&data.entities.length>=10,'Entity register incomplete');
const sourceIds=unique(data.sources.map(x=>x.id),'source ID');
const entityIds=unique(data.entities.map(x=>x.id),'entity ID');
const caseIds=unique(data.cases.map(x=>x.id),'case ID');
unique(data.cases.map(x=>x.slug),'case slug');
for(const source of data.sources){
 assert(slug.test(source.id),'Invalid source id '+source.id);
 assert(source.title?.length>=15,'Source title too short '+source.id);
 assert(linkOk(source.url),'Invalid source link '+source.id);
 if(source.published_at)assert(dateOk(source.published_at),'Invalid source date '+source.id);
 assert(source.kind?.length>=6,'Missing source type '+source.id);
}
for(const entity of data.entities){
 assert(slug.test(entity.id),'Invalid entity id '+entity.id);
 assert(entity.name?.length>=3&&entity.role?.length>=4,'Entity missing role '+entity.id);
}
for(const study of data.cases){
 const id=study.id||'unknown';
 assert(/^POL-\d{3}$/.test(id),'Invalid case ID '+id);
 assert(slug.test(study.slug),'Invalid case slug '+id);
 for(const key of ['topic','title','summary','status','scope','legal_stage','opening','next_check','limits'])assert(study[key]?.length>25||(['topic','scope','status'].includes(key)&&study[key]?.length>5),'Missing or weak '+key+' on '+id);
 assert(['alta','urgente','normal'].includes(study.priority),'Unrecognized priority '+id);
 assert(dateOk(study.first_record)&&study.first_record<=data.reviewed_at,'Invalid first record '+id);
 const attached=unique(study.source_ids||[],'case source list '+id);
 assert(attached.size>=2,'Need at least two source IDs '+id);
 for(const source of attached)assert(sourceIds.has(source),'Missing source '+source+' on '+id);
 for(const entity of study.entity_ids||[])assert(entityIds.has(entity),'Missing linked entity '+entity+' on '+id);
 assert(study.facts?.length>=3,'Too few facts '+id);
 for(const fact of study.facts||[]){
  assert(fact.finding?.length>=55,'Unexplained fact '+id);
  assert(attached.has(fact.source),'Fact lacks registered source '+id+': '+fact.source);
  assert(['documentado','valor-reportado','posição-da-parte','levantamento-histórico','reportagem-a-confirmar-nos-autos','apuração-noticiada','apuração-com-versão','versão-do-citado','medidas-oficiais-reportadas','levantamento-independente','denúncias-reportadas','apuração-jornalística','declaração-governamental','relatos-registrados','levantamento-jornalístico'].includes(fact.kind),'Unclassified evidence '+id+': '+fact.kind);
 }
 assert(study.timeline?.length>=2,'Insufficient timeline '+id);
 let previous='';
 for(const event of study.timeline||[]){
  assert(dateOk(event.date)&&event.date<=data.reviewed_at,'Future/invalid timeline date '+id);
  assert(event.date>=previous,'Timeline not chronological '+id);
  previous=event.date;
  assert(event.title?.length>=8&&event.detail?.length>=30,'Thin timeline event '+id);
  assert(attached.has(event.source),'Timeline unregistered source '+id+': '+event.source);
 }
 assert(study.questions?.length>=3&&study.questions.every(x=>x.length>=40),'Insufficient open questions '+id);
 assert(study.limits?.length>=80,'Limits too short '+id);
}
for(const edge of data.relationships||[]){
 for(const field of ['from','to'])assert(entityIds.has(edge[field]),'Edge missing '+field);
 assert(caseIds.has(edge.case_id),'Edge case missing '+edge.case_id);
 const study=data.cases.find(x=>x.id===edge.case_id);
 assert(study?.entity_ids.includes(edge.from)&&study?.entity_ids.includes(edge.to),'Edge not scoped to case '+edge.case_id);
 assert(study?.source_ids.includes(edge.source),'Edge missing source '+edge.source);
 assert(edge.relation?.length>=15,'Edge risks implying guilt by association');
}
for(const s of data.sponsorships||[]){
 assert(s.club&&s.brand,'Unidentified sports sponsor');
 assert(dateOk(s.as_of)&&s.as_of<'2026-09-25','Sponsorship snapshot must precede MP and be dated');
 assert(sourceIds.has(s.source),'Sponsorship source not found');
 assert(s.status?.includes('anterior à MP'),'Historical sponsorship must not be presented as active');
}
const serialized=JSON.stringify(data);
assert(!/(?:\b\d{3}\.\d{3}\.\d{3}-\d{2}\b)/.test(serialized),'Possible CPF in public dataset');
if(errors.length){for(const error of errors)console.error('[politics]',error);process.exit(1);}
console.log('Political observatory verified: '+data.cases.length+' dossiers; '+data.sources.length+' source references; '+data.entities.length+' entities; '+data.relationships.length+' documented relations; '+data.sponsorships.length+' historical sponsorships.');

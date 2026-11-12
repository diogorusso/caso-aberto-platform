import {readFileSync} from 'node:fs';
const load=n=>JSON.parse(readFileSync(new URL('../src/data/'+n+'.json',import.meta.url),'utf8'));
const directory=load('case-contact-directory');
const casos=load('casos'), atlas=load('public-case-atlas'), politics=load('political-observatory');
const legal=load('cacofonias-escola-suico-brasileira');
const ids=[...casos.map(c=>c.id),...atlas.cases.map(c=>c.id),...politics.cases.map(c=>c.id),'PLAT-2026-CASE',legal.id];
const errors=[],check=(ok,msg)=>{if(!ok)errors.push(msg)};
check(directory.version===1,'invalid contact directory version');
check(new Set(ids).size===ids.length,'duplicate case IDs');
check(Object.keys(directory.case_coverage).length===ids.length,'missing or extra case coverage');
const contactIds=new Set();
for(const c of directory.contacts){
 check(!contactIds.has(c.id),'duplicate contact '+c.id);contactIds.add(c.id);
 check(['whatsapp','email','instagram','phone','portal'].includes(c.medium),'invalid medium '+c.id);
 check(['empresa','social','administracao_judicial'].includes(c.role),'invalid scope '+c.id);
 check(/^https:\/\//.test(c.source_url),'missing HTTPS original source '+c.id);
 check(/^2026-\d\d-\d\d$/.test(c.verified_at),'missing review date '+c.id);
 check(c.note.length>55,'insufficient caveat/scope '+c.id);
 if(c.medium==='whatsapp')check(/^55\d{10,11}$/.test(c.value),'invalid WhatsApp number '+c.id);
 if(c.medium==='email')check(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.value),'invalid email '+c.id);
 if(c.medium==='portal')check(/^https:\/\//.test(c.value),'invalid portal '+c.id);
 if(c.medium==='instagram')check(/^[a-zA-Z0-9_.]+$/.test(c.value),'invalid Instagram account '+c.id);
 for(const id of c.case_ids)check(ids.includes(id),'orphan case contact '+c.id+' '+id);
}
for(const id of ids){
 const coverage=directory.case_coverage[id];
 check(Boolean(coverage),'missing contact coverage '+id);
 if(!coverage)continue;
 check(['partial','complete'].includes(coverage.status),'invalid coverage status '+id);
 check(Boolean(coverage.note),'missing gap note '+id);
 for(const cid of coverage.contact_ids||[]){
  const c=directory.contacts.find(c=>c.id===cid);
  check(Boolean(c),'unknown contact '+cid+' on '+id);
  check(c?.case_ids.includes(id),'incorrect case association '+cid+' on '+id);
 }
}
if(errors.length){errors.forEach(e=>console.error('[contacts] '+e));process.exit(1);}
console.log('Contact directory verified: '+ids.length+' case audits, '+directory.contacts.length+' sourced institutional channels, '+ids.filter(id=>directory.case_coverage[id].contact_ids.length>0).length+' cases with specific channels.');

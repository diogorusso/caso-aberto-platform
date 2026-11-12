/** Compact single-case research handoff. Does not browse, infer identity or spend model tokens. */
import {readFileSync} from 'node:fs';
const read=n=>JSON.parse(readFileSync(new URL('../src/data/'+n+'.json',import.meta.url),'utf8'));
const args=process.argv.slice(2),id=args[args.indexOf('--case')+1];
if(!id||id.startsWith('--')){console.error('Usage: npm run contact:packet -- --case EXT-004');process.exit(2);}
const own=read('casos'),atlas=read('public-case-atlas'),pol=read('political-observatory'),platform=read('platform-observatory'),dir=read('case-contact-directory'),channels=read('case-action-channels');
const c=own.find(x=>x.id===id),e=atlas.cases.find(x=>x.id===id),p=pol.cases.find(x=>x.id===id);
const known=dir.case_coverage[id];
if(!known){console.error('Unknown case: '+id);process.exit(2);}
const sourceRefs=c?.fontes||e?.sources||p?.source_ids.map(key=>pol.sources?.[key]||key)||[];
const title=c?.titulo||e?.headline||p?.title||'Governança e moderação de plataformas';
const issue=channels.issues[id]||title;
const related=(channels.related[id]||[]).map(x=>({id:x,url:channels.channels[x]?.url,source:channels.channels[x]?.source_url}));
const packet={
 case_id:id, title,problem:issue, status:c?.status||e?.status_label||p?.status||platform.reviewed_at,
 reviewed_at:c?.status_data||e?.reviewed_at||pol.reviewed_at,
 source_peek:sourceRefs.slice(0,3),
 direct_contacts:dir.contacts.filter(x=>known.contact_ids.includes(x.id)),
 existing_official_routes:related,
 research_gaps:known.note,
 checklist:['entity/brand versus contracting party','official WhatsApp, email, form, phone and Instagram','indirect competent Procon, regulator, ombudsman or court portal','official source, date, scope, provenance and corrections','message uses only attributed case facts and current stage'],
 rules:'Public institutional channels only. No personal numbers or individual pressure. No invented account or WhatsApp links. Do not submit or send messages; the visitor reviews and sends.',
};
const output=JSON.stringify(packet);
if(output.length>6000){packet.source_peek=packet.source_peek.slice(0,1);packet.existing_official_routes=packet.existing_official_routes.slice(0,2);}
console.log(JSON.stringify(packet,null,2));

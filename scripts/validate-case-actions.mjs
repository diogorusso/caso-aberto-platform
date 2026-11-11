import {readFileSync,existsSync} from 'node:fs';
const load=n=>JSON.parse(readFileSync(new URL('../src/data/'+n+'.json',import.meta.url),'utf8'));
const records=load('case-action-channels'),cases=load('casos'),atlas=load('public-case-atlas'),politics=load('political-observatory'),media=load('case-visual-assets');
const ids=[...cases.map(x=>x.id),...atlas.cases.map(x=>x.id),...politics.cases.map(x=>x.id),'PLAT-2026-CASE'];
const errors=[],assert=(bool,msg)=>{if(!bool)errors.push(msg)};
assert(records.version===1,'invalid schema');
assert(ids.length===24,'case count changed; reconcile mapping');
assert((media.assets||[]).length>=ids.length,'case-visual-assets must cover every research case');
const mediaIds=new Set((media.assets||[]).map(item=>item.case_id));
for(const id of ids)assert(mediaIds.has(id),'missing visual asset row for '+id);
for(const [key,c] of Object.entries(records.channels)){
 assert(c.url?.startsWith('https://'),'invalid channel URL '+key);
 assert(c.source_url?.startsWith('https://'),'channel lacks source '+key);
 assert(c.note?.length>35,'channel lacks scope note '+key);
 assert(['empresa','publico','privado','judicial'].includes(c.kind),'unknown channel kind '+key);
}
for(const id of ids){
 const civic=id.startsWith('POL-')||id==='PLAT-2026-CASE';
 if(civic)assert(Boolean(records.channels.falabr),'civic source missing');
 else{
  assert(Boolean(records.regional[id]),'missing case region '+id);
  assert(Boolean(records.official_paths[records.regional[id]]),'missing local channel routing '+id);
  assert(Boolean(records.issues[id]),'missing case-specific issue '+id);
 }
 for(const key of records.related[id]||[])assert(Boolean(records.channels[key]),'unresolved case channel '+id+':'+key);
}
for(const item of media.assets||[]){
 assert(Boolean(item.case_id&&item.company),'visual asset incomplete '+item.case_id);
 assert(item.cover?.startsWith('/og/')&&existsSync(new URL('../public'+item.cover,import.meta.url)),'missing cover '+item.cover);
 for(const p of [item.photo,item.logo].filter(Boolean)){
  assert(String(p).startsWith('/media/')&&existsSync(new URL('../public'+p,import.meta.url)),'missing media file '+p);
 }
 if(item.photo)assert(item.is_incident_photo===false,'incident photo must stay false unless verified');
}
for(const p of ['src/lib/case-actions.ts','src/lib/case-media.ts','src/components/CaseActionHub.astro','src/pages/casos/acoes/[id]/index.astro','src/pages/guias/como-acionar-empresa-na-justica/index.astro','scripts/generate-og-images.mjs'])assert(existsSync(new URL('../'+p,import.meta.url)),'missing component '+p);
const meta=readFileSync(new URL('../src/layouts/BaseLayout.astro',import.meta.url),'utf8');
assert(meta.includes('og:image:width')&&meta.includes("image = '/og/default.png'"),'PNG metadata is incomplete');
if(errors.length){errors.forEach(e=>console.error('[case-action]',e));process.exit(1);}
console.log('Case-action inventory: '+ids.length+' case pages; '+Object.keys(records.channels).length+' source-backed channels; '+media.assets.length+' visual assets with covers; Florense photo/logo preserved.');

#!/usr/bin/env node
/** Emit one bounded, valid JSON research capsule. Never feed the entire repo to an LLM. */
import {readFileSync} from 'node:fs';
import {sourceCases} from './case-watch-core.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../src/data/'+n+'.json',import.meta.url),'utf8'));
const owned=read('casos'),external=read('public-case-atlas'),politics=read('political-observatory'),platforms=read('platform-observatory'),policy=read('case-watch-policy'),stories=read('impact-stories');
const legalDossier=read('cacofonias-escola-suico-brasileira');
const index=sourceCases(owned,external,politics,platforms,legalDossier);
const args=process.argv.slice(2);
const arg=key=>{const i=args.indexOf(key);return i<0?'':args[i+1]||''};
const id=arg('--case');
const budget=Math.max(2200,Math.min(8000,Number(arg('--max-chars'))||4800));
if(!id){
 console.log(index.map(x=>x.id+' | '+x.kind+' | '+x.date+' | '+x.status).join('\n'));
 process.exit(0);
}
const row=index.find(x=>x.id===id),cfg=policy.cases.find(x=>x.id===id);
if(!row||!cfg)throw new Error('Case not in registry '+id);
const story=stories.cases.find(x=>x.id===id);
const clip=(s,n=240)=>String(s||'').slice(0,n);
const capsule={
 id:row.id,kind:row.kind,href:row.href,
 status:clip(row.status,180),last_published_review:row.date,
 focus:clip(cfg.focus,350),closure_requirement:clip(cfg.closure_evidence,240),
 watch_urls:cfg.watch_urls.slice(0,2),
 editorial_voice:'Pergunta incômoda → evidência atribuída → consequência concreta → cobrança → ação. Consultar skill PT-BR; não fabricar números ou conclusões.',
 public_impact:story?{headline:clip(story.headline,120),worst_case:clip(story.worst_case,280)}:null,
 sources:[],facts:[],timeline:[],questions:[],
 next_action:'Verificar apenas fontes novas relevantes. Sem alteração material: registrar sem novidade e encerrar issue. Com fato novo: atualizar JSON específico, impacto, validar e publicar após revisão.'
};
const ownedCase=owned.find(x=>x.id===id),externalCase=external.cases.find(x=>x.id===id),political=politics.cases.find(x=>x.id===id);
if(ownedCase){
 capsule.sources=ownedCase.fontes.map(s=>({label:clip(s.titulo,95),url:s.url})).slice(0,3);
 capsule.facts=[clip(ownedCase.resumo,300),clip(ownedCase.impacto,200)].filter(Boolean);
 capsule.timeline=ownedCase.cronologia.slice(-3).map(e=>({date:e.data,title:clip(e.titulo,110)}));
 capsule.questions=ownedCase.pedidos.slice(0,3).map(e=>clip(e.titulo+': '+e.texto,220));
}else if(externalCase){
 capsule.sources=externalCase.sources.slice(0,3).map(s=>({label:clip(s.name,95),url:s.url}));
 capsule.facts=externalCase.verified.slice(0,3).map(s=>clip(s,300));
 capsule.timeline=externalCase.timeline.slice(-3).map(e=>({date:e.date,title:clip(e.label,110)}));
 capsule.questions=externalCase.questions.slice(0,3).map(s=>clip(s,220));
}else if(political){
 capsule.sources=political.source_ids.slice(0,3).map(key=>politics.sources.find(s=>s.id===key)).filter(Boolean).map(s=>({label:clip(s.title,95),url:s.url}));
 capsule.facts=political.facts.slice(-3).map(f=>clip(f.finding,290));
 capsule.timeline=political.timeline.slice(-3).map(e=>({date:e.date,title:clip(e.title,120)}));
 capsule.questions=political.questions.slice(0,3).map(s=>clip(s,220));
}else if(row.kind==='legal'){
 capsule.sources=legalDossier.sources.slice(-3).map(s=>({label:clip(s.name,95),url:s.url}));
 capsule.facts=legalDossier.fact_checks.slice(0,3).map(s=>clip(s.value+' — '+s.note,300));
 capsule.timeline=legalDossier.timeline.slice(-3).map(s=>({date:s.date,title:clip(s.label,120)}));
 capsule.questions=legalDossier.questions.slice(0,3).map(s=>clip(s,220));
}else{
 capsule.sources=platforms.records.slice(-3).map(s=>({label:clip(s.headline,95),url:s.source_url}));
 capsule.facts=platforms.records.slice(-3).map(s=>clip(s.finding,280));
 capsule.timeline=platforms.records.slice(-3).map(s=>({date:s.date,title:clip(s.headline,120)}));
}
const render=()=>JSON.stringify(capsule,null,2);
while(render().length>budget){
 let removed=false;
 for(const key of ['facts','timeline','questions','sources']){
  if(capsule[key].length>1){capsule[key].pop();removed=true;break;}
 }
 if(!removed){capsule.focus=clip(capsule.focus,150);capsule.public_impact=null;break;}
}
if(render().length>budget)throw new Error('Capsule exceeds hard budget, increase --max-chars');
console.log(render());

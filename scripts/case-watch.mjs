#!/usr/bin/env node
/** Zero-LLM scheduled checker. Creates ONLY a local review outbox and cache.
 * GitHub Issues are synchronized by the separate case-watch-issues.mjs.
 */
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {planReviews,sourceCases,validatePolicy} from './case-watch-core.mjs';
const root=resolve(import.meta.dirname,'..');
const read=p=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const policy=read('src/data/case-watch-policy.json');
const index=sourceCases(read('src/data/casos.json'),read('src/data/public-case-atlas.json'),read('src/data/political-observatory.json'),read('src/data/platform-observatory.json'),read('src/data/cacofonias-escola-suico-brasileira.json'));
const args=process.argv.slice(2);
const arg=name=>{const i=args.indexOf(name);return i<0?'':args[i+1]||'';};
const has=name=>args.includes(name);
const today=arg('--today')||new Date().toISOString().slice(0,10);
const statePath=resolve(root,arg('--state')||'.case-watch-cache/state.json');
const outPath=resolve(root,arg('--out')||'.case-watch-cache/outbox.json');
const issuesPath=resolve(root,arg('--open-issues')||'.case-watch-cache/open-issues.json');
const offline=has('--offline');
const errors=validatePolicy(policy,index);
if(errors.length){for(const e of errors)console.error('[case-watch] '+e);process.exit(1);}
if(has('--validate')){console.log('Case watch policy valid for '+index.length+' dossiers');process.exit(0);}
const state=existsSync(statePath)?JSON.parse(readFileSync(statePath,'utf8')):{version:1,sources:{}};
if(state.version!==1||typeof state.sources!=='object'||!state.sources)throw new Error('Unsupported cache state; no claims will be published');
let open=[];const completedAt={};
if(existsSync(issuesPath)){
 const raw=JSON.parse(readFileSync(issuesPath,'utf8'));
 if(!Array.isArray(raw))throw new Error('Expected array of GitHub issue titles');
 for(const value of raw){
  const title=typeof value==='string'?value:value?.title||'';
  const m=title.match(/^\[case-watch:([A-Z0-9-]+)\]/);
  if(!m)continue;
  if(typeof value==='string'||value.state==='OPEN')open.push(m[1]);
  else if(value.state==='CLOSED'&&typeof value.closedAt==='string')completedAt[m[1]]=value.closedAt.slice(0,10);
 }
}
const candidates=planReviews({policy,index,today,openIssueIds:open,completedAt,caseId:arg('--case'),force:has('--force')});
const maxReq=policy.schedule.max_source_requests_per_run;
const maxBytes=policy.schedule.max_response_bytes;
const changed=[],failures=[],checks=[];
let attempted=0;
const digest=text=>createHash('sha256').update(text).digest('hex').slice(0,20);
function clean(body,contentType){
 if(!contentType.includes('html'))return body.trim().replace(/\s+/g,' ').slice(0,maxBytes);
 return body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi,' ').replace(/<!--([\s\S]*?)-->/g,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim().slice(0,maxBytes);
}
async function inspect(url){
 attempted++;
 const previous=state.sources[url]||null;
 const headers={'accept':'text/html,application/json,application/xml,text/plain;q=0.8','user-agent':'CasoAberto-SourceMonitor/1.0 (+https://casoaberto.pages.dev/)','cache-control':'no-cache'};
 if(previous?.etag)headers['if-none-match']=previous.etag;
 if(previous?.last_modified)headers['if-modified-since']=previous.last_modified;
 try{
  const res=await fetch(url,{headers,redirect:'manual',signal:AbortSignal.timeout(policy.schedule.request_timeout_ms)});
  if(res.status===304){checks.push({url,result:'unchanged'});return;}
  if(res.status!==200){failures.push({url,status:res.status});return;}
  const contentType=res.headers.get('content-type')||'';
  if(!/text\/|application\/(?:json|xml|rss\+xml|atom\+xml)/i.test(contentType)){failures.push({url,status:'unsupported-type'});return;}
  const reader=res.body?.getReader();if(!reader){failures.push({url,status:'no-body'});return;}
  const buffers=[];let size=0;let tooLarge=false;
  while(true){
   const {done,value}=await reader.read();if(done)break;
   size+=value.length;
   if(size>maxBytes){tooLarge=true;await reader.cancel();break;}
   buffers.push(value);
  }
  if(tooLarge){failures.push({url,status:'over-byte-limit'});return;}
  const content=clean(Buffer.concat(buffers).toString('utf8'),contentType);
  if(content.length<100){failures.push({url,status:'too-short'});return;}
  const fingerprint=digest(content);
  state.sources[url]={hash:fingerprint,etag:res.headers.get('etag')||'',last_modified:res.headers.get('last-modified')||'',checked_at:today};
  const diff=previous?.hash && previous.hash!==fingerprint;
  checks.push({url,result:diff?'content-changed':previous?'unchanged':'baseline'});
  if(diff)changed.push({url,reason:'conteúdo da fonte alterado; requer verificação'});
 }catch(e){failures.push({url,status:e.name==='TimeoutError'?'timeout':'unavailable'});}
}
for(const c of candidates)for(const url of c.watch_urls){
 if(offline||attempted>=maxReq)break;
 if(checks.some(x=>x.url===url)||failures.some(x=>x.url===url))continue;
 await inspect(url);
}
const outbox={version:1,run_date:today,execution:offline?'offline-preview':'source-check',
 token_spend:0,source_requests:attempted,failures:failures.length,checked:checks.length,
 cases:candidates.map(c=>({...c,changed_sources:changed.filter(x=>c.watch_urls.includes(x.url))})),
 source_checks:checks,source_failures:failures};
for(const path of [statePath,outPath])mkdirSync(dirname(path),{recursive:true});
writeFileSync(statePath,JSON.stringify(state,null,2)+'\n');
writeFileSync(outPath,JSON.stringify(outbox,null,2)+'\n');
console.log('Case watch '+today+': '+index.length+' registered; '+open.length+' already queued; '+candidates.length+' new review packets; '+attempted+' requests; '+changed.length+' candidate source changes; '+failures.length+' unavailable; 0 LLM tokens.');
for(const c of outbox.cases)console.log(c.id+' | '+c.priority+' | '+c.reasons.join(', ')+' | changed sources '+c.changed_sources.length);
if(process.env.GITHUB_STEP_SUMMARY){
 const {appendFileSync}=await import('node:fs');
 appendFileSync(process.env.GITHUB_STEP_SUMMARY,'### CasoAberto · revisão de fontes\n\n'+
 'Casos na fila: **'+candidates.length+'** · Checagens HTTP: **'+attempted+'** · Fontes alteradas: **'+changed.length+'** · Indisponíveis: **'+failures.length+'** · Tokens de LLM: **0**.\n');
}

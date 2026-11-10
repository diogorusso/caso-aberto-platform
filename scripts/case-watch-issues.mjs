#!/usr/bin/env node
/** Sync ONLY actionable research issues; never edit the published site or send messages.
 * Idempotent by [case-watch:ID] key, and no comments on unchanged open issues.
 */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {issueBody} from './case-watch-core.mjs';
const root=resolve(import.meta.dirname,'..');
const args=process.argv.slice(2);
const flag=s=>args.includes(s);
const outIdx=args.indexOf('--outbox');
const outbox=JSON.parse(readFileSync(resolve(root,outIdx>=0?args[outIdx+1]:'.case-watch-cache/outbox.json'),'utf8'));
if(outbox.version!==1||!Array.isArray(outbox.cases))throw new Error('Invalid case-review outbox');
const dry=flag('--dry-run')||!process.env.GH_TOKEN;
function gh(args){
 const command=spawnSync('gh',args,{encoding:'utf8',env:process.env,timeout:30000});
 if(command.error||command.status!==0)throw new Error('GitHub issue synchronization failed: '+(command.stderr||command.error?.message||'unknown').slice(0,500));
 return command.stdout.trim();
}
let existing=[];
if(!dry)existing=JSON.parse(gh(['issue','list','--state','all','--limit','250','--json','title,number,state']));
let created=0,reopened=0,skipped=0;
for(const entry of outbox.cases){
 if(!/^(CA|EXT|POL)-\d{3}$/.test(entry.id)&&entry.id!=='PLAT-2026-CASE')throw new Error('Unsafe case ID');
 const title='[case-watch:'+entry.id+'] Revisar evidências e status do caso';
 const found=existing.find(issue=>issue.title===title);
 if(dry){console.log('DRY-RUN '+title+' | '+entry.reasons.join(', ')+' | '+entry.changed_sources.length+' fontes sinalizadas');continue;}
 if(found?.state==='OPEN'){skipped++;continue;}
 const body=issueBody(entry,entry.changed_sources);
 const temp=resolve(root,'.case-watch-cache/issue-body.md');
 mkdirSync(resolve(root,'.case-watch-cache'),{recursive:true});
 writeFileSync(temp,body);
 if(found?.state==='CLOSED'){
  gh(['issue','reopen',String(found.number)]);
  gh(['issue','comment',String(found.number),'--body-file',temp]);
  reopened++;
 }else{
  gh(['issue','create','--title',title,'--body-file',temp]);
  created++;
 }
}
console.log('Case review queue: '+created+' created, '+reopened+' reopened, '+skipped+' already open; no editorial data or static website modified.');

#!/usr/bin/env node
/** Finish a verified case-monitor review without pretending a no-change check is a publication.
 * This command only records evidence in the existing GitHub issue and closes it.
 */
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {sourceCases} from './case-watch-core.mjs';
const args=process.argv.slice(2);
const val=key=>{const idx=args.indexOf(key);return idx>=0?args[idx+1]||'':'';};
const id=val('--case'),outcome=val('--outcome'),note=val('--note'),evidence=val('--source'),commit=val('--commit');
const reviewer=val('--reviewer');
const method=val('--method')||'human';
const yes=args.includes('--apply');
const repo='diogorusso/caso-aberto-platform';
const read=name=>JSON.parse(readFileSync(new URL('../src/data/'+name+'.json',import.meta.url),'utf8'));
const records=sourceCases(read('casos'),read('public-case-atlas'),read('political-observatory'),read('platform-observatory'),read('cacofonias-escola-suico-brasileira'));
const policy=read('case-watch-policy').cases.find(x=>x.id===id);
const entry=records.find(x=>x.id===id);
if(!entry||!policy)throw new Error('Unknown or unregistered case');
if(!['no-change','published','closed'].includes(outcome))throw new Error('Use --outcome no-change|published|closed');
if(!['human','automated'].includes(method))throw new Error('Use --method human|automated');
if(reviewer.trim().length<3||note.trim().length<55)throw new Error('Reviewer/agent identifier and substantial verification note required');
if(method==='automated'&&outcome!=='no-change')throw new Error('Automated completion only supports no-change. Publication and definitive closure require independent editorial approval.');
if(!/^https:\/\/[a-z0-9.-]+\//i.test(evidence))throw new Error('A public HTTPS verification source is required');
if(outcome==='published'&&!/^[0-9a-f]{40}$/.test(commit))throw new Error('A verified 40-digit published commit SHA is required');
if(outcome==='closed'&&(policy.mode!=='closed'||!policy.closed_at||policy.closure_source_url!==evidence))throw new Error('First publish and validate case resolution, then explicitly close its monitoring policy with matching closure source');
if(!yes){console.log('Preview: '+id+' '+outcome+' reviewed by '+reviewer+'; no GitHub issue was changed. Add --apply after review.');process.exit(0);}
if(!process.env.GH_TOKEN)throw new Error('GH_TOKEN is required to close the GitHub issue');
const gh=parts=>{
 const r=spawnSync('gh',parts,{encoding:'utf8',timeout:30000,env:process.env});
 if(r.error||r.status!==0)throw new Error((r.stderr||r.error?.message||'GitHub command failed').slice(0,500));
 return r.stdout.trim();
};
const issues=JSON.parse(gh(['issue','list','--repo',repo,'--state','open','--limit','250','--json','number,title']));
const found=issues.find(x=>x.title==='[case-watch:'+id+'] Revisar evidências e status do caso');
if(!found)throw new Error('No open review issue for '+id);
const today=new Date().toISOString().slice(0,10);
const body=['### Revisão editorial concluída · '+today,
 '**Caso:** '+id,
 '**Resultado:** '+outcome,
 '**Verificação:** '+(method==='automated'?'automação de pesquisa (sem aprovação editorial humana)':'revisão editorial humana'),
 '**Executado por:** '+reviewer,
 '**Documento conferido:** '+evidence,
 ...(commit?['**Commit publicado:** '+commit]:[]),
 '**Registro:** '+note,
 'Sem mudança: o próximo ciclo considera esta data, sem alterar o conteúdo estático.',
 'Publicação: a versão e seu deploy permanecem auditáveis no GitHub.',
 'Encerramento: a política closed impede novas verificações programadas.'
].join('\n\n');
gh(['issue','comment',String(found.number),'--repo',repo,'--body',body]);
gh(['issue','close',String(found.number),'--repo',repo]);
console.log('Closed review issue #'+found.number+' for '+id+'; outcome='+outcome+'. No site data was edited by this command.');

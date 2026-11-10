/** Pure scheduling, lifecycle and evidence-selection rules for the static CasoAberto registry.
 * No model/API calls and no website writes. Keep this module side-effect free.
 */
export const iso = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value+'T12:00:00Z')) && new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
export const addDays=(date,days)=>new Date(Date.parse(date+'T12:00:00Z')+days*86400000).toISOString().slice(0,10);
export const rank={urgent:0,high:1,standard:2};
const importantKeys=['focus','closure_evidence'];
const https=url=>typeof url==='string'&&/^https:\/\/[a-z0-9.-]+(?::443)?(?:\/|$)/i.test(url)&&!/@/.test(url.split('/').slice(0,3).join('/'));
export const sourceCases=(owned,atlas,political,platform)=>{
 const out=[
  ...owned.map(item=>({id:item.id,slug:item.slug,href:'/casos/'+item.slug+'/',date:item.status_data,status:item.status,kind:'consumer'})),
  ...atlas.cases.map(item=>({id:item.id,slug:item.slug,href:'/casos/arquivo-publico/'+item.slug+'/',date:item.reviewed_at,status:item.status_label,kind:'external'})),
  ...political.cases.map(item=>({id:item.id,slug:item.slug,href:'/observatorio/politica/'+item.slug+'/',date:item.reviewed_at,status:item.status,kind:'political'})),
  {id:'PLAT-2026-CASE',slug:'meta-eleicoes-2026-governanca-plataformas',href:'/observatorio/plataformas/',date:platform.reviewed_at,status:'Registros institucionais acompanhados',kind:'platform'},
 ];
 return out;
};
export function validatePolicy(policy,index){
 const problems=[],ids=new Set(),byId=new Map(index.map(x=>[x.id,x]));
 if(policy.version!==1)problems.push('policy.version must be 1');
 if(!iso(policy.updated_at))problems.push('Invalid policy update date');
 if(!Array.isArray(policy.cases))return ['Case policy missing'];
 if(!Number.isSafeInteger(policy.schedule?.max_source_requests_per_run)||policy.schedule.max_source_requests_per_run<1||policy.schedule.max_source_requests_per_run>30)problems.push('Unbounded source budget');
 if(!Number.isSafeInteger(policy.schedule?.max_review_cases_per_run)||policy.schedule.max_review_cases_per_run<1||policy.schedule.max_review_cases_per_run>12)problems.push('Unbounded case budget');
 for(const item of policy.cases){
  if(ids.has(item.id))problems.push('Duplicate case '+item.id);
  ids.add(item.id);
  if(!byId.has(item.id))problems.push('Unknown case '+item.id);
  if(!['active','paused','closed'].includes(item.mode))problems.push('Invalid lifecycle state '+item.id);
  if(!(item.priority in rank))problems.push('Invalid priority '+item.id);
  if(!Number.isInteger(item.interval_days)||item.interval_days<1||item.interval_days>90)problems.push('Invalid review interval '+item.id);
  if(importantKeys.some(key=>typeof item[key]!=='string'||item[key].length<30))problems.push('Incomplete review requirements '+item.id);
  if(!Array.isArray(item.watch_urls)||item.watch_urls.length>policy.schedule.max_requests_per_case||item.watch_urls.some(u=>!https(u)))problems.push('Invalid watch URL cap '+item.id);
  if(!Array.isArray(item.deadlines)||item.deadlines.some(d=>!iso(d)))problems.push('Invalid deadline '+item.id);
  if(item.mode==='closed'&&(!iso(item.closed_at)||!https(item.closure_source_url||'')))problems.push('Closed case lacks verifiable closure date and source '+item.id);
  if(item.mode==='closed'&&item.closed_at<byId.get(item.id)?.date)problems.push('Closed before last case revision '+item.id);
 }
 for(const item of index)if(!ids.has(item.id))problems.push('Case omitted from monitoring '+item.id);
 return problems;
}
export function planReviews({policy,index,today,openIssueIds=[],completedAt={},caseId='',force=false}){
 if(!iso(today))throw new Error('Invalid date');
 const errors=validatePolicy(policy,index);
 if(errors.length)throw new Error(errors.join('; '));
 if(caseId&&!index.some(x=>x.id===caseId))throw new Error('Unknown case '+caseId);
 const open=new Set(openIssueIds),lookups=new Map(index.map(x=>[x.id,x]));
 const candidates=[];
 for(const config of policy.cases){
  if(caseId&&config.id!==caseId)continue;
  if(config.mode!=='active'||open.has(config.id))continue;
  const item=lookups.get(config.id);
  const completion=completedAt[config.id];
  const lastCheck=iso(completion)&&completion>item.date?completion:item.date;
  const deadline=config.deadlines.some(d=>d<=today&&d>lastCheck);
  const overdue=addDays(lastCheck,config.interval_days)<=today;
  if(!force&&!deadline&&!overdue)continue;
  candidates.push({id:item.id,href:item.href,kind:item.kind,status:item.status,reviewed_at:item.date,
   priority:config.priority,last_checked_at:lastCheck,focus:config.focus,closure_evidence:config.closure_evidence,
   watch_urls:config.watch_urls.slice(0,policy.schedule.max_requests_per_case),
   reasons:[...(force?['solicitação manual']:[]),...(deadline?['prazo público vencido']:[]),...(overdue?['revisão periódica vencida']:[])],
   overdue_days:Math.max(0,Math.floor((Date.parse(today+'T12:00:00Z')-Date.parse(addDays(lastCheck,config.interval_days)+'T12:00:00Z'))/86400000))
  });
 }
 candidates.sort((a,b)=>rank[a.priority]-rank[b.priority]||b.overdue_days-a.overdue_days||a.id.localeCompare(b.id));
 return candidates.slice(0,caseId?1:policy.schedule.max_review_cases_per_run);
}
export function issueBody(entry,changedSources=[]){
 const evidence=changedSources.length?changedSources.map(x=>'- '+x.url+' ('+x.reason+')').join('\n'):'- Nenhuma mudança de fonte comprovada pelo rastreador; faça busca por atos novos.';
 return [
  '## '+entry.id+' — pesquisa pontual e atualização do CasoAberto',
  '**Caso:** '+entry.href,
  '**Última revisão publicada do dossiê:** '+entry.reviewed_at,
  '**Última verificação editorial:** '+entry.last_checked_at,
  '**Estado publicado:** '+entry.status,
  '**Motivo:** '+entry.reasons.join('; '),
  '**Pergunta de pesquisa:** '+entry.focus,
  '### Fontes sinalizadas ou em observação',
  evidence,
  '### Encerramento exige',
  entry.closure_evidence,
  '### Execução de baixo custo',
  '1. Leia apenas este dossiê e os links indicados; encontre um ato novo em fonte primária e a manifestação correspondente.',
  '2. Sem novidade verificável: marque a checagem como sem alteração; NÃO mude a data editorial e NÃO faça deploy.',
  '3. Com novidade: ajuste a fonte JSON específica, cronologia, contraditório e o cenário visual; preserve atribuições e o tom da skill PT-BR.',
  '4. Somente após verificação editorial real: npm run verify:data && npm run check && npm run build; commit em main publica o Astro estático.',
  '5. Feche esta tarefa somente após documentar o resultado. Caso resolvido requer fonte de fechamento, status atualizado e alteração explícita da política para closed.',
  '**Não publicar automaticamente:** mudança de hash de página, rumor, movimento judicial sem confirmação ou dados que exponham vítimas.',
  '',
  '_Fila gerada por verificações determinísticas sem modelo de linguagem; nenhum contato externo foi enviado._'
 ].join('\n');
}

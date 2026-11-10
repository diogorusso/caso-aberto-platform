import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {planReviews,validatePolicy,sourceCases,issueBody,addDays} from './case-watch-core.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../src/data/'+name+'.json',import.meta.url),'utf8'));
const policy=read('case-watch-policy');
const records=sourceCases(read('casos'),read('public-case-atlas'),read('political-observatory'),read('platform-observatory'));
test('all public cases have one bounded monitoring contract',()=>{
 assert.equal(records.length,policy.cases.length);
 assert.deepEqual(validatePolicy(policy,records),[]);
 assert.equal(new Set(policy.cases.map(c=>c.id)).size,records.length);
 for(const c of policy.cases){assert.ok(c.watch_urls.length<=2);assert.ok(c.focus.length>30);}
});
test('no review before its due date unless explicitly requested',()=>{
 const result=planReviews({policy,index:records,today:'2026-11-10'});
 assert.deepEqual(result.map(c=>c.id),['CA-001']);
 assert.ok(result[0].reasons.includes('revisão periódica vencida'));
});
test('urgent cases get priority; run is budget capped',()=>{
 const result=planReviews({policy,index:records,today:'2026-11-18'});
 assert.equal(result.length,policy.schedule.max_review_cases_per_run);
 assert.deepEqual(result.slice(0,2).map(c=>c.id),['POL-004','POL-005']);
});
test('open issues are not requeued; other cases use available slots',()=>{
 const initial=planReviews({policy,index:records,today:'2026-11-18'});
 const again=planReviews({policy,index:records,today:'2026-11-18',openIssueIds:initial.map(x=>x.id)});
 assert.equal(again.length,policy.schedule.max_review_cases_per_run);
 assert.equal(initial.some(x=>again.some(y=>y.id===x.id)),false);
});
test('completed no-change review defers recheck until next cadence',()=>{
 const last={ 'POL-001':'2026-11-18'};
 const tooSoon=planReviews({policy,index:records,today:'2026-11-19',caseId:'POL-001',completedAt:last});
 assert.equal(tooSoon.length,0);
 const due=planReviews({policy,index:records,today:'2026-11-20',caseId:'POL-001',completedAt:last});
 assert.equal(due.length,1);
 assert.equal(due[0].last_checked_at,'2026-11-18');
});
test('closed cases are excluded even if forced',()=>{
 const copy=structuredClone(policy);
 const item=copy.cases.find(c=>c.id==='CA-001');item.mode='closed';item.closed_at='2026-11-18';item.closure_source_url='https://example.org/prova';
 const index=records.map(c=>c.id==='CA-001'?{...c,status:'Resolvido e comprovado',date:'2026-11-18'}:c);
 assert.deepEqual(validatePolicy(copy,index),[]);
 assert.equal(planReviews({policy:copy,index,today:'2026-11-20',caseId:'CA-001',force:true}).length,0);
});
test('closure without evidence is rejected',()=>{
 const copy=structuredClone(policy);copy.cases[0].mode='closed';
 assert.ok(validatePolicy(copy,records).some(msg=>msg.includes('closure')));
});
test('deadline requires review until published evidence catches up',()=>{
 const d1=planReviews({policy,index:records,today:'2026-11-23',caseId:'POL-001'});
 assert.ok(d1[0].reasons.includes('prazo público vencido'));
 const index=records.map(c=>c.id==='POL-001'?{...c,date:'2026-11-24'}:c);
 const d2=planReviews({policy,index,today:'2026-11-24',caseId:'POL-001'});
 assert.equal(d2.length,0);
});
test('issue is concise, cites one case and avoids synthetic editorial approval',()=>{
 const c=planReviews({policy,index:records,today:'2026-11-11',caseId:'POL-004'});
 const text=issueBody(c[0],[]);
 assert.ok(text.includes('POL-004'));
 assert.ok(text.includes('Nenhuma mudança de fonte'));
 assert.ok(!text.includes('approved: true'));
 assert.ok(text.length<2500);
});
test('invalid case IDs and dates fail closed',()=>{
 assert.throws(()=>planReviews({policy,index:records,today:'2026-11-31'}));
 assert.throws(()=>planReviews({policy,index:records,today:'2026-11-11',caseId:'POL-999'}));
 assert.equal(addDays('2026-11-10',2),'2026-11-12');
});

test('one-case agent capsules stay valid JSON and under the hard token input cap',()=>{
 for(const id of ['CA-001','EXT-009','POL-001','PLAT-2026-CASE']){
  const output=execFileSync(process.execPath,[new URL('./case-review-packet.mjs',import.meta.url).pathname,'--case',id,'--max-chars','4200'],{encoding:'utf8'});
  assert.ok(output.length<=4201,'Capsule too long '+id);
  const packet=JSON.parse(output);
  assert.equal(packet.id,id);
  assert.ok(packet.sources.length>=1);
  assert.ok(packet.next_action.includes('Sem alteração material'));
 }
});

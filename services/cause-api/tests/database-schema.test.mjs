import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
const sql=readFileSync(new URL('../migrations/0001_private_causes.sql',import.meta.url),'utf8');
test('private D1 schema builds on SQLite with enforced foreign keys and roles',()=>{
 const db=new DatabaseSync(':memory:');
 try{
  db.exec(sql);
  const tables=db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(x=>x.name);
  for(const name of ['causes','memberships','cause_tasks','cause_evidence','cause_requests','cause_invites','audit_events'])assert.ok(tables.includes(name));
  assert.throws(()=>db.prepare("INSERT INTO memberships(cause_id,actor_id,role,consented_at) VALUES('unknown','actor','viewer','2026-11-09')").run());
  const id='11111111-1111-4111-8111-111111111111';
  db.prepare('INSERT INTO causes(id,owner_id,title,objective,domain,created_at,updated_at) VALUES(?,?,?,?,?,?,?)').run(id,'actor-hash','Exemplo','Pergunta documentada','comunidade','2026-11-09','2026-11-09');
  db.prepare('INSERT INTO memberships(cause_id,actor_id,role,consented_at) VALUES(?,?,?,?)').run(id,'actor-hash','owner','2026-11-09');
  assert.equal(db.prepare('SELECT role FROM memberships WHERE cause_id=? AND actor_id=?').get(id,'actor-hash').role,'owner');
  assert.throws(()=>db.prepare('INSERT INTO memberships(cause_id,actor_id,role,consented_at) VALUES(?,?,?,?)').run(id,'actor-2','superadmin','2026-11-09'));
 }finally{db.close();}
});

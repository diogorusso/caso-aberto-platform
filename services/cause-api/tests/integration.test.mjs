/** Full route smoke test using real SQLite SQL and ephemeral signed Access identities.
 * Not a substitute for a staging deployment, but exercises role and D1 contracts.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {generateKeyPairSync,sign} from 'node:crypto';
import worker from '../src/worker.mjs';
import {resetAccessKeyCacheForTests,opaqueActorId} from '../src/auth.mjs';

class D1Statement {
 constructor(database,sql,args=[]){this.database=database;this.sql=sql;this.args=args;}
 bind(...args){return new D1Statement(this.database,this.sql,args);}
 async first(){return this.database.prepare(this.sql).get(...this.args)??null;}
 async all(){return {results:this.database.prepare(this.sql).all(...this.args)};}
 async run(){const r=this.database.prepare(this.sql).run(...this.args);return {meta:{changes:Number(r.changes)}};}
}
class TestD1 {
 constructor(){
  this.raw=new DatabaseSync(':memory:');
  this.raw.exec(readFileSync(new URL('../migrations/0001_private_causes.sql',import.meta.url),'utf8'));
 }
 prepare(sql){return new D1Statement(this.raw,sql);}
 async batch(statements){
  this.raw.exec('BEGIN');
  try{const results=[];for(const item of statements)results.push(await item.run());this.raw.exec('COMMIT');return results;}
  catch(e){this.raw.exec('ROLLBACK');throw e;}
 }
 close(){this.raw.close();}
}
const origin='https://private.casoaberto.test';
const config={ACCESS_TEAM_DOMAIN:'causes.cloudflareaccess.com',ACCESS_AUDIENCE:'audience-for-case-api-123456',IDENTITY_PEPPER:'synthetic-test-only-pepper-1234567890',CAUSE_APP_ORIGIN:origin};
const {privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048});
const key={...publicKey.export({format:'jwk'}),kid:'test-cause-key',alg:'RS256',use:'sig'};
const encode=part=>Buffer.from(JSON.stringify(part)).toString('base64url');
const jwt=subject=>{
 const now=Math.floor(Date.now()/1000);
 const data=encode({alg:'RS256',kid:'test-cause-key'})+'.'+encode({iss:'https://'+config.ACCESS_TEAM_DOMAIN,aud:[config.ACCESS_AUDIENCE],sub:subject,iat:now,exp:now+3600});
 return data+'.'+sign('RSA-SHA256',Buffer.from(data),privateKey).toString('base64url');
};
const validOrigin=headers=>Object.assign({'Origin':origin,'Content-Type':'application/json'},headers);
async function call(env,subject,method,path,body){
 const headers=validOrigin({'Cf-Access-Jwt-Assertion':jwt(subject)});
 const request=new Request(origin+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
 const response=await worker.fetch(request,env);
 const result=await response.json();
 return {status:response.status,data:result};
}

test('isolated owner, viewer, editor, invitations, revocation and audits work together',async()=>{
 resetAccessKeyCacheForTests();
 const originalFetch=globalThis.fetch;
 globalThis.fetch=async url=>{
  assert.equal(url,'https://causes.cloudflareaccess.com/cdn-cgi/access/certs');
  return {ok:true,json:async()=>({keys:[key]})};
 };
 const db=new TestD1(),env={...config,DB:db,API_RATE_LIMIT:{limit:async()=>({success:true})}};
 const owner='verified-owner-sub',participant='verified-participant-sub';
 try{
  const initial=await call(env,owner,'GET','/api/causes');
  assert.equal(initial.status,200);assert.equal(initial.data.causes.length,0);
  const created=await call(env,owner,'POST','/api/causes',{
   title:'Conserto da água na comunidade',objective:'Pedir a publicação de um cronograma verificável de reparos',
   domain:'comunidade',jurisdiction:'Município',accept_public_safe:true
  });
  assert.equal(created.status,201);
  const id=created.data.id;assert.match(id,/^[0-9a-f-]{36}$/);
  assert.equal((await call(env,participant,'GET','/api/causes')).data.causes.length,0);
  assert.equal((await call(env,participant,'GET','/api/causes/'+id)).status,404);
  const task=await call(env,owner,'POST','/api/causes/'+id+'/tasks',{title:'Consultar o calendário do órgão',due_date:'2026-11-19'});
  assert.equal(task.status,201);
  assert.equal((await call(env,owner,'GET','/api/causes/'+id+'/tasks')).data.items.length,1);
  const viewerInvite=await call(env,owner,'POST','/api/causes/'+id+'/invites',{role:'viewer'});
  assert.equal(viewerInvite.status,201);assert.match(viewerInvite.data.token,/^[a-f0-9]{64}$/);
  const joined=await call(env,participant,'POST','/api/invites/claim',{token:viewerInvite.data.token,accept_rules:true});
  assert.equal(joined.status,200);
  assert.equal((await call(env,participant,'GET','/api/causes/'+id+'/tasks')).status,200);
  assert.equal((await call(env,participant,'POST','/api/causes/'+id+'/tasks',{title:'Não autorizado'})).status,403);
  assert.equal((await call(env,participant,'POST','/api/invites/claim',{token:viewerInvite.data.token,accept_rules:true})).status,404);
  const members=await call(env,owner,'GET','/api/causes/'+id+'/members');
  assert.equal(members.status,200);assert.equal(members.data.items.length,2);
  const pseudo=await opaqueActorId(participant,config.IDENTITY_PEPPER);
  const revoked=await call(env,owner,'DELETE','/api/causes/'+id+'/members/'+pseudo);
  assert.equal(revoked.status,200);
  assert.equal((await call(env,participant,'GET','/api/causes/'+id)).status,404);
  const editorInvite=await call(env,owner,'POST','/api/causes/'+id+'/invites',{role:'editor'});
  assert.equal(editorInvite.status,201);
  assert.equal((await call(env,participant,'POST','/api/invites/claim',{token:editorInvite.data.token,accept_rules:true})).status,200);
  const evidence=await call(env,participant,'POST','/api/causes/'+id+'/evidence',{
   title:'Documento institucional público',source_url:'https://example.org/fonte',kind:'documento',observation:'Documento publicado pelo órgão'
  });
  assert.equal(evidence.status,201);
  assert.equal((await call(env,participant,'GET','/api/causes/'+id+'/evidence')).data.items.length,1);
  assert.equal((await call(env,participant,'POST','/api/causes/'+id+'/requests',{title:'Solicitar esclarecimento',institution:'Órgão público',question:'Qual é o prazo documentado para a resposta?'})).status,201);
  assert.equal((await call(env,participant,'GET','/api/causes/'+id+'/requests')).data.items[0].status,'rascunho');
  const audit=await call(env,owner,'GET','/api/causes/'+id+'/audit');
  assert.equal(audit.status,200);assert.ok(audit.data.items.length>=5);
  assert.equal((await call(env,participant,'GET','/api/causes/'+id+'/audit')).status,403);
  assert.equal((await call(env,participant,'POST','/api/causes/'+id+'/leave',{})).status,200);
  assert.equal((await call(env,participant,'GET','/api/causes/'+id+'/tasks')).status,404);
 }finally{globalThis.fetch=originalFetch;db.close();}
});

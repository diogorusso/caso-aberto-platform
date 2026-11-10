import {test} from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.mjs';
const base='https://causes.example.org';
const env={
 DB:{},API_RATE_LIMIT:{limit:async()=>({success:true})},
 ACCESS_TEAM_DOMAIN:'research.cloudflareaccess.com',
 ACCESS_AUDIENCE:'valid-audience-1234567890',
 IDENTITY_PEPPER:'replace-this-long-secret-in-production-0123456789',
 CAUSE_APP_ORIGIN:base
};
test('only health is publicly reachable',async()=>{
 const ok=await worker.fetch(new Request(base+'/health'),{});
 assert.equal(ok.status,200);
 const privateResponse=await worker.fetch(new Request(base+'/api/causes'),env);
 assert.equal(privateResponse.status,401);
});
test('write requests reject forged origins before reading body',async()=>{
 const req=new Request(base+'/api/causes',{method:'POST',headers:{Origin:'https://bad.example.org','Content-Type':'application/json'},body:'{}'});
 assert.equal((await worker.fetch(req,env)).status,403);
});
test('missing DB, Access configuration or rate limit fail closed',async()=>{
 assert.equal((await worker.fetch(new Request(base+'/api/causes'),{...env,DB:null})).status,503);
 assert.equal((await worker.fetch(new Request(base+'/api/causes'),{...env,API_RATE_LIMIT:null})).status,503);
 assert.equal((await worker.fetch(new Request(base+'/api/causes'),{...env,IDENTITY_PEPPER:''})).status,503);
});
test('malformed signed identity never reaches the data layer',async()=>{
 const req=new Request(base+'/api/causes',{headers:{'Cf-Access-Jwt-Assertion':'forged.token.value'}});
 const response=await worker.fetch(req,env);
 assert.equal(response.status,401);
 assert.equal(response.headers.get('Cache-Control'),'no-store');
});

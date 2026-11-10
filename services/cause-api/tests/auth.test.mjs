import {test} from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {configValid,resetAccessKeyCacheForTests,verifyAccessJwt,opaqueActorId} from '../src/auth.mjs';
const env={ACCESS_TEAM_DOMAIN:'research.cloudflareaccess.com',ACCESS_AUDIENCE:'verified-aud-1234567890',IDENTITY_PEPPER:'replace-this-long-secret-in-production-0123456789'};
const {publicKey,privateKey}=generateKeyPairSync('rsa',{modulusLength:2048});
const jwk={...publicKey.export({format:'jwk'}),kid:'test-rsa',alg:'RS256',use:'sig'};
const now=Math.floor(Date.now()/1000);
const payload=()=>({iss:'https://'+env.ACCESS_TEAM_DOMAIN,aud:[env.ACCESS_AUDIENCE],sub:'person-verified-by-identity-provider',exp:now+3600,iat:now});
const b64=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
const jwt=(claims,header={alg:'RS256',kid:'test-rsa'})=>{
 const text=b64(header)+'.'+b64(claims);
 return text+'.'+sign('RSA-SHA256',Buffer.from(text),privateKey).toString('base64url');
};
const fetcher=async url=>{
 assert.equal(url,'https://research.cloudflareaccess.com/cdn-cgi/access/certs');
 return {ok:true,json:async()=>({keys:[jwk]})};
};
test('valid signature, issuer, audience, expiry and subject are verified',async()=>{
 resetAccessKeyCacheForTests();
 const id=await verifyAccessJwt(jwt(payload()),env,{fetcher,now});
 assert.equal(id.subject,payload().sub);
 const first=await opaqueActorId(id.subject,env.IDENTITY_PEPPER);
 const second=await opaqueActorId(id.subject,env.IDENTITY_PEPPER);
 assert.equal(first,second);
 assert.equal(first.length,64);
 assert.ok(!first.includes(id.subject));
});
test('unsigned and corrupted tokens are rejected',async()=>{
 resetAccessKeyCacheForTests();
 const ok=jwt(payload());
 await assert.rejects(()=>verifyAccessJwt(ok.slice(0,-2)+'00',env,{fetcher,now}));
 await assert.rejects(()=>verifyAccessJwt('abc.def.ghi',env,{fetcher,now}));
 await assert.rejects(()=>verifyAccessJwt(jwt(payload(),{alg:'none',kid:'test-rsa'}),env,{fetcher,now}));
});
test('expiry, issuer, wrong application audience and future not-before are rejected',async()=>{
 resetAccessKeyCacheForTests();
 const bad=[
 {...payload(),exp:now-1},
 {...payload(),iss:'https://attacker.cloudflareaccess.com'},
 {...payload(),aud:['other-app']},
 {...payload(),nbf:now+3600},
 {...payload(),sub:''}
 ];
 for(const item of bad)await assert.rejects(()=>verifyAccessJwt(jwt(item),env,{fetcher,now}));
});
test('fail closed when Access configuration or identity secret is missing',async()=>{
 assert.equal(configValid(env),true);
 assert.equal(configValid({...env,ACCESS_TEAM_DOMAIN:'evil.tld'}),false);
 await assert.rejects(()=>verifyAccessJwt(jwt(payload()),{...env,ACCESS_AUDIENCE:''},{fetcher,now}));
 await assert.rejects(()=>opaqueActorId('user','1234'));
});

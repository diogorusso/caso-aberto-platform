/** Verify signed Cloudflare Access JWTs independently at the Worker boundary.
 * Never trust raw headers, unsigned claim bodies, or a browser-supplied actor id.
 */
const jwksCache=new Map();
const decoder=new TextDecoder(),encoder=new TextEncoder();
const decodePart=part=>{
 if(!/^[A-Za-z0-9_-]+$/.test(part||''))throw Error('Invalid token encoding');
 const text=part.replaceAll('-','+').replaceAll('_','/');
 const binary=atob(text+'='.repeat((4-text.length%4)%4));
 return Uint8Array.from(binary,c=>c.charCodeAt(0));
};
const utf8Json=part=>JSON.parse(decoder.decode(decodePart(part)));
export function configValid(env){
 return typeof env.ACCESS_TEAM_DOMAIN==='string'&&/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(env.ACCESS_TEAM_DOMAIN)
  &&typeof env.ACCESS_AUDIENCE==='string'&&env.ACCESS_AUDIENCE.length>=16
  &&typeof env.IDENTITY_PEPPER==='string'&&env.IDENTITY_PEPPER.length>=32;
}
async function publicKey(team,kid,fetcher,now){
 const lookup=async()=>{
  const response=await fetcher('https://'+team+'/cdn-cgi/access/certs',{redirect:'error'});
  if(!response.ok)throw Error('Access key endpoint unavailable');
  const body=await response.json();
  if(!Array.isArray(body.keys)||body.keys.length>10)throw Error('Invalid Access key set');
  jwksCache.set(team,{keys:body.keys,expires:now+15*60});
  return body.keys;
 };
 const cache=jwksCache.get(team);
 let keys=cache&&cache.expires>now?cache.keys:await lookup();
 let found=keys.find(k=>k.kid===kid&&k.kty==='RSA');
 if(!found){keys=await lookup();found=keys.find(k=>k.kid===kid&&k.kty==='RSA');}
 if(!found)throw Error('Unknown signing key');
 return crypto.subtle.importKey('jwk',found,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
}
export async function verifyAccessJwt(token,env,{fetcher=fetch,now=Math.floor(Date.now()/1000)}={}){
 if(!configValid(env)||typeof token!=='string'||token.length>12000)throw Error('Invalid Access configuration or token');
 const pieces=token.split('.');
 if(pieces.length!==3)throw Error('Invalid JWT');
 const header=utf8Json(pieces[0]),claims=utf8Json(pieces[1]);
 if(header.alg!=='RS256'||typeof header.kid!=='string'||header.kid.length>200)throw Error('Unexpected Access algorithm');
 if(claims.iss!=='https://'+env.ACCESS_TEAM_DOMAIN
   ||!(Array.isArray(claims.aud)?claims.aud.includes(env.ACCESS_AUDIENCE):claims.aud===env.ACCESS_AUDIENCE)
   ||!Number.isInteger(claims.exp)||claims.exp<=now
   ||(claims.nbf!==undefined&&(!Number.isInteger(claims.nbf)||claims.nbf>now))
   ||(claims.iat!==undefined&&(!Number.isInteger(claims.iat)||claims.iat>now+60))
   ||typeof claims.sub!=='string'||claims.sub.length<3||claims.sub.length>256
 )throw Error('Invalid Access token claims');
 const key=await publicKey(env.ACCESS_TEAM_DOMAIN,header.kid,fetcher,now);
 const message=encoder.encode(pieces[0]+'.'+pieces[1]);
 if(!await crypto.subtle.verify({name:'RSASSA-PKCS1-v1_5'},key,decodePart(pieces[2]),message))throw Error('Access signature rejected');
 return {subject:claims.sub};
}
export async function opaqueActorId(subject,pepper){
 if(typeof pepper!=='string'||pepper.length<32)throw Error('Identity secret missing');
 const key=await crypto.subtle.importKey('raw',encoder.encode(pepper),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const sig=await crypto.subtle.sign('HMAC',key,encoder.encode(subject));
 return Array.from(new Uint8Array(sig),byte=>byte.toString(16).padStart(2,'0')).join('');
}
export function resetAccessKeyCacheForTests(){jwksCache.clear();}

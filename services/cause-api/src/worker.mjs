/** Separate Access-protected Cloudflare Worker; NEVER deployed as a public Astro API.
 * No public feed, no personal dossiers, no outbound messages or AI execution.
 */
import {configValid,verifyAccessJwt,opaqueActorId} from './auth.mjs';
import {ValidationError,readJsonLimited,requiredText,oneOf,requireUuid,causeInput,taskInput,evidenceInput,publicRequestInput} from './validation.mjs';

const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'"};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
const error=(status,code)=>json({error:code},status);
const now=()=>new Date().toISOString();
const uuid=()=>crypto.randomUUID();
const apiRole=async(db,causeId,actor)=>{
 const row=await db.prepare('SELECT role FROM memberships WHERE cause_id=? AND actor_id=? AND revoked_at IS NULL').bind(causeId,actor).first();
 return row?.role||null;
};
const requireRole=(role,write=false)=>{
 if(!role)return false;
 return !write||role==='owner'||role==='editor';
};
const audit=(db,causeId,actor,action,objectId,date)=>db.prepare('INSERT INTO audit_events(id,cause_id,actor_id,action,object_id,created_at) VALUES(?,?,?,?,?,?)').bind(uuid(),causeId,actor,action,objectId,date);
const limitCount=async(db,table,causeId,max)=>{
 // The caller passes only trusted compile-time table names.
 const counts=await db.prepare('SELECT count(*) as n FROM '+table+' WHERE cause_id=?').bind(causeId).first();
 if(Number(counts?.n||0)>=max)throw new ValidationError('Limite de registros por causa atingido');
};
async function secureHandler(request,env,actor){
 const url=new URL(request.url),segments=url.pathname.split('/').filter(Boolean),method=request.method;
 const db=env.DB;
 if(segments[0]!=='api')return error(404,'not_found');
 if(method==='GET'&&segments.length===2&&segments[1]==='causes'){
  const result=await db.prepare('SELECT c.id,c.title,c.objective,c.domain,c.jurisdiction,c.status,c.created_at,c.updated_at,m.role FROM causes c JOIN memberships m ON c.id=m.cause_id WHERE m.actor_id=? AND m.revoked_at IS NULL ORDER BY c.updated_at DESC LIMIT 100').bind(actor).all();
  return json({causes:result.results||[]});
 }
 if(method==='POST'&&segments.length===2&&segments[1]==='causes'){
  const input=causeInput(await readJsonLimited(request));
  const id=uuid(),date=now();
  await db.batch([
   db.prepare('INSERT INTO causes(id,owner_id,title,objective,domain,jurisdiction,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)').bind(id,actor,input.title,input.objective,input.domain,input.jurisdiction,'em-preparacao',date,date),
   db.prepare('INSERT INTO memberships(cause_id,actor_id,role,consented_at) VALUES(?,?,?,?)').bind(id,actor,'owner',date),
   audit(db,id,actor,'cause_created',id,date)
  ]);
  return json({id,role:'owner',status:'em-preparacao'},201);
 }
 if(method==='POST'&&segments.length===3&&segments[1]==='invites'&&segments[2]==='claim'){
  const body=await readJsonLimited(request);
  if(body.accept_rules!==true)throw new ValidationError('O participante deve aceitar as regras de privacidade');
  const token=requiredText(body.token,100,40);
  if(!/^[a-f0-9]{64}$/.test(token))throw new ValidationError('Convite inválido');
  const sum=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));
  const hash=Array.from(new Uint8Array(sum),b=>b.toString(16).padStart(2,'0')).join('');
  const date=now();
  // Atomic conditional UPDATE ... RETURNING consumes the random token only once.
  const invite=await db.prepare('UPDATE cause_invites SET used_at=?,used_by=? WHERE token_hash=? AND used_at IS NULL AND expires_at>? RETURNING cause_id,role').bind(date,actor,hash,date).first();
  if(!invite)return error(404,'invalid_or_expired_invite');
  await db.batch([
   db.prepare('INSERT OR IGNORE INTO memberships(cause_id,actor_id,role,consented_at) VALUES(?,?,?,?)').bind(invite.cause_id,actor,invite.role,date),
   audit(db,invite.cause_id,actor,'membership_joined',invite.cause_id,date)
  ]);
  return json({cause_id:invite.cause_id,joined:true});
 }
 if(segments[1]!=='causes'||segments.length<3)return error(404,'not_found');
 const causeId=segments[2];
 requireUuid(causeId);
 const role=await apiRole(db,causeId,actor);
 if(!requireRole(role))return error(404,'cause_not_found');
 if(method==='GET'&&segments.length===3){
  const cause=await db.prepare('SELECT id,title,objective,domain,jurisdiction,status,created_at,updated_at,version FROM causes WHERE id=?').bind(causeId).first();
  return cause?json({cause,role}):error(404,'cause_not_found');
 }
 if(method==='PATCH'&&segments.length===3){
  if(!requireRole(role,true))return error(403,'read_only_member');
  const body=await readJsonLimited(request),status=oneOf(body.status,['em-preparacao','em-acompanhamento','respondida','encerrada']),date=now();
  await db.batch([
   db.prepare('UPDATE causes SET status=?,updated_at=?,version=version+1 WHERE id=?').bind(status,date,causeId),
   audit(db,causeId,actor,'status_changed',causeId,date)
  ]);
  return json({status});
 }
 if(method==='POST'&&segments.length===4&&segments[3]==='invites'){
  if(role!=='owner')return error(403,'owner_only');
  const body=await readJsonLimited(request),inviteRole=oneOf(body.role,['viewer','editor']),date=now();
  const count=await db.prepare('SELECT count(*) AS n FROM cause_invites WHERE cause_id=? AND used_at IS NULL AND expires_at>?').bind(causeId,date).first();
  if(Number(count?.n||0)>=10)return error(409,'too_many_active_invites');
  const token=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));
  const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
  const expires=new Date(Date.now()+24*60*60*1000).toISOString();
  await db.batch([
   db.prepare('INSERT INTO cause_invites(token_hash,cause_id,role,created_by,created_at,expires_at) VALUES(?,?,?,?,?,?)').bind(hash,causeId,inviteRole,actor,date,expires),
   audit(db,causeId,actor,'invite_created',causeId,date)
  ]);
  return json({token,expires_at:expires,role:inviteRole,note:'Copie com segurança. O token aparece somente nesta resposta e expira após um uso.'},201);
 }
 const type=segments[3];
 if(method==='GET'&&segments.length===4&&['tasks','evidence','requests'].includes(type)){
  const {table,columns}=type==='tasks'?{table:'cause_tasks',columns:'id,title,due_date,done,created_at,updated_at'}
   :type==='evidence'?{table:'cause_evidence',columns:'id,title,source_url,kind,observation,limitation,created_at'}
   :{table:'cause_requests',columns:'id,title,institution,question,due_date,status,created_at,updated_at'};
  const rows=await db.prepare('SELECT '+columns+' FROM '+table+' WHERE cause_id=? ORDER BY created_at DESC LIMIT 200').bind(causeId).all();
  return json({items:rows.results||[],role});
 }
 if(method==='POST'&&segments.length===4&&['tasks','evidence','requests'].includes(type)){
  if(!requireRole(role,true))return error(403,'read_only_member');
  const body=await readJsonLimited(request),id=uuid(),date=now();
  if(type==='tasks'){
   const item=taskInput(body);await limitCount(db,'cause_tasks',causeId,200);
   await db.batch([
    db.prepare('INSERT INTO cause_tasks(id,cause_id,title,due_date,done,created_by,created_at,updated_at) VALUES(?,?,?,?,0,?,?,?)').bind(id,causeId,item.title,item.due_date,actor,date,date),
    audit(db,causeId,actor,'task_created',id,date)
   ]);
  }else if(type==='evidence'){
   const item=evidenceInput(body);await limitCount(db,'cause_evidence',causeId,200);
   await db.batch([
    db.prepare('INSERT INTO cause_evidence(id,cause_id,title,source_url,kind,observation,limitation,created_by,created_at) VALUES(?,?,?,?,?,?,?,?,?)').bind(id,causeId,item.title,item.source_url,item.kind,item.observation,item.limitation,actor,date),
    audit(db,causeId,actor,'evidence_added',id,date)
   ]);
  }else {
   const item=publicRequestInput(body);await limitCount(db,'cause_requests',causeId,100);
   await db.batch([
    db.prepare('INSERT INTO cause_requests(id,cause_id,title,institution,question,due_date,status,created_by,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)').bind(id,causeId,item.title,item.institution,item.question,item.due_date,'rascunho',actor,date,date),
    audit(db,causeId,actor,'request_draft_created',id,date)
   ]);
  }
  return json({id,status:'created_locally_in_private_service',note:'Nenhuma mensagem foi enviada a terceiros.'},201);
 }
 if(method==='PATCH'&&type==='tasks'&&segments.length===5){
  if(!requireRole(role,true))return error(403,'read_only_member');
  requireUuid(segments[4]);
  const body=await readJsonLimited(request);
  if(typeof body.done!=='boolean')throw new ValidationError('Status de tarefa inválido');
  const date=now();
  const result=await db.prepare('UPDATE cause_tasks SET done=?,updated_at=? WHERE cause_id=? AND id=?').bind(body.done?1:0,date,causeId,segments[4]).run();
  if(result.meta?.changes!==1)return error(404,'task_not_found');
  await audit(db,causeId,actor,'task_completed_changed',segments[4],date).run();
  return json({id:segments[4],done:body.done});
 }
 return error(404,'not_found');
}
export default {
 async fetch(request,env){
  const path=new URL(request.url).pathname;
  if(request.method==='GET'&&path==='/health')return json({service:'casoaberto-private-cause-api',status:'unpublished_private_service'});
  if(!path.startsWith('/api/'))return error(404,'not_found');
  if(!env?.DB||!env?.API_RATE_LIMIT||!configValid(env)||typeof env.CAUSE_APP_ORIGIN!=='string'||!env.CAUSE_APP_ORIGIN.startsWith('https://'))return error(503,'not_configured');
  if(request.method!=='GET'&&request.headers.get('Origin')!==env.CAUSE_APP_ORIGIN)return error(403,'invalid_origin');
  const token=request.headers.get('Cf-Access-Jwt-Assertion');
  if(!token)return error(401,'access_required');
  let actor;
  try{
   const identity=await verifyAccessJwt(token,env);
   actor=await opaqueActorId(identity.subject,env.IDENTITY_PEPPER);
  }catch{return error(401,'access_required');}
  try{
   const rate=await env.API_RATE_LIMIT.limit({key:actor+':'+(request.method==='GET'?'read':'write')});
   if(!rate?.success)return error(429,'rate_limited');
   return await secureHandler(request,env,actor);
  }catch(err){
   if(err instanceof ValidationError)return error(400,'invalid_input');
   return error(500,'request_failed');
  }
 }
};

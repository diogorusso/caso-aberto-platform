/** Explicit schema and size gates for private collaboration API payloads. */
export class ValidationError extends Error{}
const need=(ok,msg)=>{if(!ok)throw new ValidationError(msg);};
export const requiredText=(input,max,min=1)=>{
 need(typeof input==='string','Texto obrigatório');
 const str=input.trim();
 need(str.length>=min&&str.length<=max&&/^[^\u0000-\u0008\u000B\u000C\u000E-\u001F]*$/.test(str),'Texto excede limite ou contém caracteres inválidos');
 return str;
};
export const optionalText=(input,max)=>{
 if(input===undefined||input===null||input==='')return '';
 return requiredText(input,max);
};
export const oneOf=(input,allowed)=>{need(allowed.includes(input),'Opção desconhecida');return input;};
export const dateField=input=>{
 if(input===undefined||input===null||input==='')return null;
 need(typeof input==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(input),'Data inválida');
 const check=new Date(input+'T00:00:00Z');
 need(!Number.isNaN(check.getTime())&&check.toISOString().slice(0,10)===input,'Data inválida');
 return input;
};
export const isUuid=value=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export const requireUuid=value=>{need(isUuid(value),'Identificador inválido');return value;};
export const httpsUrl=input=>{
 const text=requiredText(input,2048);
 try{const url=new URL(text);need(url.protocol==='https:'&&!url.username&&!url.password,'Fonte deve ser HTTPS');return url.href;}
 catch{throw new ValidationError('URL de origem inválida ou não HTTPS');}
};
export async function readJsonLimited(request,bytesLimit=8192){
 need((request.headers.get('content-type')||'').toLowerCase().startsWith('application/json'),'Tipo de conteúdo não permitido');
 const length=Number(request.headers.get('content-length')||0);
 need(length<=bytesLimit,'Conteúdo acima do limite');
 if(!request.body)throw new ValidationError('Corpo ausente');
 const reader=request.body.getReader();const chunks=[];let total=0;
 try{
  while(true){
   const {done,value}=await reader.read();if(done)break;
   total+=value.byteLength;
   if(total>bytesLimit){await reader.cancel();throw new ValidationError('Conteúdo acima do limite');}
   chunks.push(value);
  }
 }finally{reader.releaseLock();}
 const body=new Uint8Array(total);let position=0;
 for(const chunk of chunks){body.set(chunk,position);position+=chunk.byteLength;}
 let parsed;
 try{parsed=JSON.parse(new TextDecoder().decode(body));}catch{throw new ValidationError('JSON inválido');}
 need(parsed&&typeof parsed==='object'&&!Array.isArray(parsed),'JSON precisa ser um objeto');
 return parsed;
}
export function causeInput(data){
 need(data.accept_public_safe===true,'Confirme que não inseriu dados sensíveis de terceiros');
 return {title:requiredText(data.title,160,5),objective:requiredText(data.objective,1600,12),
   domain:oneOf(data.domain,['consumo','comunidade','servico-publico','plataformas','outro']),
   jurisdiction:optionalText(data.jurisdiction,120)};
}
export const taskInput=data=>({title:requiredText(data.title,200,4),due_date:dateField(data.due_date)});
export const evidenceInput=data=>({
 title:requiredText(data.title,200,5),source_url:httpsUrl(data.source_url),
 kind:oneOf(data.kind,['relato','documento','resposta','decisao','analise']),
 observation:optionalText(data.observation,1000),limitation:optionalText(data.limitation,1000)});
export const publicRequestInput=data=>({
 title:requiredText(data.title,200,5),institution:requiredText(data.institution,160,3),
 question:requiredText(data.question,1600,12),due_date:dateField(data.due_date)});

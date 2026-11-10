/** CasoAberto premium-course packaging primitives.
 * AES-256-GCM authenticated encryption, with source bytes never reaching the
 * public Astro tree. The package is an offline artifact, not an access service.
 */
import {createCipheriv,createDecipheriv,createHash,randomBytes} from 'node:crypto';
export const COURSE_FORMAT='casoaberto-course-encrypted-v1';
export const COURSE_MAX_BYTES=64*1024*1024;
export const COURSE_MAX_FILES=300;
const slug=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const allowed=/\.(?:md|txt|json|csv|pdf|png|jpe?g|webp|svg|html|css|js|jsx|ts|tsx|py|ipynb)$/i;
export const sha256 = value => createHash('sha256').update(value).digest('hex');
export function parseCourseKey(encoded) {
 if(typeof encoded!=='string'||!/^[A-Za-z0-9+/]{43}=$/.test(encoded))throw Error('Key must be canonical base64 for exactly 32 bytes.');
 const key=Buffer.from(encoded,'base64');
 if(key.length!==32||key.toString('base64')!==encoded)throw Error('Invalid AES-256 key.');
 return key;
}
export function checkPath(name) {
 if(typeof name!=='string'||name.length<1||name.length>180)throw Error('Invalid course entry name.');
 const parts=name.split('/');
 if(parts.some(p=>!p||p==='.'||p==='..'||p.startsWith('.')||!/^[-a-zA-Z0-9_ ]+(?:\.[-a-zA-Z0-9_]+)*$/.test(p)))throw Error('Hidden or unsafe course path.');
 if(!allowed.test(name))throw Error('Unsupported course material extension.');
 return name;
}
function verifyBundleInput({product,release,files,key}){
 if(!slug.test(product||'')||!slug.test(release||'')||product.length>80||release.length>60)throw Error('Invalid product/release identifier.');
 if(!Buffer.isBuffer(key)||key.length!==32)throw Error('A 256-bit key is required.');
 if(!Array.isArray(files)||files.length<1||files.length>COURSE_MAX_FILES)throw Error('Invalid number of source files.');
 let total=0;
 const seen=new Set();
 for(const entry of files){
  const name=checkPath(entry.name);
  if(seen.has(name))throw Error('Duplicate course entry.');
  seen.add(name);
  if(!Buffer.isBuffer(entry.bytes)||entry.bytes.length<1)throw Error('Empty or invalid content.');
  total+=entry.bytes.length;
  if(total>COURSE_MAX_BYTES)throw Error('Input exceeds maximum release size.');
 }
}
export function sealPrivateCourse({product,release,files,key}){
 verifyBundleInput({product,release,files,key});
 const payload={
  schema:1,
  items:files.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(x=>({
   name:x.name,sha256:sha256(x.bytes),content_base64:x.bytes.toString('base64')
  }))
 };
 const clear=Buffer.from(JSON.stringify(payload),'utf8');
 const iv=randomBytes(12);
 const aad=Buffer.from('casoaberto|course|v1|'+product+'|'+release);
 const cipher=createCipheriv('aes-256-gcm',key,iv);cipher.setAAD(aad);
 const encrypted=Buffer.concat([cipher.update(clear),cipher.final()]);
 return {format:COURSE_FORMAT,product,release,iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),ciphertext:encrypted.toString('base64')};
}
export function openPrivateCourse(envelope,key){
 if(!envelope||envelope.format!==COURSE_FORMAT||!slug.test(envelope.product||'')||!slug.test(envelope.release||''))throw Error('Invalid release envelope.');
 if(!Buffer.isBuffer(key)||key.length!==32)throw Error('A 256-bit key is required.');
 const iv=Buffer.from(envelope.iv,'base64'),tag=Buffer.from(envelope.tag,'base64'),ciphertext=Buffer.from(envelope.ciphertext,'base64');
 if(iv.length!==12||tag.length!==16||ciphertext.length>COURSE_MAX_BYTES*2)throw Error('Invalid sealed payload size.');
 const decipher=createDecipheriv('aes-256-gcm',key,iv);
 decipher.setAAD(Buffer.from('casoaberto|course|v1|'+envelope.product+'|'+envelope.release));
 decipher.setAuthTag(tag);
 const plain=Buffer.concat([decipher.update(ciphertext),decipher.final()]);
 const bundle=JSON.parse(plain.toString('utf8'));
 if(bundle.schema!==1||!Array.isArray(bundle.items)||bundle.items.length<1||bundle.items.length>COURSE_MAX_FILES)throw Error('Invalid recovered course package.');
 const recovered=[],seen=new Set();
 let total=0;
 for(const row of bundle.items){
  checkPath(row.name);
  if(seen.has(row.name))throw Error('Duplicate course entry.');
  seen.add(row.name);
  const bytes=Buffer.from(row.content_base64,'base64');
  if(sha256(bytes)!==row.sha256||bytes.length<1)throw Error('Failed entry-integrity verification.');
  total+=bytes.length;
  if(total>COURSE_MAX_BYTES)throw Error('Recovered content exceeds release limits.');
  recovered.push({name:row.name,bytes});
 }
 return {product:envelope.product,release:envelope.release,files:recovered};
}

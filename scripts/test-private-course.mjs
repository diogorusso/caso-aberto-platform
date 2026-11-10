import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {
  COURSE_FORMAT,COURSE_MAX_FILES,checkPath,parseCourseKey,
  sealPrivateCourse,openPrivateCourse,sha256
} from './private-course-core.mjs';
const key=randomBytes(32);
const info={product:'pegadas-digitais',release:'v1',key};
const source=[
 {name:'aulas/unidade-01.md',bytes:Buffer.from('# Conteúdo premium original\nO que o aluno aprende?')},
 {name:'recursos/dados.json',bytes:Buffer.from('{"exemplo":true}')}
];
test('AES-256-GCM roundtrip is lossless and authenticates release metadata',()=>{
 const sealed=sealPrivateCourse({...info,files:source});
 assert.equal(sealed.format,COURSE_FORMAT);
 assert.equal(sealed.product,info.product);
 assert.equal(sealed.release,'v1');
 assert.equal(sealed.iv.length,16);
 assert.ok(!JSON.stringify(sealed).includes('Conteúdo premium'));
 assert.ok(!JSON.stringify(sealed).includes('aulas/unidade'));
 const result=openPrivateCourse(sealed,key);
 assert.equal(result.files.length,2);
 assert.deepEqual(result.files.map(f=>f.name),source.map(f=>f.name));
 assert.deepEqual(result.files.map(f=>f.bytes.toString('utf8')),source.map(f=>f.bytes.toString('utf8')));
 assert.equal(sha256(source[0].bytes).length,64);
});
test('two independent releases use different nonces and ciphertexts',()=>{
 const a=sealPrivateCourse({...info,files:source});
 const b=sealPrivateCourse({...info,files:source});
 assert.notEqual(a.iv,b.iv);
 assert.notEqual(a.ciphertext,b.ciphertext);
});
test('wrong key, tampered metadata and modified ciphertext are rejected',()=>{
 const original=sealPrivateCourse({...info,files:source});
 assert.throws(()=>openPrivateCourse(original,randomBytes(32)));
 assert.throws(()=>openPrivateCourse({...original,product:'algoritmos-e-poder'},key));
 assert.throws(()=>openPrivateCourse({...original,release:'v2'},key));
 const changed=Buffer.from(original.ciphertext,'base64');changed[0]^=1;
 assert.throws(()=>openPrivateCourse({...original,ciphertext:changed.toString('base64')},key));
 assert.throws(()=>openPrivateCourse({...original,tag:randomBytes(16).toString('base64')},key));
});
test('source paths and encryption keys require strict validation',()=>{
 for(const path of ['../privado.md','/etc/passwd','a/../../b.md','.env','dir/.secret.md','dir//a.md','dir/script.sh'])assert.throws(()=>checkPath(path));
 for(const path of ['unidade.md','aulas/ficha-1.pdf','assets/imagem.png','code/example.ts'])assert.equal(checkPath(path),path);
 assert.equal(parseCourseKey(key.toString('base64')).length,32);
 for(const bad of [undefined,'',key.toString('hex'),Buffer.alloc(12).toString('base64'),'a'.repeat(44)])assert.throws(()=>parseCourseKey(bad));
});
test('empty, duplicate, oversize and invalid course inputs do not package',()=>{
 assert.throws(()=>sealPrivateCourse({...info,files:[]}));
 assert.throws(()=>sealPrivateCourse({...info,files:[source[0],source[0]]}));
 assert.throws(()=>sealPrivateCourse({...info,files:[{name:'aulas/secret.md',bytes:Buffer.alloc(0)}]}));
 assert.throws(()=>sealPrivateCourse({...info,product:'../escape'}));
 assert.throws(()=>sealPrivateCourse({...info,key:Buffer.alloc(12)}));
 const many=Array.from({length:COURSE_MAX_FILES+1},(_,i)=>({name:'item-'+i+'.md',bytes:Buffer.from('a')}));
 assert.throws(()=>sealPrivateCourse({...info,files:many}));
});

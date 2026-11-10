import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ValidationError,readJsonLimited,causeInput,taskInput,evidenceInput,dateField,requireUuid,httpsUrl} from '../src/validation.mjs';
test('cause and evidence require bounded public-safe fields and HTTPS sources',()=>{
 assert.throws(()=>causeInput({title:'Problema local',objective:'Quero uma resposta concreta sobre o serviço',domain:'comunidade'}),ValidationError);
 const ok=causeInput({title:'Problema local',objective:'Quero uma resposta concreta sobre o serviço',domain:'comunidade',accept_public_safe:true});
 assert.equal(ok.domain,'comunidade');
 assert.equal(taskInput({title:'Verificar protocolo',due_date:'2026-11-13'}).due_date,'2026-11-13');
 assert.throws(()=>dateField('2026-02-31'),ValidationError);
 assert.throws(()=>httpsUrl('javascript:alert(1)'),ValidationError);
 assert.throws(()=>httpsUrl('http://notsecure.test'),ValidationError);
 assert.equal(evidenceInput({title:'Documento verificado',source_url:'https://example.org/documento',kind:'documento'}).kind,'documento');
 assert.throws(()=>requireUuid('../../private'),ValidationError);
});
test('request parser rejects non-JSON and oversized or non-object bodies',async()=>{
 const request=(text,contentType='application/json')=>new Request('https://local.test/api',{method:'POST',headers:{'content-type':contentType},body:text});
 assert.deepEqual(await readJsonLimited(request('{"hello":"world"}')),{hello:'world'});
 await assert.rejects(()=>readJsonLimited(request('[]')),ValidationError);
 await assert.rejects(()=>readJsonLimited(request('invalid')),ValidationError);
 await assert.rejects(()=>readJsonLimited(request('{}','text/plain')),ValidationError);
 await assert.rejects(()=>readJsonLimited(request(JSON.stringify({data:'x'.repeat(1200)})),200),ValidationError);
});

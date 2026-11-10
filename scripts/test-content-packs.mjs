import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createContentPacks,createContentPack} from './content-pack-core.mjs';
const read = file => JSON.parse(readFileSync(new URL('../src/data/'+file+'.json',import.meta.url),'utf8'));
const queue=read('content-distribution-queue');
const catalog=read('learning-publications');
const products=read('education-products');
test('each draft generates 4 editorial variants without publication',()=>{
 const packs=createContentPacks(queue,catalog,products);
 assert.equal(packs.length,queue.topics.length);
 for(const pack of packs){
  assert.equal(pack.status,'rascunho_editorial_sem_publicacao');
  assert.deepEqual(Object.keys(pack.variants).sort(),['faq','newsletter','short_video','social_card']);
  assert.ok(pack.sources.length>=2);
  assert.ok(pack.source_article.startsWith('/autonomia-digital/guias/'));
  assert.ok(pack.product.url.startsWith('/academia/'));
  assert.ok(!JSON.stringify(pack).includes('checkout_url'));
  assert.equal(pack.product.status,'em-producao');
  assert.ok(!JSON.stringify(pack).includes('wiki/playbooks'));
 }
});
test('single slug filter does not generate unrelated packs',()=>{
 const pack=createContentPacks(queue,catalog,products,queue.topics[0].slug);
 assert.equal(pack.length,1);
 assert.equal(pack[0].id,'CA-CONTENT-'+queue.topics[0].slug);
 assert.throws(()=>createContentPacks(queue,catalog,products,'not-exists'));
});
test('unapproved queue and broken mappings cannot produce packs',()=>{
 const t=queue.topics[0],article=catalog.articles.find(a=>a.slug===t.article_slug);
 const product=products.tiers.find(p=>p.slug===t.product_slug);
 assert.throws(()=>createContentPack({...t,status:'publicado'},article,product));
 assert.throws(()=>createContentPack({...t,product_slug:'unknown'},article,product));
 assert.throws(()=>createContentPack(t,{...article,format:'playbook_inteiro'},product));
 assert.throws(()=>createContentPack(t,article,{...product,checkout_url:'https://example.org'}));
});

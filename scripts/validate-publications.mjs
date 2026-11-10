import {readFileSync, existsSync} from 'node:fs';
const read = name => JSON.parse(readFileSync(new URL('../src/data/'+name+'.json',import.meta.url),'utf8'));
const catalog=read('learning-publications');
const products=read('education-products');
const queue=read('content-distribution-queue');
let errors=0;
const fail = message=>{console.error('[publications]',message);errors++};
const slug=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const date=/^\d{4}-\d{2}-\d{2}$/;
const ids=new Set(),productIDs=new Set();
if(catalog.delivery_model!=='public_snippets_with_premium_curriculum'||catalog.source_vault_private!==true)fail('The public/premium separation was removed.');
if(!Array.isArray(catalog.articles)||!catalog.articles.length)fail('No public snippets.');
if(products.full_playbook_location!=='private_repository_only')fail('The full curriculum must remain private.');
for(const p of products.tiers||[]){
 if(!slug.test(p.slug)||productIDs.has(p.slug))fail('Duplicate/invalid product slug '+p.slug); productIDs.add(p.slug);
 if(p.status!=='em-producao'||p.checkout_url!==null||p.product_price!==null)fail('Unverified sale, availability, pricing or enrollment: '+p.slug);
 if(!Array.isArray(p.premium_deliverables)||p.premium_deliverables.length<3)fail('Missing distinct educational deliverables: '+p.slug);
}
for(const item of catalog.articles||[]){
 if(!slug.test(item.slug)||ids.has(item.slug))fail('Duplicate/invalid snippet '+item.slug); ids.add(item.slug);
 if(!date.test(item.updated_at||'')||!date.test(item.published_at||'')||item.updated_at<item.published_at)fail('Invalid review date '+item.slug);
 if((item.title||'').length<25||(item.summary||'').length<80)fail('Insufficient snippet title/summary '+item.slug);
 if(item.format!=='insight_publico'||!productIDs.has(item.product_slug))fail('Missing snippet-to-product mapping '+item.slug);
 if(!Array.isArray(item.chapters)||!item.chapters.length||item.chapters.some(x=>!/^\d{2}$/.test(x)))fail('Invalid private source ID '+item.slug);
 if(!Array.isArray(item.sections)||item.sections.length!==2||item.sections.some(x=>x.heading?.length<10||x.paragraphs?.length!==1||x.paragraphs[0].length<110))fail('Public snippet section boundaries '+item.slug);
 if(!item.lab?.title||item.lab.steps?.length!==1)fail('Full lab might have leaked to public '+item.slug);
 if(!Array.isArray(item.questions)||item.questions.length!==2)fail('Free FAQ boundaries '+item.slug);
 if(!Array.isArray(item.sources)||item.sources.length<2||new Set(item.sources.map(s=>s.url)).size<2||item.sources.some(s=>{try{return new URL(s.url).protocol!=='https:'}catch{return true}}))fail('Insufficient primary sources '+item.slug);
 const publicText=[item.summary,...item.sections.flatMap(s=>s.paragraphs),...item.lab.steps,...item.questions.flatMap(q=>[q.q,q.a])].join(' ');
 if(publicText.length>2200)fail('Public snippet too extensive: '+item.slug);
}
for(const p of products.tiers||[])for(const slug of p.sample_slugs||[])if(!ids.has(slug)||!catalog.articles.some(a=>a.slug===slug&&a.product_slug===p.slug))fail('Invalid product preview '+p.slug+'/'+slug);
if(!Array.isArray(queue.topics)||queue.topics.length<8)fail('Distribution queue is empty.');
for(const t of queue.topics||[])if(!productIDs.has(t.product_slug)||!ids.has(t.article_slug)||t.publication_url!==null)fail('Invalid draft distribution record '+t.slug);
for(const path of [
 '../src/pages/academia/index.astro',
 '../src/pages/academia/[slug]/index.astro',
 '../src/pages/autonomia-digital/guias/index.astro',
 '../src/pages/autonomia-digital/guias/[slug]/index.astro',
 '../src/pages/autonomia-digital/ferramentas/[slug]/index.astro',
 '../src/pages/instituto/dados/index.astro',
 '../src/pages/instituto/dados/plataformas.csv.ts',
 '../src/pages/instituto/dados/plataformas.json.ts'
]) if(!existsSync(new URL(path,import.meta.url)))fail('Missing route '+path);
if(errors)process.exit(1);
console.log('Verified '+ids.size+' limited public snippets, '+productIDs.size+' protected educational products, '+queue.topics.length+' draft content adaptations.');

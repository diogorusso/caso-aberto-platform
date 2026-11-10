import {readFileSync,existsSync} from 'node:fs';
const read=path=>JSON.parse(readFileSync(new URL('../src/data/'+path+'.json',import.meta.url),'utf8'));
const packs=read('education-content-packs');
const queue=read('content-distribution-queue').topics;
const articles=read('learning-publications').articles;
const products=read('education-products').tiers;
let errors=0;const fail=(message)=>{errors++;console.error('[curated content]',message)};
if(packs.visibility!=='internal-draft-marketing-assets'||packs.source_kind!=='public-snippet-derivative')fail('Curated packs must be derived only from public snippets.');
if(packs.packs?.length!==queue.length)fail('One curated pack expected per editorial topic.');
const seen=new Set();
for(const p of packs.packs||[]){
 if(seen.has(p.slug))fail('Duplicate pack: '+p.slug);seen.add(p.slug);
 const topic=queue.find(x=>x.slug===p.slug);
 const article=articles.find(x=>x.slug===p.article_slug);
 const product=products.find(x=>x.slug===p.product_slug);
 if(!topic||!article||!product||topic.article_slug!==p.article_slug||topic.product_slug!==p.product_slug||article.product_slug!==product.slug)fail('Invalid content provenance: '+p.slug);
 if(p.review_status!=='draft-human-review')fail('Unapproved distribution status: '+p.slug);
 if(p.publication_url!==null)fail('A draft cannot claim a published URL: '+p.slug);
 if(!Array.isArray(p.carousel)||p.carousel.length!==4||p.carousel.some(x=>typeof x!=='string'||x.length<18||x.length>180))fail('Four reviewed carousel panels expected: '+p.slug);
 if(typeof p.caption!=='string'||p.caption.length<160||p.caption.length>1100)fail('Caption bounds: '+p.slug);
 if(typeof p.short_video_script!=='string'||p.short_video_script.length<160||p.short_video_script.length>1100)fail('Video draft bounds: '+p.slug);
 if(typeof p.newsletter_excerpt!=='string'||p.newsletter_excerpt.length<120||p.newsletter_excerpt.length>800)fail('Newsletter bounds: '+p.slug);
 if(!article?.sources.some(s=>s.url===p.source_url))fail('Source not linked to public article: '+p.slug);
 if(p.read_more_url!=='/autonomia-digital/guias/'+p.article_slug+'/'||p.product_preview_url!=='/academia/'+p.product_slug+'/')fail('Invalid content/product links: '+p.slug);
 const path=new URL('../campaign/education/'+p.slug+'.md',import.meta.url);
 if(!existsSync(path))fail('Missing reviewable .md file: '+p.slug);
 else {
  const text=readFileSync(path,'utf8');
  if(!text.includes(p.caption)||!text.includes(p.short_video_script)||!text.includes(p.source_url)||!text.includes('**Não publicar automaticamente:**'))fail('Markdown is out of sync: '+p.slug);
 }
}
if(errors)process.exit(1);
console.log('Validated '+seen.size+' curated multi-channel content drafts, distinct source mappings and no automatic publication.');

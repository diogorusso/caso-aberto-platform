import {readFileSync} from 'node:fs';
const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
const coverage=read('../docs/education-coverage.json');
const articles=read('../src/data/learning-publications.json').articles;
const products=read('../src/data/education-products.json').tiers;
let bad=0;const fail=t=>{console.error('[coverage]',t);bad++};
if(coverage.source_vault!=='private_repo_only'||coverage.source_chapters_total!==56||coverage.chapters?.length!==56)fail('56 private source invariant');
const ids=new Set(),validProducts=new Set(products.map(p=>p.slug));
for(let index=0;index<56;index++){
 const item=coverage.chapters[index],id=String(index+1).padStart(2,'0');
 if(item?.id!==id||ids.has(id))fail('Missing/duplicate ID '+id);
 ids.add(id);
 if(!item?.private_source||!validProducts.has(item.primary_product))fail('Missing private/product boundary '+id);
 if(!['original_insight_published','not_yet_published'].includes(item.public_status))fail('Unknown state '+id);
 if(item.public_status==='original_insight_published'!==Boolean(item.snippet_urls?.length))fail('Coverage mismatch '+id);
 for(const path of item.snippet_urls||[])if(!articles.some(a=>a.chapters.includes(id)&&path==='/autonomia-digital/guias/'+a.slug+'/'))fail('Broken public link '+id);
}
for(const article of articles)for(const id of article.chapters)if(!ids.has(id)||!coverage.chapters.find(c=>c.id===id)?.snippet_urls.includes('/autonomia-digital/guias/'+article.slug+'/'))fail('Missing guide mapping '+article.slug+'/'+id);
const text=JSON.stringify(coverage);
for(const restricted of ['full_chapter_text','premium_lessons','private_source_url','answer_key','complete_protocol'])if(text.includes(restricted))fail('Private material included: '+restricted);
if(bad)process.exit(1);
console.log('Verified 56 private research sources; '+coverage.chapters.filter(x=>x.snippet_urls.length>0).length+' mapped to approved short public insights.');

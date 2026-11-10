import {readFileSync, existsSync} from 'node:fs';
const read = name => JSON.parse(readFileSync(new URL('../src/data/'+name+'.json',import.meta.url),'utf8'));
const catalog=read('learning-publications');
let errors=0;
const fail = message=>{console.error('[publications]',message);errors++};
const slug=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const date=/^\d{4}-\d{2}-\d{2}$/;
const ids=new Set();
if(!Array.isArray(catalog.articles)||catalog.articles.length===0)fail('Missing public guides');
for (const item of catalog.articles||[]){
 if(!slug.test(item.slug)||ids.has(item.slug))fail('Slug duplicated/invalid: '+item.slug);ids.add(item.slug);
 if(!date.test(item.updated_at||'')||!date.test(item.published_at||'')||item.updated_at<item.published_at)fail('Invalid editorial dates: '+item.slug);
 if((item.title||'').length<25||(item.summary||'').length<80)fail('Title or summary too short: '+item.slug);
 if(!Array.isArray(item.chapters)||!item.chapters.length||item.chapters.some(x=>!/^\d{2}$/.test(x)))fail('Invalid wiki chapter mapping: '+item.slug);
 if(!Array.isArray(item.sections)||item.sections.length<4||item.sections.some(x=>x.heading?.length<10||x.paragraphs?.length<2||x.paragraphs.some(p=>p.length<110)))fail('Insufficient original article sections: '+item.slug);
 if(!item.lab?.title||item.lab.steps?.length<4)fail('Missing distinct lab: '+item.slug);
 if(!Array.isArray(item.questions)||item.questions.length<2)fail('Missing FAQ: '+item.slug);
 if(!Array.isArray(item.sources)||item.sources.length<2||new Set(item.sources.map(s=>s.url)).size<2||item.sources.some(s=>{try{return new URL(s.url).protocol!=='https:'}catch{return true}}))fail('Insufficient source URLs: '+item.slug);
}
for(const path of [
 '../src/pages/autonomia-digital/guias/index.astro',
 '../src/pages/autonomia-digital/guias/[slug]/index.astro',
 '../src/pages/autonomia-digital/ferramentas/[slug]/index.astro',
 '../src/pages/instituto/dados/index.astro',
 '../src/pages/instituto/dados/plataformas.csv.ts',
 '../src/pages/instituto/dados/plataformas.json.ts'
]) if(!existsSync(new URL(path,import.meta.url)))fail('Route missing: '+path);
if(errors)process.exit(1);
console.log('Verified '+ids.size+' sourced articles, worksheets and open-data routes.');

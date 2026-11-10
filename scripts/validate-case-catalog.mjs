/** Structural gate for the single public case library and its categories. */
import {existsSync,readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(new URL('../src/data/'+p+'.json',import.meta.url),'utf8'));
const source=read('casos'),atlas=read('public-case-atlas'),politics=read('political-observatory'),config=read('case-categories');
const fail=x=>{console.error('[case-catalog] '+x);process.exitCode=1};
if(config.featured_case_id!=='CA-001')fail('Florense must remain the featured case.');
if(!source.some(c=>c.id===config.featured_case_id&&c.slug==='florense-ipanema-rj-atraso-moveis-planejados'))fail('Featured case is not a valid owned dossier.');
const items=[...source,...atlas.cases,...politics.cases],ids=new Set(items.map(i=>i.id));
if(ids.size!==items.length)fail('Duplicate case identifiers.');
const listed=new Map(),slugs=new Set();
for(const group of config.categories||[]){
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(group.slug)||slugs.has(group.slug))fail('Invalid or repeated category slug: '+group.slug);
 slugs.add(group.slug);
 if(group.title?.length<7||group.description?.length<80||!group.eyebrow||group.search_terms?.length<4)fail('Incomplete category copy: '+group.slug);
 for(const id of group.case_ids||[]){
  if(!ids.has(id))fail('Category points to missing case: '+id);
  if(listed.has(id))fail('Case duplicated across categories: '+id);
  listed.set(id,group.slug);
 }
}
for(const id of ids)if(!listed.has(id))fail('Case without category: '+id);
if(listed.size!==ids.size)fail('Missing category membership.');
if(!atlas.stories.every(person=>person.case_slugs.some(slug=>atlas.cases.some(c=>c.slug===slug))))fail('Unlinked personal research records.');
const needed=[
'src/lib/case-catalog.ts','src/components/islands/CaseResearchExplorer.tsx',
'src/pages/casos/index.astro','src/pages/casos/categoria/[slug]/index.astro',
'src/pages/casos/arquivo-publico/index.astro',
'src/pages/index.astro'];
for(const path of needed)if(!existsSync(new URL('../'+path,import.meta.url)))fail('Missing library UI '+path);
for(const name of ['src/pages/casos/categoria/[slug]/index.astro'])if(existsSync(new URL('../'+name,import.meta.url))&&!readFileSync(new URL('../'+name,import.meta.url),'utf8').includes('getStaticPaths'))fail('Case category is not statically generated.');
if(!process.exitCode)console.log('Unified case library validated: '+ids.size+' cases ('+source.length+' flagship, '+atlas.cases.length+' consumer studies, '+politics.cases.length+' civic investigations), '+atlas.stories.length+' personal stories, '+slugs.size+' categories.');
if(process.exitCode)process.exit(1);

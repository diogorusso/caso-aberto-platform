/** Validate source-led static third-party cases, personal stories and guides.
 * These pages are not original case investigations or client testimonials.
 */
import {readFileSync,existsSync} from 'node:fs';
const read=file=>JSON.parse(readFileSync(new URL('../src/data/'+file+'.json',import.meta.url),'utf8'));
const atlas=read('public-case-atlas'),guideData=read('public-case-guides');
const owned=read('casos');
const issues=[];const fail=msg=>issues.push(msg);
const slug=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const date=/^\d{4}-\d{2}-\d{2}$/;
const checkDate=(value,what)=>{if(typeof value!=='string'||!date.test(value)||Number.isNaN(Date.parse(value+'T00:00:00Z'))||new Date(value+'T00:00:00Z').toISOString().slice(0,10)!==value||value>'2026-11-10')fail('Invalid or future '+what+': '+value)};
const validLink=value=>{try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!/^(localhost|127\.)/.test(u.hostname);}catch{return false;}};
const validateSources=(sources,context)=>{
 if(!Array.isArray(sources)||sources.length<2||new Set(sources.map(s=>s.url)).size<2)fail(context+': two independent source references required');
 for(const s of sources||[]){
  if(!validLink(s.url))fail(context+': invalid source URL '+s.url);
  if(!s.name||s.name.length<12)fail(context+': source name missing');
  if(s.published_at)checkDate(s.published_at,context+' source date');
 }
};
if(atlas.version!==1||guideData.version!==1)fail('Unexpected atlas version');
checkDate(atlas.updated_at,'atlas review');
checkDate(guideData.reviewed_at,'guides review');
if(atlas.cases.length<4||atlas.stories.length<6||guideData.guides.length<3)fail('Missing expected case atlas coverage.');
const slugs={case:new Set(),story:new Set(),guide:new Set()};
const ids=new Set(owned.map(x=>x.slug));
for(const study of atlas.cases){
 const ctx='case '+study.slug;
 if(!slug.test(study.slug)||slugs.case.has(study.slug)||ids.has(study.slug))fail(ctx+': duplicate, invalid or conflicts with owned case');
 slugs.case.add(study.slug);
 checkDate(study.reviewed_at,ctx+' review');checkDate(study.first_record,ctx+' first record');
 if(study.first_record>study.reviewed_at)fail(ctx+': first record later than review');
 if(study.record_type!=='fontes-oficiais-e-reportagem')fail(ctx+': unverified case type');
 for(const key of ['company','sector','headline','deck','status_label','lead','limits','other_side','other_side_url','guide_slug'])if(!study[key])fail(ctx+': missing '+key);
 if(!validLink(study.other_side_url)||!validLink(study.key_fact?.source_url))fail(ctx+': unverifiable position or number source');
 if(!study.key_fact?.metric||!study.key_fact?.period||!study.key_fact?.label)fail(ctx+': numerical scope not specified');
 if(!Array.isArray(study.verified)||study.verified.length<3||!Array.isArray(study.timeline)||study.timeline.length<3||!Array.isArray(study.questions)||study.questions.length<3||!Array.isArray(study.steps)||study.steps.length<3)fail(ctx+': missing independent fact, event, question or practical step');
 for(const entry of study.timeline||[]){checkDate(entry.date,ctx+' event');if(!validLink(entry.source_url)||!entry.description||!entry.label)fail(ctx+': invalid timeline reference');}
 validateSources(study.sources,ctx);
 const allowed=new Set(study.sources.map(s=>s.url));
 for(const link of [study.other_side_url,study.key_fact?.source_url,...(study.timeline||[]).map(x=>x.source_url)])if(!allowed.has(link))fail(ctx+': facts or positions must resolve to case source list: '+link);
}
for(const person of atlas.stories){
 const ctx='story '+person.slug;
 if(!slug.test(person.slug)||slugs.story.has(person.slug))fail(ctx+': duplicate or invalid');
 slugs.story.add(person.slug);
 checkDate(person.source_published_at,ctx+' media date');checkDate(person.reviewed_at,ctx+' review');
 if(person.source_published_at>person.reviewed_at)fail(ctx+': report is newer than editorial review');
 if(!person.primary_source_name||!validLink(person.primary_source_url)||!person.limits||person.limits.length<100)fail(ctx+': incomplete attribution/limits');
 if(!Array.isArray(person.case_slugs)||!person.case_slugs.length||!Array.isArray(person.narrative)||person.narrative.length<3||!Array.isArray(person.what_to_learn)||person.what_to_learn.length<3)fail(ctx+': insufficient original source-led story');
 if(!person.source_outcome||person.source_outcome.length<80)fail(ctx+': historical outcome uncertainty missing');
 if(!person.sources?.some(s=>s.url===person.primary_source_url))fail(ctx+': the attributed primary report must be linked');
 validateSources(person.sources,ctx);
 for(const caseSlug of person.case_slugs)if(!slugs.case.has(caseSlug))fail(ctx+': case link unresolved '+caseSlug);
 const serialized=JSON.stringify(person);
 if(/(?:\b\d{3}\.\d{3}\.\d{3}-\d{2}\b)|(?:\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b)|(?:\b(?:rua|avenida|travessa)\s+[\wÀ-ÿ]+\s+\d+)/i.test(serialized))fail(ctx+': possible personal identifier in public biography');
}
for(const study of atlas.cases)for(const storySlug of study.story_slugs||[]){
 const person=atlas.stories.find(x=>x.slug===storySlug);
 if(!person||!person.case_slugs.includes(study.slug))fail(study.slug+': invalid reverse story link '+storySlug);
}
for(const guide of guideData.guides){
 const ctx='guide '+guide.slug;
 if(!slug.test(guide.slug)||slugs.guide.has(guide.slug))fail(ctx+': duplicate or invalid');
 slugs.guide.add(guide.slug);
 checkDate(guide.updated_at,ctx+' revision');
 if(!guide.title||guide.title.length<40||!guide.description||guide.description.length<70||!guide.intro||guide.intro.length<150)fail(ctx+': weak distinct SEO treatment');
 if(guide.sections?.length!==3||guide.sections.some(s=>!s.heading||s.paragraphs?.length!==2)||guide.checklist?.length<5||guide.request_example?.length<160||guide.limits?.length<130)fail(ctx+': guide insufficiently complete');
 validateSources(guide.sources,ctx);
 if(!Array.isArray(guide.related_case_slugs)||!guide.related_case_slugs.length||guide.related_case_slugs.some(x=>!slugs.case.has(x)))fail(ctx+': broken case link');
}
for(const study of atlas.cases)if(!slugs.guide.has(study.guide_slug))fail('Case guide route missing: '+study.slug);
const required=[
 'src/pages/casos/arquivo-publico/index.astro','src/pages/casos/arquivo-publico/[slug]/index.astro',
 'src/pages/historias/index.astro','src/pages/historias/[slug]/index.astro',
 'src/pages/guias/casos-de-consumo/index.astro','src/pages/guias/casos-de-consumo/[slug]/index.astro',
 'src/pages/sobre/index.astro','src/pages/sobre/criterios-de-publicacao/index.astro',
 'src/components/PublicCaseCard.astro'
];
for(const path of required)if(!existsSync(new URL('../'+path,import.meta.url)))fail('Missing public Astro route '+path);
for(const path of required.filter(x=>x.includes('[slug]')))if(!readFileSync(new URL('../'+path,import.meta.url),'utf8').includes('getStaticPaths'))fail('Unbuilt static route '+path);
if(issues.length){for(const e of issues)console.error('[atlas]',e);process.exit(1);}
console.log('Verified '+slugs.case.size+' sourced external case studies, '+slugs.story.size+' attributed personal reports, '+slugs.guide.size+' practical consumer guides and all cross-links.');

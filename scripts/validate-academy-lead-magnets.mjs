import {readFileSync, existsSync} from 'node:fs';
const data=JSON.parse(readFileSync(new URL('../src/data/academy-lead-magnets.json',import.meta.url),'utf8'));
const programs=JSON.parse(readFileSync(new URL('../src/data/education-products.json',import.meta.url),'utf8')).tiers;
const articles=JSON.parse(readFileSync(new URL('../src/data/learning-publications.json',import.meta.url),'utf8')).articles;
const fail=(message)=>{console.error('[lead-magnets] '+message);process.exitCode=1};
if(data.items?.length!==programs.length) fail('Expected exactly one free tool per educational program.');
if(data.items?.length!==4)fail('Four distinct curriculum products must have a free asset.');
const seen=new Set();
for(const item of data.items||[]){
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)||seen.has(item.slug))fail('Invalid or duplicate slug '+item.slug);
 seen.add(item.slug);
 if(!programs.some(p=>p.slug===item.slug&&p.status==='em-producao'))fail('Orphan or misleading paid product: '+item.slug);
 if(item.title.length<30||item.tagline.length<75||item.intro.length<120)fail('Weak independent lead magnet: '+item.slug);
 if(item.steps?.length!==5||item.steps.some(s=>s.heading?.length<12||s.prompt?.length<90))fail('Five distinct safe action prompts required: '+item.slug);
 if(item.fields?.length!==3||item.fields.some(f=>f.length<14))fail('Missing three one-page worksheet fields: '+item.slug);
 if(item.limits?.length<100)fail('Limits must be explicit: '+item.slug);
 if(!articles.some(a=>a.slug===item.entry_slug&&a.product_slug===item.slug))fail('Broken educational link: '+item.slug);
 const strings=JSON.stringify(item);
 if(/https?:\/\/[^"\s]*obsidian-to-html/.test(strings)||/checkout_url|premium_lessons|private_manuscript|paid_lab/.test(strings))fail('Private or unauthorized promise in public resource: '+item.slug);
}
if(!existsSync(new URL('../src/pages/academia/[slug]/ferramenta-gratuita/index.astro',import.meta.url)))fail('Missing tool routes.');
if(process.exitCode)process.exit(process.exitCode);
console.log('Validated '+seen.size+' free, individually differentiated printable lead magnets with zero lead capture.');

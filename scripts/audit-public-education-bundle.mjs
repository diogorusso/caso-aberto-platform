/** Public Astro dist leak gate; not a replacement for editorial review. */
import {readdirSync,readFileSync,existsSync} from 'node:fs';
import {join,relative,resolve,dirname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dist=join(root,'dist');
if(!existsSync(dist))throw Error('Public dist/ missing; build Astro first.');
const paths=[];
function walk(folder){
 for(const item of readdirSync(folder,{withFileTypes:true})){
  const p=join(folder,item.name);
  if(item.isSymbolicLink())throw Error('Static bundle must never contain symlinks.');
  if(item.isDirectory())walk(p);else paths.push(p);
 }
}
walk(dist);
let failures=0;
const forbiddenPaths=[/editorial-preview/i,/editorial-drafts/i,/private-course/i,/course-release/i,/education-coverage\.json$/i,/education-content-packs\.json$/i,/course-encrypted/i,/\.enc\.json$/i];
const forbiddenText=[/wiki\/playbooks\/digital-autonomy-and-fraud-defense\/\d\d-/i,/CASOABERTO_EDUCATION_KEY_B64/,/casoaberto-course-encrypted-v1/,/private_source_url|full_chapter_text|premium_lessons/];
for(const file of paths){
 const relativePath=relative(dist,file).replaceAll(sep,'/');
 if(forbiddenPaths.some(re=>re.test(relativePath))){console.error('Restricted file in dist:',relativePath);failures++;continue;}
 if(!/\.(?:html|js|json|txt|xml|css)$/.test(relativePath))continue;
 if(forbiddenText.some(re=>re.test(readFileSync(file,'utf8')))){console.error('Restricted education marker in dist:',relativePath);failures++;}
}
if(failures)process.exit(1);
console.log('Public bundle audit passed for '+paths.length+' files; no course package, private research path, or editorial preview artifacts.');

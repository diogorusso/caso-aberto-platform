import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const src = resolve(root, 'src');
const walk = dir => readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(resolve(dir,e.name)):[resolve(dir,e.name)]);
const files=walk(src).filter(f=>['.astro','.ts','.tsx','.mjs'].includes(extname(f)));
let bad=0;
for (const file of files) {
  const text=readFileSync(file,'utf8');
  const imports=[...text.matchAll(/\bfrom\s+['"](\.{1,2}\/[^'"]+)['"]/g)].map(m=>m[1]);
  for (const rel of imports) {
    const path=resolve(dirname(file),rel);
    if (![path,`${path}.ts`,`${path}.tsx`,`${path}.astro`,`${path}.json`,resolve(path,'index.ts'),resolve(path,'index.astro')].some(existsSync)) {
      console.error('Unresolved import:',file.replace(root+'/',''),rel);bad++;
    }
  }
}
const cases=JSON.parse(readFileSync(resolve(src,'data/casos.json'),'utf8'));
const patterns=['casos/[slug]/index.astro','casos/[slug]/linha-do-tempo/index.astro','casos/[slug]/reclamacoes-publicas/index.astro','casos/[slug]/imprensa/index.astro','casos/[slug]/risco-roma-mobili/index.astro','casos/[slug]/responsaveis/index.astro','casos/[slug]/atualizacoes/index.astro','casos/[slug]/evidencias/index.astro','casos/[slug]/materiais-imprensa/index.astro','casos/[slug]/fact-sheet.txt.ts','casos/[slug]/indice-evidencias.csv.ts'];
for (const pattern of patterns) {
  const path=resolve(src,'pages',pattern);
  if (!existsSync(path) || !readFileSync(path,'utf8').includes('getStaticPaths')) {console.error('Missing static case route',pattern);bad++;}
}
const platform=['/','/empresas/','/cnpj/','/avaliacoes/nao-recomendamos/','/problemas/', '/casos/', '/como-funciona/', '/metodologia/', '/empresas/florense/', '/empresas/florense/ipanema-rj/', '/guias/risco-pagamento-antecipado-moveis-planejados/', '/guias/o-que-fazer-atraso-moveis-planejados/', '/rss.xml'];
for (const p of platform) {
  const file = p === '/' ? 'pages/index.astro' : p === '/rss.xml' ? 'pages/rss.xml.ts' : `pages${p}index.astro`;
  if (!existsSync(resolve(src, file))) {console.error('Missing platform route file', file);bad++;}
}
const all=new Set(platform);
for (const c of cases) for (const suffix of ['', 'linha-do-tempo/','reclamacoes-publicas/','imprensa/','risco-roma-mobili/','responsaveis/','atualizacoes/']) all.add(`/casos/${c.slug}/${suffix}`);

const extraStatic=['empresas/[slug]/index.astro','empresas/[slug]/[unit]/index.astro','cnpj/[cnpj]/index.astro','problemas/[slug]/index.astro'];
for(const route of extraStatic){
 const file=resolve(src,'pages',route);
 if(!existsSync(file)||!readFileSync(file,'utf8').includes('getStaticPaths')){console.error('Missing pSEO route',route);bad++;}
}
const brands=JSON.parse(readFileSync(resolve(src,'data/brands.json'),'utf8')).brands;
const issued=JSON.parse(readFileSync(resolve(src,'data/issues.json'),'utf8')).items;
const ids=JSON.parse(readFileSync(resolve(src,'data/company-profiles.json'),'utf8')).entities;
for(const brand of brands.filter(b=>b.published)){
 all.add('/empresas/'+brand.slug+'/');
 for(const u of brand.units.filter(u=>u.published))all.add('/empresas/'+brand.slug+'/'+u.slug+'/');
}
for(const c of ids)all.add('/cnpj/'+c.cnpj.replace(/\D/g,'')+'/');
for(const topic of issued)all.add('/problemas/'+topic.slug+'/');


// The platform landing page must never turn into the dossier of its first company.
const homeFile=resolve(src,'pages/index.astro');
if(existsSync(homeFile)){
 const home=readFileSync(homeFile,'utf8');
 const forbidden=[
  ['full editorial verdict on homepage',/<EditorialVerdict\b/],
  ['company-specific risk notice on homepage',/<ConsumerRiskWarning\b/],
  ['hard-coded first case on homepage',/\bCA-001\b|\/casos\/florense-/i],
  ['hard-coded company name in homepage layout',/\bFlorense\b|\bRoma Mobili\b/i],
  ['company verdict promoted as homepage brand',/\bbrands\[0\]\.verdict\b/]
 ];
 for(const [description,pattern] of forbidden){
  if(pattern.test(home)){console.error('Homepage must be company-neutral:',description);bad++;}
 }
 const needed=['/empresas/','/casos/','/metodologia/'];
 for(const path of needed)if(!home.includes(path)){console.error('Missing primary platform CTA',path);bad++;}
}
const header=readFileSync(resolve(src,'components/SiteHeader.astro'),'utf8');
if(/Caso CA-001|\/casos\/florense-/i.test(header)){console.error('Global header must be platform-neutral');bad++;}

if (bad) process.exit(1);
console.log(`OK: ${files.length} TS/Astro files; imports resolved; ${all.size} planned routes.`);

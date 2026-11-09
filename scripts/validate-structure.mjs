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
const patterns=['casos/[slug]/index.astro','casos/[slug]/linha-do-tempo/index.astro','casos/[slug]/reclamacoes-publicas/index.astro','casos/[slug]/imprensa/index.astro','casos/[slug]/risco-roma-mobili/index.astro','casos/[slug]/responsaveis/index.astro','casos/[slug]/atualizacoes/index.astro'];
for (const pattern of patterns) {
  const path=resolve(src,'pages',pattern);
  if (!existsSync(path) || !readFileSync(path,'utf8').includes('getStaticPaths')) {console.error('Missing static case route',pattern);bad++;}
}
const platform=['/', '/casos/', '/como-funciona/', '/metodologia/', '/empresas/florense/', '/empresas/florense/ipanema-rj/', '/guias/risco-pagamento-antecipado-moveis-planejados/', '/guias/o-que-fazer-atraso-moveis-planejados/', '/rss.xml'];
for (const p of platform) {
  const file = p === '/' ? 'pages/index.astro' : p === '/rss.xml' ? 'pages/rss.xml.ts' : `pages${p}index.astro`;
  if (!existsSync(resolve(src, file))) {console.error('Missing platform route file', file);bad++;}
}
const all=new Set(platform);
for (const c of cases) for (const suffix of ['', 'linha-do-tempo/','reclamacoes-publicas/','imprensa/','risco-roma-mobili/','responsaveis/','atualizacoes/']) all.add(`/casos/${c.slug}/${suffix}`);
if (bad) process.exit(1);
console.log(`OK: ${files.length} TS/Astro files; imports resolved; ${all.size} planned routes.`);

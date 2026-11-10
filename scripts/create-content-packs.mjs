/**
 * Usage:
 *   npm run content:pack
 *   npm run content:pack -- --slug=privacidade-sem-ilusoes
 *
 * No AI call, web request, account access, scheduling or publication occurs.
 * Only public approved snippets are used; all output stays under ignored build/.
 */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve,join} from 'node:path';
import {createContentPacks} from './content-pack-core.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read = filename => JSON.parse(readFileSync(join(root,'src','data',filename+'.json'),'utf8'));
const allowed = process.argv.slice(2);
if(allowed.some(arg=>!/^--slug=[a-z0-9]+(?:-[a-z0-9]+)*$/.test(arg))){
 console.error('Uso: npm run content:pack -- [--slug=identificador]');
 process.exit(2);
}
const filter=allowed.find(arg=>arg.startsWith('--slug='))?.slice(7);
const packs=createContentPacks(read('content-distribution-queue'),read('learning-publications'),read('education-products'),filter);
const target=join(root,'build','editorial-drafts');
mkdirSync(target,{recursive:true});
for(const pack of packs){
 const filename=pack.id.replace('CA-CONTENT-','');
 // JSON makes each candidate format inspectable by designers/agents before approval.
 writeFileSync(join(target,filename+'.json'),JSON.stringify(pack,null,2)+'\n',{flag:'w'});
 const text=[
  '# '+pack.headline,
  '',
  '> MATERIAL INTERNO — RASCUNHO SEM PUBLICAÇÃO',
  '',
  '**Pergunta:** '+pack.claim,
  '',
  '**Limite da evidência:** '+pack.scope_limit,
  '',
  '## Candidatos a peça',
  '',
  '### Card social',
  pack.variants.social_card.body,
  '',
  '### Roteiro curto',
  ...pack.variants.short_video.beats.map((beat,i)=>(i+1)+'. '+beat),
  '',
  '### Newsletter',
  '**Assunto:** '+pack.variants.newsletter.subject,
  ...pack.variants.newsletter.sections.map(line=>'- '+line),
  '',
  '## Fontes para revisão',
  ...pack.sources.map(s=>'- ['+s.title+']('+s.url+')'),
  '',
  '## Fluxo',
  ...pack.editorial_checklist.map(x=>'- [ ] '+x),
  '',
  '**Amostra pública:** '+pack.source_article,
  '',
  '**Formação em produção:** '+pack.product.name+' · '+pack.product.url,
  ''
 ].join('\n');
 writeFileSync(join(target,filename+'.md'),text,{flag:'w'});
}
console.log('Criados '+packs.length+' pacotes de rascunhos locais em build/editorial-drafts/. Nenhum material foi publicado.');

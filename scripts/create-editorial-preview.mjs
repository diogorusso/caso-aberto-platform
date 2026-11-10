/** Usage: npm run content:preview -- [--slug=privacidade-sem-ilusoes].
 * Writes only to the ignored build/ directory. No sending/publishing.
 */
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve,join} from 'node:path';
import {renderEditorialPreview} from './editorial-preview-core.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
if(args.length>1||args.some(a=>!/^--slug=[a-z0-9]+(?:-[a-z0-9]+)*$/.test(a))){
 console.error('Uso: npm run content:preview -- [--slug=identificador]');process.exit(2);
}
const filter=args[0]?.slice(7);
const data=JSON.parse(readFileSync(join(root,'src/data/education-content-packs.json'),'utf8'));
if(data.visibility!=='internal-draft-marketing-assets'||data.source_kind!=='public-snippet-derivative')throw Error('Invalid editorial data source');
const packs=data.packs.filter(p=>!filter||p.slug===filter);
if(!packs.length)throw Error('No editorial content for '+filter);
const target=join(root,'build','editorial-preview');
mkdirSync(target,{recursive:true});
writeFileSync(join(target,'index.html'),renderEditorialPreview(packs),'utf8');
console.log('Created build/editorial-preview/index.html with '+packs.length+' local-only draft packs. No publishing.');

/** Explicit offline packaging, never web publication.
 * npm run course:package -- --product=pegadas-digitais --release=v1 --source=/absolute/private/course/dir --out=/absolute/secure/releases --approve-private-export
 * Environment secret: CASOABERTO_EDUCATION_KEY_B64 (32 random bytes in base64).
 */
import {readFileSync,writeFileSync,readdirSync,lstatSync,realpathSync,existsSync} from 'node:fs';
import {join,relative,resolve,isAbsolute,sep,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {COURSE_MAX_BYTES,COURSE_MAX_FILES,checkPath,parseCourseKey,sealPrivateCourse,sha256} from './private-course-core.mjs';

const root=realpathSync(resolve(dirname(fileURLToPath(import.meta.url)),'..'));
const args=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')&&x.includes('=')).map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
const confirmed=process.argv.includes('--approve-private-export');
if(!confirmed||Object.keys(args).some(k=>!['product','release','source','out'].includes(k))||!['product','release','source','out'].every(k=>args[k])){
 console.error('Uso: npm run course:package -- --product=<programa> --release=<versao> --source=<diretorio-privado-absoluto> --out=<diretorio-seguro-absoluto> --approve-private-export');
 process.exit(2);
}
if(!isAbsolute(args.source)||!isAbsolute(args.out))throw Error('Source and output must be absolute directories.');
const source=realpathSync(args.source),out=realpathSync(args.out);
const within=(path,folder)=>path===folder||path.startsWith(folder+sep);
if(within(source,root)||within(out,root)||within(source,out)||within(out,source))throw Error('Private sources and encrypted releases must stay OUTSIDE the public repo and separate from each other.');
if(!lstatSync(source).isDirectory()||!lstatSync(out).isDirectory())throw Error('Source and output must be existing directories.');
const programs=JSON.parse(readFileSync(join(root,'src/data/education-products.json'),'utf8')).tiers;
if(!programs.some(x=>x.slug===args.product))throw Error('Unknown course product.');
const key=parseCourseKey(process.env.CASOABERTO_EDUCATION_KEY_B64);
const files=[];let total=0;
function collect(folder,prefix=''){
 for(const dirent of readdirSync(folder,{withFileTypes:true})){
  if(dirent.name.startsWith('.')||dirent.isSymbolicLink())throw Error('Hidden or linked private entry is prohibited.');
  const filename=join(folder,dirent.name),name=prefix?prefix+'/'+dirent.name:dirent.name;
  if(dirent.isDirectory()){collect(filename,name);continue;}
  if(!dirent.isFile())throw Error('Unsupported course entry type.');
  checkPath(name);
  const bytes=readFileSync(filename);
  total+=bytes.length;
  if(total>COURSE_MAX_BYTES||files.length>=COURSE_MAX_FILES)throw Error('Course exceeds release limits.');
  files.push({name,bytes});
 }
}
collect(source);
const bundle=sealPrivateCourse({product:args.product,release:args.release,files,key});
const payload=JSON.stringify(bundle)+'\n';
const manifest={
 format:'casoaberto-private-course-manifest-v1',
 product:args.product,release:args.release,
 review_status:'encrypted-not-published',
 file_count:files.length,
 package_sha256:sha256(Buffer.from(payload)),
 package_bytes:Buffer.byteLength(payload),
 created_at:new Date().toISOString()
};
const base=args.product+'-'+args.release;
const filename=join(out,base+'.enc.json'),manifestPath=join(out,base+'.manifest.json');
if(existsSync(filename)||existsSync(manifestPath))throw Error('Release already exists; choose a new release ID.');
writeFileSync(filename,payload,{flag:'wx',mode:0o600});
writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n',{flag:'wx',mode:0o600});
console.log('Encrypted '+files.length+' private course files as '+base+' outside the public repo. No plaintext, key, payment or premium content was published.');

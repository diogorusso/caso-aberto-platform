#!/usr/bin/env node
/**
 * Local-only SHA-256 evidence inventory. Never uploads evidence or writes to public/.
 * Usage: node scripts/build-evidence-manifest.mjs ./evidence-private/originais ./evidence-private/manifests
 */
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import {readdir, stat, mkdir, writeFile, realpath} from 'node:fs/promises';
import {resolve, relative, join, sep, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const input=resolve(process.argv[2]||'');
const output=resolve(process.argv[3]||join(root,'evidence-private','manifests'));
if(!process.argv[2]){console.error('Usage: node scripts/build-evidence-manifest.mjs INPUT_DIR [OUTPUT_DIR]');process.exit(2);}
const inRepo=(p)=>p===root||p.startsWith(root+sep);
if(inRepo(output)&&!output.startsWith(join(root,'evidence-private')+sep)){console.error('Output must be outside the repository or in evidence-private/.');process.exit(2);}
if(input===output||output.startsWith(input+sep)){console.error('Output cannot be inside the evidence source directory.');process.exit(2);}
const rejectPublic=(p)=>p===join(root,'public')||p.startsWith(join(root,'public')+sep)||p===join(root,'dist')||p.startsWith(join(root,'dist')+sep);
if(rejectPublic(input)||rejectPublic(output)){console.error('Public web directories are not accepted.');process.exit(2);}
let source;
try{source=await realpath(input);if(!(await stat(source)).isDirectory())throw Error('Input must be directory');}
catch(error){console.error('Invalid source directory:',String(error));process.exit(2);}
const files=[];
async function visit(dir){
 for(const entry of await readdir(dir,{withFileTypes:true})){
  const f=join(dir,entry.name);
  if(entry.isSymbolicLink())continue;
  if(entry.isDirectory()){await visit(f);continue;}
  if(!entry.isFile())continue;
  const meta=await stat(f);
  const hash=createHash('sha256');
  await new Promise((ok,fail)=>{
   const stream=createReadStream(f);stream.on('data',chunk=>hash.update(chunk));stream.on('error',fail);stream.on('end',ok);
  });
  files.push({relative_path:relative(source,f).split(sep).join('/'),bytes:meta.size,modified_at:meta.mtime.toISOString(),sha256:hash.digest('hex')});
 }
}
await visit(source);
files.sort((a,b)=>a.relative_path.localeCompare(b.relative_path));
await mkdir(output,{recursive:true});
const snapshot={format:'CasoAberto local evidence hash manifest v1',scanned_at:new Date().toISOString(),input_directory:source,algorithm:'SHA-256',count:files.length,files};
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const basename='evidence-manifest-'+stamp;
const csvQuote=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
const columns=['relative_path','bytes','modified_at','sha256'];
await writeFile(join(output,basename+'.json'),JSON.stringify(snapshot,null,2)+'\n',{flag:'wx',mode:0o600});
await writeFile(join(output,basename+'.csv'),columns.join(';')+'\r\n'+files.map(f=>columns.map(k=>csvQuote(f[k])).join(';')).join('\r\n')+'\r\n',{flag:'wx',mode:0o600});
console.log('Private inventory created:',basename,'files:',files.length,'destination:',output);
console.log('Hashes are file-integrity references, not proof of authorship or date of creation.');

/** Verifies an offline encrypted release; does not extract or publish content.
 * npm run course:verify -- --package=/absolute/file.enc.json --manifest=/absolute/file.manifest.json
 */
import {readFileSync,realpathSync} from 'node:fs';
import {isAbsolute,resolve,dirname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseCourseKey,openPrivateCourse,sha256} from './private-course-core.mjs';
const root=realpathSync(resolve(dirname(fileURLToPath(import.meta.url)),'..'));
const args=Object.fromEntries(process.argv.slice(2).filter(x=>x.startsWith('--')&&x.includes('=')).map(x=>x.slice(2).split(/=(.*)/s).slice(0,2)));
if(!args.package||!args.manifest||!isAbsolute(args.package)||!isAbsolute(args.manifest)||Object.keys(args).some(k=>!['package','manifest'].includes(k)))throw Error('Provide absolute --package and --manifest paths.');
const pkg=realpathSync(args.package),manifestPath=realpathSync(args.manifest);
const within=p=>p===root||p.startsWith(root+sep);
if(within(pkg)||within(manifestPath))throw Error('Releases must remain outside the public repository.');
const payload=readFileSync(pkg),manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
if(manifest.format!=='casoaberto-private-course-manifest-v1'||manifest.review_status!=='encrypted-not-published')throw Error('Invalid release manifest.');
if(sha256(payload)!==manifest.package_sha256||payload.byteLength!==manifest.package_bytes)throw Error('Release hash/size mismatch.');
const key=parseCourseKey(process.env.CASOABERTO_EDUCATION_KEY_B64);
const verified=openPrivateCourse(JSON.parse(payload.toString('utf8')),key);
if(verified.product!==manifest.product||verified.release!==manifest.release||verified.files.length!==manifest.file_count)throw Error('Release manifest does not match encrypted content.');
console.log('Verified encrypted course '+verified.product+' '+verified.release+' ('+verified.files.length+' files). No plaintext written, entitlement or release to learners.');

/** Render static, platform-compatible 1200×630 PNG previews with sourced visuals.
 * Real company media is used only from the pre-existing, provenance-tracked media registry.
 * Other cases use documentary typography, not AI-invented portraits or fictional logos.
 */
import sharp from 'sharp';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {join,dirname} from 'node:path';
const root=process.cwd(),read=async(name)=>JSON.parse(await readFile(join(root,'src/data',name+'.json'),'utf8'));
const [owned,atlas,politics,platforms,categories,media]=await Promise.all(['casos','public-case-atlas','political-observatory','platform-observatory','case-categories','company-media'].map(read));
const category=new Map(categories.categories.flatMap(c=>c.case_ids.map(id=>[id,c.title])));
const directory=join(root,'public','og');
await mkdir(join(directory,'casos'),{recursive:true});
await mkdir(join(directory,'historias'),{recursive:true});
const escape=(s)=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
const split=(text,max=25,lines=4)=>{
 const words=String(text||'').trim().split(/\s+/),chunks=[];let current='';
 for(const word of words){
  if((current+' '+word).trim().length>max&&current){chunks.push(current);current=word;}
  else current=(current?current+' ':'')+word;
 }
 if(current)chunks.push(current);
 if(chunks.length>lines){const last=chunks.slice(lines-1).join(' ');chunks.splice(lines-1,chunks.length-(lines-1),last.slice(0,max-1)+'…');}
 return chunks.slice(0,lines);
};
const text=(value,x,y,size,color='#f1f1e7',weight=700)=>'<text x="'+x+'" y="'+y+'" font-family="Arial, Liberation Sans, sans-serif" font-size="'+size+'" font-weight="'+weight+'" fill="'+color+'">'+escape(value)+'</text>';
const photo=media.brands?.florense?.units?.['ipanema-rj']?.image;
const logo=media.brands?.florense?.logo;
async function available(webPath){if(!webPath||!webPath.startsWith('/media/'))return null;const local=join(root,'public',webPath);try{await stat(local);return local}catch{return null}}
const verifiedPhoto=await available(photo?.src);
const verifiedLogo=await available(logo?.src);
const sources=[
 ...owned.map(c=>({id:c.id,slug:c.slug,company:c.empresa_resumo,title:c.chamada,category:category.get(c.id),date:c.status_data,group:'CASO EM DESTAQUE',image:c.id===categories.featured_case_id?verifiedPhoto:null,logo:c.id===categories.featured_case_id?verifiedLogo:null})),
 ...atlas.cases.map(c=>({id:c.id,slug:c.slug,company:c.company,title:c.headline,category:category.get(c.id),date:c.reviewed_at,group:'CASO DOCUMENTADO'})),
 ...politics.cases.map(c=>({id:c.id,slug:c.slug,company:c.topic||'Poder público',title:c.title,category:category.get(c.id),date:c.reviewed_at,group:'TRANSPARÊNCIA E PODER'})),
 {id:'PLAT-2026-CASE',slug:'meta-eleicoes-2026-governanca-plataformas',company:'Meta · Facebook · Instagram',title:'Quem responde pelos anúncios e pela moderação?',category:category.get('PLAT-2026-CASE'),date:platforms.reviewed_at,group:'PLATAFORMAS E DADOS'}
];
const casesBySlug=new Map(sources.map(c=>[c.slug,c]));
const stories=atlas.stories.map(p=>{const first=casesBySlug.get(p.case_slugs[0]);return {id:p.id,slug:p.slug,company:p.display_name,title:p.headline,category:p.category,date:p.source_published_at,group:'HISTÓRIA DOCUMENTADA',human:true,related:first?.company||''};});
function layout(item){
 const titleLines=split(item.title,33,4);
 const brandLines=split(item.company,21,3);
 const date=item.date?.split('-').reverse().join('/')||'';
 const titleSvg=titleLines.map((v,i)=>text(v,64,205+i*64,52,'#f1f1e7',800)).join('');
 const right=!item.image?brandLines.map((v,i)=>text(v,836,245+i*54,v.length>21?34:41,'#f1f1e7',800)).join(''):'';
 const idText=item.id?item.id+' · ':'';
 const background='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#121b18"/>'+
  '<rect x="790" width="410" height="630" fill="#233c34"/>'+
  '<rect x="64" y="45" width="34" height="38" rx="4" fill="#ec776b"/>'+text('C',72,75,24,'#121b18',800)+text('CASO',112,75,27,'#f1f1e7',900)+text('ABERTO',198,75,27,'#ec776b',900)+
  text(item.group,64,137,16,'#ec8a80',800)+
  '<rect x="64" y="527" width="665" height="1" fill="#53645b"/>'+
  titleSvg+
  text(item.category||'Pesquisa documentada',64,572,19,'#bfcfc4',600)+
  text(idText+date,64,603,17,'#91a69a',500)+
  (!item.image?'<rect x="829" y="98" width="320" height="2" fill="#ec776b"/>'+right+
  text(item.human?'PESSOAS · DOCUMENTOS · FONTES':'PESQUISA · CRONOLOGIA · PROVAS',831,519,15,'#f3ae9b',700)+text('casoaberto.pages.dev',831,566,17,'#b8c9c0',500):'')+
  '</svg>';
 return Buffer.from(background);
}
async function render(item,file){
 const layers=[];
 if(item.image){
  const picture=await sharp(item.image).resize(410,630,{fit:'cover',position:'centre'}).png().toBuffer();
  layers.push({input:picture,left:790,top:0});
  const layer=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect x="790" y="470" width="410" height="160" fill="#121b18" fill-opacity=".90"/>'+text('FLORENSE IPANEMA',820,515,24,'#ffffff',800)+text('Foto da unidade · Florense',820,590,15,'#d0dbd4',500)+'</svg>');
  layers.push({input:layer,left:0,top:0});
  if(item.logo){
   const badge=await sharp(item.logo).resize({width:190,height:48,fit:'inside'}).png().toBuffer();
   layers.push({input:badge,left:820,top:524});
  }
 }
 const renderer=sharp(layout(item));
 if(layers.length)renderer.composite(layers);
 await renderer.png({compressionLevel:8,palette:true,effort:7}).toFile(file);
}
let n=0;
for(const item of sources){await render(item,join(directory,'casos',item.slug+'.png'));n++}
for(const item of stories){await render(item,join(directory,'historias',item.slug+'.png'));n++}
await render({id:'',title:'A empresa prometeu. Quem responde?',company:'CASOABERTO',category:'Pesquisa, dados e ação cidadã',group:'INSTITUTO · PESQUISA · AÇÃO',date:categories.updated_at},join(directory,'default.png'));
console.log('OG artwork generated: '+n+' case and story previews + branded default, 1200×630 PNG; Florense photo/logo from original sourced assets.');

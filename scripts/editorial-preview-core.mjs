/** Pure, browser-local draft preview. Never loads the private playbook or publishes. */
export const escapeHtml = input => String(input ?? '').replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
export function linkForPreview(input){
 const value=String(input||'');
 if(/^\/(?:academia|autonomia-digital)\/[a-z0-9/-]+\/$/.test(value))return 'https://casoaberto.pages.dev'+value;
 try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:'#';}catch{return '#';}
}
const e=escapeHtml;
const anchor=(label,href)=>'<a target="_blank" rel="noopener noreferrer" href="'+e(linkForPreview(href))+'">'+e(label)+'</a>';
function renderPack(p,index){
 if(p.review_status!=='draft-human-review'||p.status!=='roteiro-editorial'||p.publication_url!==null)throw Error('Unreviewed or published brief cannot enter local preview.');
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug)||!Array.isArray(p.carousel)||p.carousel.length!==4)throw Error('Invalid editorial pack');
 const slides=p.carousel.map((s,i)=>'<li class="frame"><span>CASOABERTO · '+(i+1)+'/4</span><strong>'+e(s)+'</strong><small>RASCUNHO EDUCATIVO</small></li>').join('');
 const row=(name,body)=>'<section class="panel"><h3>'+e(name)+'</h3><p>'+e(body)+'</p></section>';
 return '<article class="pack" data-search="'+e([p.slug,p.hook,p.question,p.product_slug].join(' ').toLocaleLowerCase('pt-BR'))+'">'+
  '<details '+(index===0?'open':'')+'><summary><span class="number">'+String(index+1).padStart(2,'0')+'</span><span><strong>'+e(p.hook)+'</strong><small>'+e(p.product_slug)+' · 4 formatos · sem publicação</small></span></summary>'+
  '<div class="packbody"><p class="question">'+e(p.question)+'</p><h3>Carrossel · quatro quadros</h3><ol class="slides">'+slides+'</ol>'+
  '<div class="columns">'+row('Legenda',p.caption)+row('Roteiro de vídeo curto',p.short_video_script)+row('Abertura da newsletter',p.newsletter_excerpt)+
  '<section class="panel"><h3>Evidência e limites</h3><p>'+e(p.limit)+'</p><p>'+anchor('Fonte original',p.source_url)+'</p><p>'+anchor('Insight público',p.read_more_url)+'</p><p>'+anchor('Programa em desenvolvimento',p.product_preview_url)+'</p></section></div>'+
  '<p class="notice">Revisão humana obrigatória: fontes, recorte, legendas, arte, direitos, acessibilidade e canal. O pack ainda não foi publicado.</p></div></details></article>';
}
export function renderEditorialPreview(packs){
 if(!Array.isArray(packs)||packs.length<1||packs.length>100)throw Error('Expected between one and 100 packs');
 const css=[
  ':root{font:16px/1.55 system-ui,-apple-system,sans-serif;color:#15211a;background:#f7f7f2}*{box-sizing:border-box}body{margin:0}',
  '.hero{background:#14251e;color:#fff;padding:48px max(24px,calc((100vw - 1100px)/2))}h1{font-size:clamp(32px,5vw,60px);line-height:1.08;max-width:900px;margin:12px 0}.hero p{color:#dfe7e1;max-width:760px}.eyebrow{color:#ff987a;letter-spacing:.12em;font-size:12px;font-weight:800}',
  'main{max-width:1140px;margin:auto;padding:24px 20px 80px}#filter{width:100%;padding:14px;max-width:650px;margin:10px 0 28px;border:1px solid #a9bbaa;background:#fff}a{color:#a8372a;overflow-wrap:anywhere}a:focus-visible,summary:focus-visible,input:focus-visible{outline:3px solid #a8372a;outline-offset:3px}',
  '.pack{border:1px solid #d8e4d9;background:#fff;margin-bottom:14px}.pack[hidden]{display:none}.pack summary{cursor:pointer;display:flex;align-items:center;gap:15px;padding:20px}.pack summary strong{display:block;font-size:20px}.pack summary small{display:block;font-size:12px;color:#64736a}.number{font-weight:800;font-size:26px;color:#a8372a}',
  '.packbody{padding:20px;border-top:1px solid #d8e4d9}.question{font-size:20px;font-weight:600}.slides{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;list-style:none;padding:0}.frame{aspect-ratio:4/5;min-height:230px;background:#1c3028;color:#fff;padding:15px;display:flex;flex-direction:column;justify-content:space-between;word-break:break-word}.frame:nth-child(even){background:#f46851;color:#17221a}.frame span,.frame small{font-size:10px;letter-spacing:.07em;font-weight:800}.frame strong{font-size:clamp(15px,1.8vw,23px);line-height:1.2}',
  '.columns{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.panel{background:#eff1ea;padding:18px}.panel h3{margin:0 0 10px}.panel p{margin:0 0 12px}.notice{border-left:4px solid #a8372a;background:#fff1ed;padding:12px;font-size:13px}.foot{border-top:1px solid #d8e4d9;padding:18px 0;color:#596a61;font-size:13px}',
  '@media(max-width:760px){.slides{grid-template-columns:repeat(2,minmax(0,1fr))}.columns{grid-template-columns:1fr}.frame{min-height:200px}}@media print{.hero{background:#fff;color:#111;padding:20px}.hero p{color:#111}#filter{display:none}.frame{print-color-adjust:exact;-webkit-print-color-adjust:exact}details:not([open]){display:none}}'
 ].join('\n');
 const script='<script>const f=document.querySelector("#filter");const cards=[...document.querySelectorAll(".pack")];f.addEventListener("input",()=>{const q=f.value.trim().toLocaleLowerCase("pt-BR");for(const c of cards)c.hidden=!c.dataset.search.includes(q);});</script>';
 return ['<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
  '<meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><title>Ateliê editorial local — CasoAberto</title><style>',css,'</style></head><body>',
  '<header class="hero"><span class="eyebrow">CASOABERTO · PRODUÇÃO LOCAL</span><h1>Ateliê de conteúdo educacional</h1><p>Prévia de ',String(packs.length),
  ' pacotes com carrossel, legenda, vídeo curto e newsletter. Material para revisão humana — não é publicação, oferta comercial nem conteúdo integral do curso.</p></header>',
  '<main><label for="filter"><strong>Filtrar roteiros</strong></label><input id="filter" type="search" placeholder="Título, assunto ou produto..." aria-label="Filtrar roteiros">',
  '<section aria-label="Pautas em revisão">',packs.map(renderPack).join(''),'</section>',
  '<p class="foot">Gerado localmente, sem API, rastreadores ou postagem automática. O playbook integral de 56 capítulos permanece privado.</p></main>',
  script,'</body></html>'].join('');
}

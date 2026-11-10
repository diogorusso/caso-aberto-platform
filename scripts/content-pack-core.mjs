/**
 * Build offline editorial briefs from *public* approved snippets and draft distribution angles.
 * This module never accesses the private wiki and cannot publish to remote services.
 */
export const validSlug = value => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
export const articlePath = slug => '/autonomia-digital/guias/'+slug+'/';
export const productPath = slug => '/academia/'+slug+'/';
const max = (value,n) => String(value||'').trim().slice(0,n);
const sourceLink = source => ({title:max(source.name,200),url:source.url});
export function createContentPack(topic,article,product){
 if(!validSlug(topic.slug)||!validSlug(article.slug)||!validSlug(product.slug)) throw Error('Invalid route slug');
 if(topic.status!=='roteiro-editorial'||topic.publication_url!==null)throw Error('Only unpublished editorial topics are eligible.');
 if(topic.article_slug!==article.slug||topic.product_slug!==product.slug||article.product_slug!==product.slug)throw Error('Topic does not map to the approved public snippet and program.');
 if(article.format!=='insight_publico'||!Array.isArray(article.sources)||article.sources.length<2)throw Error('Public-source gate failed.');
 if(product.status!=='em-producao'||product.checkout_url!==null)throw Error('A purchase or enrollment must not be inferred.');
 if(topic.hook.length>150||topic.question.length>260||topic.limit.length>500)throw Error('Editorial brief too extensive.');
 const excerpt=article.sections[0]?.paragraphs[0];
 if(!excerpt||excerpt.length>1000)throw Error('Missing or oversized public excerpt.');
 const citationSet=article.sources.map(sourceLink);
 const link=articlePath(article.slug), productLink=productPath(product.slug);
 const proofNote='Fontes e limites no link. Não afirmar causalidade, intenção, resultado ou influência sem comprovação.';
 return {
   id:'CA-CONTENT-'+topic.slug,
   status:'rascunho_editorial_sem_publicacao',
   created_from:'snippet_publico_aprovado',
   source_article:link,
   sources:citationSet,
   product:{name:product.name,url:productLink,status:'em-producao'},
   headline:topic.hook,
   audience:'público geral — contexto e pergunta, sem segmentação por crenças ou dados pessoais',
   claim:topic.question,
   scope_limit:topic.limit,
   editorial_checklist:[
     'Confirmar se as fontes continuam disponíveis e sustentam cada afirmação.',
     'Revisar data, método, jurisdição, números e explicações alternativas.',
     'Não sugerir que o curso já está à venda ou que há inscrição ativa.',
     'Não adicionar dados pessoais, perfis políticos ou mensagens de mobilização automática.',
     'Aprovação editorial humana antes de criar arte, publicar ou distribuir.'
   ],
   variants:{
     social_card:{
       title:max(topic.hook,90),
       body:max(topic.question,220),
       evidence_anchor:max(excerpt,360),
       footnote:proofNote,
       call_to_action:'Leia o insight com fontes: '+link,
       status:'roteiro_nao_publicado'
     },
     short_video:{
       duration_target_seconds:'20–45',
       beats:[
         'Abertura factual: '+max(topic.hook,100),
         'Pergunta para investigar: '+max(topic.question,230),
         'Uma distinção essencial: '+max(topic.limit,220),
         'Fonte e ação: leia '+link+' e consulte referências primárias.'
       ],
       visual_constraints:'Sem imagens sintéticas de pessoas ou acontecimentos apresentadas como evidência. Legendar cada material ilustrativo.',
       review_note:proofNote
     },
     faq:{
       question:topic.question,
       answer_seed:topic.limit,
       source_article:link,
       verified_sources:citationSet
     },
     newsletter:{
       subject:max(topic.hook,100),
       preview:'O que a pergunta revela — e o que os dados ainda não demonstram.',
       sections:[
         'Pergunta principal: '+topic.question,
         'Explicação de entrada: '+max(excerpt,500),
         'Distinção importante: '+topic.limit,
         'Leitura aprofundada com referências: '+link
       ],
       product_context:'Formação em desenvolvimento, não à venda: '+product.name+' — '+productLink,
       editorial_note:proofNote
     }
   }
 };
}
export function createContentPacks(queue,catalog,products,onlySlug){
 const articles=new Map(catalog.articles.map(x=>[x.slug,x]));
 const tiers=new Map(products.tiers.map(x=>[x.slug,x]));
 const selected=queue.topics.filter(t=>!onlySlug||t.slug===onlySlug);
 if(!selected.length)throw Error('Nenhuma pauta encontrada para o filtro solicitado.');
 const seen=new Set();
 return selected.map(t=>{
  if(seen.has(t.slug))throw Error('Pauta duplicada: '+t.slug);
  seen.add(t.slug);
  const article=articles.get(t.article_slug), product=tiers.get(t.product_slug);
  if(!article||!product)throw Error('Vínculo não encontrado: '+t.slug);
  return createContentPack(t,article,product);
 });
}

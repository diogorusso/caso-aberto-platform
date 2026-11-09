import type {APIRoute} from 'astro';
import {cases,casePath,brl,reportsFor,updatesFor,siteOrigin} from '../../../lib/cases';
export function getStaticPaths(){return cases.map(item=>({params:{slug:item.slug}}));}
const escapeText=(s:unknown)=>String(s??'').replace(/\r/g,'').replace(/\n/g,' ').trim();
export const GET:APIRoute=({params})=>{
 const item=cases.find(c=>c.slug===params.slug);
 if(!item)return new Response('Caso não encontrado',{status:404});
 const text=[
  'CASOABERTO — FACT SHEET EDITORIAL '+item.id,
  'Última revisão: '+item.status_data,
  'URL: '+siteOrigin+casePath(item),
  'Assunto: '+item.titulo,
  'Local: '+item.local,
  'Categoria: '+item.categoria,
  'Valor informado como pago: '+(item.valor_brl?brl(item.valor_brl):'Não informado'),
  'Status no arquivo: '+item.status,
  'Prazo original: '+(item.prazo_original||'Não informado'),
  '',
  'RESUMO DO CASO',escapeText(item.resumo),'',
  'CRONOLOGIA',
  ...item.cronologia.map(x=>escapeText(x.data)+' — '+escapeText(x.titulo)+' — '+escapeText(x.texto)),
  '',
  'RECLAMAÇÕES PÚBLICAS NO ARQUIVO',
  ...reportsFor(item).map(r=>escapeText(r.data)+' — '+escapeText(r.status)+' — '+r.url),
  '',
  'FONTES DO DOSSIÊ',
  ...item.fontes.map(f=>escapeText(f.titulo)+' — '+f.url),
  '',
  'PERGUNTAS INSTITUCIONAIS',
  ...(item.imprensa_perguntas||[]).map((q,i)=>(i+1)+'. '+escapeText(q)),
  '',
  'ATUALIZAÇÕES PUBLICADAS',
  ...updatesFor(item).map(u=>escapeText(u.date)+' — '+escapeText(u.title)),
  '',
  'Documentos privados não incluídos. O resumo não substitui os documentos originais.',
  'Informações e status referem-se à data da revisão editorial acima.',
  'CasoAberto — publicação independente',
  ''
 ].join('\n');
 return new Response(text,{headers:{'Content-Type':'text/plain; charset=utf-8','Content-Disposition':'attachment; filename="'+item.id+'-fact-sheet.txt"','Cache-Control':'public, max-age=3600'}});
};
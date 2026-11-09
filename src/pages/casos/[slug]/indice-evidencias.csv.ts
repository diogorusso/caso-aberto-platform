import type {APIRoute} from 'astro';
import {cases} from '../../../lib/cases';
import evidence from '../../../data/evidence-index.json';
export function getStaticPaths(){return cases.map(item=>({params:{slug:item.slug}}));}
const cell=(value:unknown)=>{const s=String(value??'').replace(/\r?\n/g,' ');const safe=/^[=+@-]/.test(s)?'\''+s:s;return '"'+safe.replace(/"/g,'""')+'"';};
export const GET:APIRoute=({params})=>{
 const item=cases.find(c=>c.slug===params.slug);
 if(!item)return new Response('Caso não encontrado',{status:404});
 const columns=['id','event_date','kind','title','status','visibility','description','source_url','needs','relation'];
 const rows=evidence.items.filter(e=>evidence.case_id===item.id);
 const body='\uFEFF'+[columns.join(';'),...rows.map(row=>columns.map(k=>cell(row[k as keyof typeof row])).join(';'))].join('\r\n')+'\r\n';
 return new Response(body,{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="'+item.id+'-indice-evidencias.csv"','Cache-Control':'public, max-age=3600'}});
};
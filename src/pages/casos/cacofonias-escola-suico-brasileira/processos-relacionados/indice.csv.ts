import type {APIRoute} from 'astro';
import registry from '../../../../data/sis-related-proceedings.json';
// CSV consumed offline by authorized reviewers; records are indexed references, not open-case counts.
const columns=['id','cluster','type','number','court','place','source_date','opened_at','entity_id','position','subject','status','result','family','source_kind','source_url','question','meaning'] as const;
const safe=(value:unknown):string=>{
 const text=String(value??'').replace(/\r\n?|\n/g,' ').trim();
 // Formula injection safety in Excel/LibreOffice; these are legal text fields, not formulas.
 const sanitized=/^[=+@\-\t]/.test(text)?"'"+text:text;
 return '"'+sanitized.replace(/"/g,'""')+'"';
};
export const GET:APIRoute=()=>{
 const lines=[columns.join(','),...registry.records.map(item=>columns.map(column=>safe(item[column])).join(','))];
 return new Response('\uFEFF'+lines.join('\r\n')+'\r\n',{
  headers:{
   'Content-Type':'text/csv; charset=utf-8',
   'Content-Disposition':'attachment; filename="casoaberto-sis-processos-2026-11-12.csv"',
   'Cache-Control':'public, max-age=3600',
   'X-Content-Type-Options':'nosniff',
  }
 });
};

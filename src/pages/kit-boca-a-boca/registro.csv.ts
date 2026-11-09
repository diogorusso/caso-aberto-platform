import type {APIRoute} from 'astro';
export const GET:APIRoute=()=>{
 const rows=[
  ['data','caso_id','bairro','local_autorizado','modelo','tinta','folhas_impressas','pecas_distribuidas','pecas_restantes','status_conferido_em','observacoes_sem_dados_pessoais'],
  ['AAAA-MM-DD','[ID-DO-CASO]','[bairro]','[local permitido]','panfletos-a5','pb','','','','AAAA-MM-DD','[registrar somente quantidades e dúvidas]']
 ];
 const q=(v:string)=>'"'+v.replaceAll('"','""')+'"';
 const body='\uFEFF'+rows.map(row=>row.map(q).join(';')).join('\r\n')+'\r\n';
 return new Response(body,{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="registro-distribuicao-casoaberto.csv"','Cache-Control':'public, max-age=3600'}});
};
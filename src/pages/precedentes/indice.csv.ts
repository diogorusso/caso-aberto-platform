import type {APIRoute} from 'astro';
import {precedents,precedentPath,precedentDuration} from '../../lib/precedents';
import raw from '../../data/precedents.json';
const cols=['id','empresa','setor','etapa','numero_processo','tribunal','data_marco_inicial','descricao_marco_inicial','data_falencia','data_deferimento_rj','dias_entre_marcos_definidos','tipo_do_intervalo','valor_dividas_declaradas_brl','creditos_clientes_pago_nao_entregue_brl','lancamentos_creditos_cliente','fonte_judicial_ou_primaria','pagina_casoaberto','revisado_em','limites'];
const quote=(v:unknown)=>'"'+String(v??'').replace(/"/g,'""').replace(/\r?\n/g,' ')+'"';
export const GET:APIRoute=()=>{
 const rows=precedents.map(p=>[
 p.id,p.brand,p.segment,p.stage_label,p.process_number,p.court,p.start_date,p.start_kind,p.bankruptcy_decree_date,
 p.recovery_acceptance_date,precedentDuration(p),p.comparison_period_kind,p.financial_exposure_reported_brl,
 p.customer_amounts_documented_brl,p.consumer_claim_entries,p.sources[0]?.url,precedentPath(p),raw.updated_at,p.known_limits
 ]);
 const csv='\uFEFF'+cols.map(quote).join(';')+'\r\n'+rows.map(row=>row.map(quote).join(';')).join('\r\n')+'\r\n';
 return new Response(csv,{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="casoaberto-precedentes-judiciais-2026-11-09.csv"','Cache-Control':'public, max-age=3600'}});
};
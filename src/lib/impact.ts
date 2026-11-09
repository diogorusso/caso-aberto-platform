import {cases,reports,metrics,casePath,type Case,type Report} from './cases';
import {brands,brandPath,unitPath,type Brand,type BrandUnit} from './brands';
import evidence from '../data/evidence-index.json';
import raw from '../data/impact-models.json';
export const impactData=raw;
export type CaseModel=(typeof raw.case_models)[keyof typeof raw.case_models];
export const caseImpactPath=(item:Case)=>casePath(item)+'impacto/';
export const brandImpactPath=(brand:Brand)=>brandPath(brand)+'impacto/';
export const unitImpactPath=(brand:Brand,unit:BrandUnit)=>unitPath(brand,unit)+'impacto/';
export const parseDateUtc=(s:string)=>{const [year,month,day]=s.split('-').map(Number);return Date.UTC(year,month-1,day);};
export const daysBetween=(from:string,to:string)=>Math.max(0,Math.round((parseDateUtc(to)-parseDateUtc(from))/86400000));
export const modelForCase=(item:Case):CaseModel|undefined=>(raw.case_models as Record<string,CaseModel>)[item.id];
export const statusClass=(status:string):'resolved'|'unresolved'|'answered'|'replica'|'unknown'=> {
 const x=status.toLocaleLowerCase('pt-BR').trim();
 if(/^resolvid[oa]/.test(x))return 'resolved';
 if(/^n[aã]o resolvid[oa]/.test(x))return 'unresolved';
 if(x.startsWith('respondida')||x.startsWith('respondido'))return 'answered';
 if(x.includes('réplica')||x.includes('replica'))return 'replica';
 return 'unknown';
};
export const statusGroups=[
 {key:'unresolved',label:'Não resolvidas na consulta'},
 {key:'replica',label:'Em réplica'},
 {key:'answered',label:'Respondidas (não necessariamente resolvidas)'},
 {key:'resolved',label:'Resolvidas'},
 {key:'unknown',label:'A confirmar na origem'}
] as const;
export const brandSnapshot=(brand:Brand)=>raw.external_brand_snapshots.find(x=>x.brand_slug===brand.slug);
export const impactNavItems=(opts:{hasSnapshot?:boolean;hasModel?:boolean}={})=>[
  {id:'analisar-impacto',label:'Resumo'},
  {id:'painel-observado',label:'Dados publicados'},
  ...(opts.hasSnapshot?[{id:'impacto-externo',label:'Fonte externa'}]:[]),
  {id:'desfecho-reclamacoes',label:'Desfechos'},
  ...(opts.hasModel?[{id:'simulador-impacto',label:'Cenários'}]:[]),
  {id:'trilha-documental',label:'Fontes'},
  {id:'prestacao-contas',label:'Prestação de contas'},
];
export const companyProfileNavItems=(opts:{hasPrecedent?:boolean;hasDossier?:boolean}={})=>[
  {id:'perfil-empresarial',label:'Perfil'},
  {id:'analisar-impacto',label:'Impacto'},
  {id:'painel-observado',label:'Números'},
  {id:'avaliacao-editorial',label:'Avaliação'},
  {id:'casos-associados',label:'Casos'},
  ...(opts.hasPrecedent?[{id:'precedentes-documentados',label:'Precedentes'}]:[]),
  {id:'identificacao-visual',label:'Identidade'},
  ...(opts.hasDossier?[{id:'observatorio-empresa',label:'Observatório'}]:[]),
  {id:'perfis-cnpj',label:'CNPJs'},
  {id:'ranking-editorial',label:'Ranking'},
  {id:'resposta-institucional',label:'Resposta'},
];

const unitMatch=(report:Report,brand:Brand,unit:BrandUnit)=>{
 const normalized=unit.name.toLocaleLowerCase('pt-BR').replace(brand.name.toLocaleLowerCase('pt-BR'),'').trim();
 const label=(report.unit||'').toLocaleLowerCase('pt-BR').trim();
 return !!normalized&&label===normalized;
};
const safeUrl=(url:unknown)=>typeof url==='string'&&/^https:\/\//.test(url)?url:null;
export function impactForSelection({caseItem,brand,unit}:{caseItem?:Case;brand?:Brand;unit?:BrandUnit}){
 const relatedCases=caseItem?[caseItem]:brand?cases.filter(c=>(unit?unit.case_ids:brand.case_ids).includes(c.id)):[];
 const selected=reports.filter(r=>relatedCases.some(c=>c.id===(r.case_id||'CA-001')) && (!unit||(brand&&unitMatch(r,brand,unit))));
 const sourceURLs=new Set<string>();
 for(const c of relatedCases){
  for(const s of c.fontes){const u=safeUrl(s.url);if(u)sourceURLs.add(u);}
  for(const e of evidence.items.filter(x=>x.case_id===c.id && x.visibility==='publico')){const u=safeUrl(e.source_url);if(u)sourceURLs.add(u);}
 }
 for(const r of selected){const u=safeUrl(r.url||r.source_url);if(u)sourceURLs.add(u);}
 const baseModels=relatedCases.flatMap(c=>{const m=modelForCase(c);return m?[{caseItem:c,model:m}]:[];});
 const paidReported=relatedCases.reduce((sum,c)=>sum+(c.valor_brl||0),0);
 const statuses=Object.fromEntries(statusGroups.map(g=>[g.key,selected.filter(r=>statusClass(r.status)===g.key).length])) as Record<typeof statusGroups[number]['key'],number>;
 const latestStatus=relatedCases.reduce((last,c)=>last>c.status_data?last:c.status_data,'');
 const mostRecent=baseModels[0];
 const holdDays=mostRecent?daysBetween(mostRecent.model.payment_date_reported,mostRecent.model.snapshot_date):null;
 const delayMin=mostRecent?daysBetween(mostRecent.model.original_due_window_end,mostRecent.model.snapshot_date):null;
 const delayMax=mostRecent?daysBetween(mostRecent.model.original_due_window_start,mostRecent.model.snapshot_date):null;
 const confirmedAdditional=baseModels.reduce((total,x)=>total+(x.model.confirmed_added_costs_brl??0),0);
 const anyMissingCost=baseModels.some(x=>x.model.confirmed_added_costs_brl==null);
 const actualPageViews=caseItem?metrics.cases[caseItem.id as keyof typeof metrics.cases]?.pageviews??null:null;
 return {
   relatedCases,reports:selected,sourceCount:sourceURLs.size,sourceURLs:[...sourceURLs],
   indexedReportCount:selected.length, statuses, complaintSources:new Set(selected.map(r=>r.source_name||'Não informado')).size,
   reportedPaymentTotal:paidReported,
   recordedCompanyResponses:relatedCases.reduce((sum,c)=>sum+(metrics.cases[c.id as keyof typeof metrics.cases]?.company_responses_on_record??0),0),
   verifiedSupportTotal:relatedCases.reduce((sum,c)=>sum+(metrics.cases[c.id as keyof typeof metrics.cases]?.verified_support_submissions??0),0),
   evidenceItems:evidence.items.filter(e=>relatedCases.some(c=>c.id===e.case_id)),
   latestStatus, model:mostRecent?.model, modeledCase:mostRecent?.caseItem, holdDays, delayMin, delayMax,
   confirmedAdditionalCosts:anyMissingCost?null:confirmedAdditional, actualPageViews
 };
}

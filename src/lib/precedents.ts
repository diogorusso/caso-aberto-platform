import raw from '../data/precedents.json';
export type Precedent = typeof raw.precedents[number];
export type PrecedentSource = Precedent['sources'][number];
export type TimelineEvent = Precedent['timeline'][number];
export const precedents:Precedent[] = raw.precedents;
export const precedentPath=(p:Pick<Precedent,'slug'>)=>'/precedentes/'+p.slug+'/';
export const linkedPrecedents=(caseId:string)=>{
 const link=raw.case_links.find(x=>x.case_id===caseId);
 return link?link.precedent_ids.map(id=>precedents.find(p=>p.id===id)).filter((p):p is Precedent=>Boolean(p)):[];
};
export const linkageForCase=(id:string)=>raw.case_links.find(x=>x.case_id===id);
export const comparisonPath=(slug:string)=>'/casos/'+slug+'/precedentes/';
export const daysUtc=(from:string,to:string)=>Math.round((Date.parse(to+'T00:00:00.000Z')-Date.parse(from+'T00:00:00.000Z'))/86400000);
export const formatDate=(iso:string)=>iso.split('-').reverse().join('/');
export const brlCompact=(n:number)=>new Intl.NumberFormat('pt-BR',{notation:'compact',compactDisplay:'short',style:'currency',currency:'BRL',maximumFractionDigits:1}).format(n);
export const stageDescription=(stage:string)=>raw.stage_definitions[stage as keyof typeof raw.stage_definitions]||'Desfecho em atualização';
export const precedentDuration=(p:Precedent)=>p.bankruptcy_decree_date?daysUtc(p.start_date,p.bankruptcy_decree_date):p.recovery_acceptance_date?daysUtc(p.start_date,p.recovery_acceptance_date):null;
export const researchMethodology=raw.common_analysis;

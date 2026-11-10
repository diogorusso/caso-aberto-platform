/** Unified case research library.
 * Case-specific source schemas remain intact for existing evidence/metrics routes.
 * One taxonomy, featured case, category pages, and search surface for every case.
 */
import schema from '../data/case-categories.json';
import atlas from '../data/public-case-atlas.json';
import politics from '../data/political-observatory.json';
import platforms from '../data/platform-observatory.json';
import {cases, casePath} from './cases';

export type CaseCategory={
 slug:string;title:string;eyebrow:string;description:string;case_ids:string[];search_terms:string[];
};
export type CaseResearchEntry={
 id:string;slug:string;kind:'caso'|'historia';title:string;company:string;summary:string;
 category:string;categorySlug:string;href:string;status:string;date:string;location:string;
 featured:boolean;searchText:string;sourceCount:number;storyCount:number;
};
export const categories: CaseCategory[]=schema.categories;
const categoryMap=new Map(categories.flatMap(c=>c.case_ids.map(id=>[id,c] as const)));
export const featuredCase=cases.find(item=>item.id===schema.featured_case_id);
export const categoryHref=(category:CaseCategory|string)=>'/casos/categoria/'+(typeof category==='string'?category:category.slug)+'/';
const categoryFor=(id:string)=>{
 const category=categoryMap.get(id);
 if(!category)throw new Error('Case missing category mapping: '+id);
 return category;
};
export const caseStudies: CaseResearchEntry[]=[
 ...cases.map(item=>{
  const category=categoryFor(item.id);
  return {
   id:item.id,slug:item.slug,kind:'caso' as const,title:item.titulo,company:item.empresa_resumo,
   summary:item.resumo,category:category.title,categorySlug:category.slug,href:casePath(item),
   status:item.status,date:item.status_data,location:item.local,
   featured:item.id===schema.featured_case_id,
   searchText:[item.empresa,item.titulo,item.chamada,item.resumo,item.impacto,item.categoria,item.local,item.status,
     ...item.cronologia.map(t=>t.titulo+' '+t.texto),...category.search_terms].filter(Boolean).join(' '),
   sourceCount:item.fontes.length,storyCount:0
  };
 }),
 ...atlas.cases.map(item=>{
  const category=categoryFor(item.id);
  return {
   id:item.id,slug:item.slug,kind:'caso' as const,title:item.headline,company:item.company,
   summary:item.deck,category:category.title,categorySlug:category.slug,
   href:'/casos/arquivo-publico/'+item.slug+'/',status:item.status_label,date:item.reviewed_at,
   location:item.state,featured:false,
   searchText:[item.company,item.headline,item.deck,item.sector,item.state,item.lead,item.status_label,
     ...item.verified,...item.questions,...category.search_terms].join(' '),
   sourceCount:item.sources.length,storyCount:item.story_slugs.length
  };
 }),
 ...politics.cases.map(item=>{
  const category=categoryFor(item.id);
  return {
   id:item.id,slug:item.slug,kind:'caso' as const,title:item.title,company:'Instituições e poder público',
   summary:item.summary,category:category.title,categorySlug:category.slug,
   href:'/observatorio/politica/'+item.slug+'/',status:item.status,date:politics.reviewed_at,
   location:item.scope,featured:false,
   searchText:[item.topic,item.title,item.summary,item.scope,item.opening,item.status,
     ...item.facts.map(fact=>fact.finding),...item.questions,...category.search_terms].join(' '),
   sourceCount:item.source_ids.length,storyCount:0
  };
 }),
 ...[{
  id:'PLAT-2026-CASE',
  slug:'meta-eleicoes-2026-governanca-plataformas',
  kind:'caso' as const,
  title:'Meta e eleições 2026: quem responde pelos anúncios e pela moderação?',
  company:'Meta · Facebook · Instagram',
  summary:'Testes de anúncios, plano da Meta no TSE, dados do NetLab, ação do MPF e resposta pública da plataforma. Cinco registros, uma investigação documental.',
  category:categoryFor('PLAT-2026-CASE').title,
  categorySlug:categoryFor('PLAT-2026-CASE').slug,
  href:'/observatorio/plataformas/',
  status:'Transparência, anúncios e decisões de moderação · 2026',
  date:platforms.reviewed_at,
  location:'Brasil',
  featured:false,
  searchText:[platforms.topic,platforms.framing,...platforms.records.map(record=>[
   record.platform,record.headline,record.finding,record.type,record.source_kind
  ].join(' ')),...categoryFor('PLAT-2026-CASE').search_terms].join(' '),
  sourceCount:platforms.records.length,
  storyCount:0
 }]
];
const caseBySlug=new Map(caseStudies.map(item=>[item.slug,item]));
export const personalStories:CaseResearchEntry[]=atlas.stories.map(person=>{
 const related=person.case_slugs.map(slug=>caseBySlug.get(slug)).filter((value):value is CaseResearchEntry=>Boolean(value));
 const category=related[0]?categoryFor(related[0].id):undefined;
 if(!category)throw new Error('Story missing linked case: '+person.slug);
 return {
  id:person.id,slug:person.slug,kind:'historia',title:person.headline,
  company:related.map(entry=>entry.company).join(' · '),summary:person.deck,
  category:category.title,categorySlug:category.slug,href:'/historias/'+person.slug+'/',
  status:person.source_outcome,date:person.source_published_at,location:person.place,featured:false,
  searchText:[person.display_name,person.headline,person.deck,person.persona,person.category,
    person.place,...person.narrative, ...related.map(e=>e.company), ...category.search_terms].join(' '),
  sourceCount:person.sources.length,storyCount:0
 };
});
export const allResearch=[...caseStudies,...personalStories];
export const caseCountFor=(slug:string)=>caseStudies.filter(item=>item.categorySlug===slug).length;
export const storiesForCategory=(slug:string)=>personalStories.filter(item=>item.categorySlug===slug);
export const entriesForCategory=(slug:string)=>allResearch.filter(item=>item.categorySlug===slug);
export const categoryBySlug=(slug:string)=>categories.find(c=>c.slug===slug);

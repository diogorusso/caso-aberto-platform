/** Evidence ledger: counts published records and distinct URLs, not people or victims. */
import {cases,reports} from './cases';
import atlas from '../data/public-case-atlas.json';
import politics from '../data/political-observatory.json';
import platforms from '../data/platform-observatory.json';
import precedents from '../data/precedents.json';
import categories from '../data/case-categories.json';
import {caseStudies,personalStories} from './case-catalog';
const politicalById=new Map(politics.sources.map(s=>[s.id,s.url]));
const urls=[
 ...cases.flatMap(c=>c.fontes.map(f=>f.url)),
 ...atlas.cases.flatMap(c=>c.sources.map(s=>s.url)),
 ...politics.cases.flatMap(c=>c.source_ids.map(id=>politicalById.get(id))),
 ...platforms.records.map(r=>r.source_url)
].filter((url):url is string=>typeof url==='string'&&/^https:\/\//.test(url));
export const metrics={
 cases:caseStudies.length,
 sourceUrls:new Set(urls).size,
 timelineEvents:cases.reduce((n,c)=>n+c.cronologia.length,0)+atlas.cases.reduce((n,c)=>n+c.timeline.length,0)+politics.cases.reduce((n,c)=>n+c.timeline.length,0)+platforms.records.length,
 publicQuestions:cases.reduce((n,c)=>n+c.pedidos.length+(c.imprensa_perguntas?.length||0),0)+atlas.cases.reduce((n,c)=>n+c.questions.length,0)+politics.cases.reduce((n,c)=>n+c.questions.length,0),
 stories:personalStories.length,
 complaints:reports.length,
 precedents:precedents.precedents.length,
 categories:categories.categories.length,
 reviewedAt:atlas.updated_at,
 sourceGroups:{detailed:cases.length,consumer:atlas.cases.length,civic:politics.cases.length,platform:1},
};
const display=(n:number)=>n.toLocaleString('pt-BR');
export const metricCards=[
 {key:'cases',label:'Casos documentados',value:display(metrics.cases),note:'Empresas, serviços e instituições',href:'/casos/',cta:'Pesquisar'},
 {key:'sourceUrls',label:'Fontes rastreáveis',value:display(metrics.sourceUrls),note:'Links HTTPS distintos citados em casos',href:'/instituto/dados/pesquisa.json',cta:'Auditar'},
 {key:'timelineEvents',label:'Marcos documentados',value:display(metrics.timelineEvents),note:'Eventos datados nas cronologias',href:'/casos/',cta:'Conferir'},
 {key:'publicQuestions',label:'Perguntas e exigências',value:display(metrics.publicQuestions),note:'Cobranças presentes nos registros',href:'/casos/',cta:'Investigar'},
 {key:'stories',label:'Histórias de pessoas',value:display(metrics.stories),note:'Relatos conectados a investigações',href:'/historias/',cta:'Ler'},
 {key:'complaints',label:'Reclamações indexadas',value:display(metrics.complaints),note:'Registros do dossiê Florense',href:'/casos/florense-ipanema-rj-atraso-moveis-planejados/reclamacoes-publicas/',cta:'Ver registros'},
 {key:'precedents',label:'Precedentes judiciais',value:display(metrics.precedents),note:'Processos históricos catalogados',href:'/precedentes/',cta:'Comparar'},
 {key:'categories',label:'Categorias de pesquisa',value:display(metrics.categories),note:'Áreas organizadas e pesquisáveis',href:'/casos/',cta:'Explorar'}
] as const;
export const caseLedger=caseStudies.map(c=>({id:c.id,title:c.title,company:c.company,category:c.category,href:c.href,reviewDate:c.date,sources:c.sourceCount,featured:c.featured,stories:c.storyCount}));

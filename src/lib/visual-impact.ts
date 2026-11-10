import stories from '../data/impact-stories.json';
import atlas from '../data/public-case-atlas.json';
import politics from '../data/political-observatory.json';
import platforms from '../data/platform-observatory.json';
import {cases,casePath,brl,reportsFor} from './cases';
import {impactForSelection,statusGroups} from './impact';

export type PlotPoint={date:string;title:string;url?:string};
export type StoryMetric={label:string;value:string;note:string;href?:string};
export type StoryGraph={
 id:string;title:string;status:string;href:string;date:string;
 audience:string;exposure:string;headline:string;worst_case:string;threshold:string;resolution:string;action:string;
 metrics:StoryMetric[];points:PlotPoint[];bars?:{label:string;value:number}[];
 graphTitle:string;graphDescription:string;graphSource?:string;
 sources:{title:string;url:string}[];
};
const count=(n:number)=>n.toLocaleString('pt-BR');
const noteById=new Map(stories.cases.map(item=>[item.id,item]));
const src=(title:string,url:string)=>({title,url});
export const printStoryPath=(slug:string)=>'/casos/imprimir/'+slug+'/';
export const storyIds=stories.cases.map(item=>item.id);

export function caseStory(id:string):StoryGraph{
 const narrative=noteById.get(id);
 if(!narrative)throw new Error('Missing impact narrative for '+id);
 let title='',status='',href='',date='',metrics:StoryMetric[]=[],points:PlotPoint[]=[],bars:StoryGraph['bars'];
 let graphTitle='Como o caso chegou até aqui';
 let graphDescription='Acúmulo de marcos datados catalogados neste dossiê. Não é medição de vítimas, prejuízos ou ocorrências por dia.';
 let graphSource: string|undefined;
 let sources:StoryGraph['sources']=[];
 const owned=cases.find(item=>item.id===id);
 if(owned){
  title=owned.titulo;status=owned.status;href=casePath(owned);date=owned.status_data;
  const record=impactForSelection({caseItem:owned});
  metrics=[
   {label:'Valor informado pelo consumidor',value:owned.valor_brl?brl(owned.valor_brl):'Não informado',note:'Pagamento atribuído ao contrato; consulte o dossiê.',href:href+'evidencias/'},
   {label:'Tempo desde pagamento',value:record.holdDays==null?'Sem dado':record.holdDays+' dias',note:'Até '+(record.model?.snapshot_date||date)+'; período encerrado nessa revisão.'},
   {label:'Registros externos catalogados',value:count(record.indexedReportCount),note:'Amostra com desfechos distintos.',href:href+'reclamacoes-publicas/'},
   {label:'Referências documentais',value:count(record.sourceCount),note:'URLs distintas no arquivo, não pessoas únicas.',href:href+'evidencias/'}
  ];
  points=owned.cronologia.map(m=>({date:m.data,title:m.titulo,url:href+'linha-do-tempo/'}));
  bars=statusGroups.map(g=>({label:g.label,value:record.statuses[g.key]})).filter(x=>x.value>0);
  if(bars.length===0)bars=undefined;
  graphSource=href+'linha-do-tempo/';
  sources=owned.fontes.filter(f=>/^https:\/\//.test(f.url)).map(f=>src(f.titulo,f.url));
 }else{
  const external=atlas.cases.find(item=>item.id===id);
  if(external){
   title=external.headline;status=external.status_label;date=external.reviewed_at;href='/casos/arquivo-publico/'+external.slug+'/';
   metrics=[
    {label:external.key_fact.label,value:external.key_fact.metric,note:external.key_fact.period,href:external.key_fact.source_url},
    {label:'Fontes identificadas',value:count(external.sources.length),note:'Links de publicações e registros, não vítimas.'},
    {label:'Marcos documentados',value:count(external.timeline.length),note:'Eventos individualizados e datados.'},
    {label:'Perguntas abertas',value:count(external.questions.length),note:'Exigem documentos e respostas verificáveis.'}
   ];
   points=external.timeline.map(e=>({date:e.date,title:e.label,url:e.source_url}));
   sources=external.sources.map(s=>src(s.name,s.url));
   graphSource=external.timeline[0]?.source_url;
  }else{
   const political=politics.cases.find(item=>item.id===id);
   if(political){
    title=political.title;status=political.status;date=political.reviewed_at;href='/observatorio/politica/'+political.slug+'/';
    metrics=[
     {label:'Fontes no registro',value:count(political.source_ids.length),note:'Referências selecionadas para esta investigação.'},
     {label:'Marcos documentados',value:count(political.timeline.length),note:'Atos e reportagens registrados com data.'},
     {label:'Entidades citadas',value:count(political.entity_ids.length),note:'Papéis documentados. A citação não é acusação.'},
     {label:'Perguntas por esclarecer',value:count(political.questions.length),note:'Respostas institucionais ainda a conferir.'}
    ];
    const getSource=(key:string)=>politics.sources.find(s=>s.id===key)?.url;
    points=political.timeline.map(e=>({date:e.date,title:e.title,url:getSource(e.source)}));
    sources=political.source_ids.map(key=>politics.sources.find(s=>s.id===key)).filter((s):s is (typeof politics.sources)[number]=>Boolean(s)).map(s=>src(s.title,s.url));
    graphSource=getSource(political.timeline[0]?.source||'');
    if(id==='POL-002'){
     const groups=new Map<string,number>();
     for(const p of politics.sponsorships)groups.set(p.brand,(groups.get(p.brand)||0)+1);
     bars=[...groups].map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value);
     graphTitle='Quem aparecia como patrocinador máster?';
     graphDescription='Clubes por marca conforme fotografia jornalística de 18/09/2026. Contagem histórica de 13 clubes, anterior à MP de 25/09. Não representa contratos vigentes hoje.';
     graphSource=getSource('clubes-mapa');
    }
   }else if(id==='PLAT-2026-CASE'){
    title='Meta e eleições 2026: anúncios e moderação';status='Registros documentais sob acompanhamento';date=platforms.reviewed_at;href='/observatorio/plataformas/';
    metrics=[
     {label:'Registros de pesquisa',value:count(platforms.records.length),note:'Episódios documentais, não anúncios veiculados.'},
     {label:'Fontes identificadas',value:count(new Set(platforms.records.map(r=>r.source_url)).size),note:'URLs únicas no observatório.'},
     {label:'Etapas datadas',value:count(platforms.records.length),note:'Dados publicados no arquivo.'}
    ];
    points=platforms.records.map(r=>({date:r.date,title:r.headline,url:r.source_url}));
    sources=platforms.records.map(r=>src(r.source_label,r.source_url));
   }else throw new Error('Impact record without linked case: '+id);
  }
 }
 return {...narrative,title,status,href,date,metrics,points,bars,graphTitle,graphDescription,graphSource,sources};
}

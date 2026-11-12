import {useEffect,useMemo,useState} from 'react';
import {Search,ArrowUpRight,RotateCcw,FolderOpen,BookOpen,Scale} from 'lucide-react';
import type {CaseCategory,CaseResearchEntry} from '../../lib/case-catalog';
import {visibilityInputFromEntry} from '../../lib/case-visibility';
import {cn} from '../../lib/utils';
import CaseVisibilityCounter from './CaseVisibilityCounter';
import CaseCardShareActions from './CaseCardShareActions';

interface Props {
 entries:CaseResearchEntry[];
 categories:CaseCategory[];
 lockedCategory?:string;
}
type Kind='todos'|'caso'|'historia';
type Sort='destaques'|'recentes'|'alfabetica';
const simplify=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
const dateLabel=(date:string)=>date.split('-').reverse().join('/');
const cap=(n:number,singular:string,plural:string)=>n+' '+(n===1?singular:plural);
const choiceClass='inline-flex min-h-10 shrink-0 items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';
const safeCategory=(choice:string,categories:CaseCategory[],locked?:string)=>locked||((choice==='todos'||categories.some(c=>c.slug===choice))?choice:'todos');
const resultLabel=(entry:CaseResearchEntry)=>entry.kind==='caso'?'CASO DOCUMENTADO':'HISTÓRIA DO CASO';

export default function CaseResearchExplorer({entries,categories,lockedCategory}:Props){
 const [query,setQuery]=useState('');
 const [category,setCategory]=useState(lockedCategory||'todos');
 const [kind,setKind]=useState<Kind>('todos');
 const [order,setOrder]=useState<Sort>('destaques');
 const [ready,setReady]=useState(false);

 useEffect(()=>{
  const params=new URLSearchParams(window.location.search);
  setQuery((params.get('busca')||'').slice(0,160));
  setCategory(safeCategory(params.get('categoria')||'todos',categories,lockedCategory));
  const nextKind=params.get('tipo');
  setKind(nextKind==='caso'||nextKind==='historia'?nextKind:'todos');
  const sort=params.get('ordem');
  setOrder(sort==='recentes'||sort==='alfabetica'?sort:'destaques');
  setReady(true);
 },[categories,lockedCategory]);

 useEffect(()=>{
  if(!ready)return;
  const url=new URL(window.location.href);
  for(const key of ['busca','categoria','tipo','ordem'])url.searchParams.delete(key);
  if(query)url.searchParams.set('busca',query);
  if(!lockedCategory&&category!=='todos')url.searchParams.set('categoria',category);
  if(kind!=='todos')url.searchParams.set('tipo',kind);
  if(order!=='destaques')url.searchParams.set('ordem',order);
  window.history.replaceState(window.history.state,'',url.toString());
 },[query,category,kind,order,lockedCategory,ready]);

 const filtered=useMemo(()=>{
  const needle=simplify(query);
  return entries.filter(entry=>{
   if((lockedCategory||category)!=='todos'&&entry.categorySlug!==(lockedCategory||category))return false;
   if(kind!=='todos'&&entry.kind!==kind)return false;
   if(!needle)return true;
   return simplify([entry.title,entry.company,entry.summary,entry.location,entry.category,entry.status,entry.searchText].join(' ')).includes(needle);
  }).sort((a,b)=>{
   if(order==='alfabetica')return a.company.localeCompare(b.company,'pt-BR')||a.title.localeCompare(b.title,'pt-BR');
   if(order==='recentes')return b.date.localeCompare(a.date)||a.title.localeCompare(b.title,'pt-BR');
   if(a.featured!==b.featured)return a.featured?-1:1;
   if(a.kind!==b.kind)return a.kind==='caso'?-1:1;
   return b.date.localeCompare(a.date)||a.title.localeCompare(b.title,'pt-BR');
  });
 },[entries,category,lockedCategory,kind,order,query]);

 const casesTotal=entries.filter(entry=>entry.kind==='caso').length;
 const storiesTotal=entries.filter(entry=>entry.kind==='historia').length;
 const active=Boolean(query)||kind!=='todos'||(!lockedCategory&&category!=='todos')||order!=='destaques';
 function clear(){
  setQuery('');setCategory(lockedCategory||'todos');setKind('todos');setOrder('destaques');
 }
 return <section aria-labelledby="case-search-heading" className="space-y-7">
  <div className="rounded-xl border border-border bg-card p-5 shadow-sm md:p-7">
   <div className="flex flex-wrap items-end justify-between gap-4">
    <div className="space-y-1">
     <span className="text-xs font-bold uppercase tracking-[.14em] text-brand-strong">PESQUISE NOSSO ARQUIVO</span>
     <h2 id="case-search-heading" className="m-0 text-2xl md:text-3xl">Todos os casos. Uma busca.</h2>
     <p className="m-0 text-sm text-muted-foreground">{cap(casesTotal,'caso documentado','casos documentados')} · {cap(storiesTotal,'história','histórias')} · fontes, perguntas e cronologia</p>
    </div>
    {active&&<button type="button" onClick={clear} className="inline-flex items-center gap-2 text-sm font-semibold text-link hover:underline"><RotateCcw size={15} aria-hidden="true"/>Limpar filtros</button>}
   </div>
   <div className="relative mt-6">
    <label htmlFor="case-search-input" className="mb-2 block text-sm font-semibold">Busque empresa, cidade, produto, problema ou palavra-chave</label>
    <Search className="pointer-events-none absolute left-4 top-[3.15rem] size-5 text-muted-foreground" aria-hidden="true"/>
    <input id="case-search-input" type="search" value={query} onChange={e=>setQuery(e.currentTarget.value.slice(0,160))}
     autoComplete="off" maxLength={160} placeholder="Ex.: Florense, móveis, Procon, apagão, Rio, Hurb…"
     className="h-14 w-full rounded-md border border-border bg-background pr-4 pl-12 text-base text-foreground outline-none transition-colors focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30"/>
   </div>
   {!lockedCategory&&<nav aria-label="Filtrar casos por categoria" className="mt-6 space-y-3">
    <span className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">Categoria</span>
    <div className="flex flex-wrap gap-2">
     {[{slug:'todos',title:'Todas as categorias'},...categories].map(c=><button key={c.slug} type="button"
      aria-pressed={category===c.slug} onClick={()=>setCategory(c.slug)}
      className={choiceClass+' '+(category===c.slug?'border-primary bg-primary text-primary-foreground':'border-border bg-background text-foreground hover:border-brand/50 hover:bg-muted')}>{c.title}</button>)}
    </div>
   </nav>}
   <div className="mt-6 grid gap-4 border-t border-border pt-5 md:grid-cols-[1fr_auto] md:items-end">
    {casesTotal>0&&storiesTotal>0&&<fieldset className="m-0 min-w-0 border-none p-0">
     <legend className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Conteúdo</legend>
     <div className="flex flex-wrap gap-2">
      {([['todos','Tudo'],['caso','Casos'],['historia','Histórias']] as const).map(([value,label])=><button key={value} type="button"
       aria-pressed={kind===value} onClick={()=>setKind(value)} className={choiceClass+' '+(kind===value?'border-brand bg-brand text-white':'border-border bg-background text-foreground hover:bg-muted')}>{label}</button>)}
     </div>
    </fieldset>}
    <label className="grid gap-2 text-sm font-semibold" htmlFor="case-sort">
     Ordenar por
     <select id="case-sort" value={order} onChange={event=>setOrder(event.currentTarget.value as Sort)}
      className="min-h-11 rounded-md border border-border bg-background px-4 py-2 text-foreground focus-visible:ring-2 focus-visible:ring-brand">
      <option value="destaques">Destaques primeiro</option><option value="recentes">Atualização mais recente</option><option value="alfabetica">Nome da empresa</option>
     </select>
    </label>
   </div>
  </div>
  <div className="flex flex-wrap items-center justify-between gap-3">
   <p className="m-0 text-sm font-semibold" aria-live="polite">{cap(filtered.length,'resultado encontrado','resultados encontrados')}</p>
   <p className="m-0 text-xs text-muted-foreground">Escolha um caso para ver provas, fontes e cobrança.</p>
  </div>
  <div className="grid gap-4 md:grid-cols-2" aria-label="Resultados de casos documentados">
   {filtered.map(entry=>(
    <article
     key={entry.id}
     className={cn(
      'group flex flex-col gap-4 rounded-lg border bg-card p-5 text-inherit transition-[border-color,box-shadow,transform] duration-200',
      'hover:-translate-y-0.5 hover:border-brand/60 hover:shadow-md',
      'active:translate-y-0 md:p-6',
      entry.featured ? 'border-brand ring-1 ring-brand/30' : 'border-border',
     )}
    >
     <a
      href={entry.href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-w-0 flex-1 flex-col gap-4 text-inherit no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      aria-label={(entry.kind==='caso'?'Abrir caso: ':'Ler história: ')+entry.title}
     >
      {entry.image ? (
       <div className="relative overflow-hidden rounded-md border border-border">
        <img
         src={entry.image}
         alt=""
         width={1200}
         height={630}
         loading="lazy"
         decoding="async"
         className="aspect-[1200/630] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        {entry.logo&&(
         <span className="absolute bottom-3 left-3 inline-flex h-11 max-w-[9.5rem] items-center justify-center border border-border bg-white px-2.5 shadow-sm">
          <img src={entry.logo} alt="" width={120} height={36} loading="lazy" decoding="async" className="max-h-7 max-w-[8.5rem] object-contain"/>
         </span>
        )}
       </div>
      ) : (
       <div className="flex aspect-[1200/630] flex-col justify-between rounded-md border border-border bg-primary p-5 text-primary-foreground" aria-label="Investigação documental sem retrato de pessoas envolvidas">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.15em] text-[#ff917e]"><Scale size={17} aria-hidden="true"/> CASOABERTO · DOCUMENTAÇÃO</div>
        <div className="space-y-2">
         <p className="m-0 text-xl font-extrabold leading-snug md:text-2xl">Quem responde pelos fatos?</p>
         <p className="m-0 max-w-md text-sm leading-relaxed text-white/70">Cronologia. Contraditório. Documentos. Sem retratos de familiares ou conteúdo privado.</p>
        </div>
       </div>
      )}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-bold uppercase tracking-wider">
       {entry.featured&&<span className="rounded bg-brand-strong px-2.5 py-1 text-white">CASO EM DESTAQUE</span>}
       <span className="text-brand-strong">{resultLabel(entry)}</span>
       <span className="text-muted-foreground">· {entry.category}</span>
      </div>
      <div className="space-y-2">
       <p className="m-0 text-sm font-semibold text-muted-foreground">{entry.company}</p>
       <div className="space-y-3 md:space-y-4">
        <h3 className="m-0 text-xl leading-snug text-foreground transition-colors group-hover:text-brand-strong md:text-2xl">{entry.title}</h3>
        <CaseVisibilityCounter input={visibilityInputFromEntry(entry)} />
       </div>
       <p className="m-0 text-sm leading-relaxed text-muted-foreground">{entry.summary}</p>
      </div>
      <p className="m-0 text-xs text-muted-foreground">{entry.location} · {dateLabel(entry.date)}</p>
     </a>
     <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
      <div className="flex items-center justify-between gap-3">
       <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
        {entry.kind==='caso'?<FolderOpen size={15} aria-hidden="true"/>:<BookOpen size={15} aria-hidden="true"/>}
        {entry.kind==='caso'?cap(entry.sourceCount,'fonte','fontes'):cap(entry.sourceCount,'referência','referências')}
        {entry.storyCount>0?' · '+cap(entry.storyCount,'história','histórias'):''}
       </span>
       <a
        href={entry.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm font-bold text-brand-strong no-underline hover:underline"
       >
        {entry.kind==='caso'?'Abrir caso':'Ler história'}
        <ArrowUpRight size={16} aria-hidden="true"/>
       </a>
      </div>
      <CaseCardShareActions
       caseId={entry.id}
       title={entry.title}
       href={entry.href}
       summary={entry.summary}
       company={entry.company}
      />
     </div>
    </article>
   ))}
  </div>
  {filtered.length===0&&<div className="rounded-lg border border-border bg-muted p-8 text-center">
   <Search className="mx-auto mb-3 size-7 text-brand-strong" aria-hidden="true"/>
   <h3 className="mt-0 text-xl">Nenhum caso encontrado para esses filtros.</h3>
   <p className="text-sm text-muted-foreground">Experimente a empresa, o serviço, a cidade ou o tipo de problema.</p>
   <button type="button" onClick={clear} className="text-link font-semibold underline">Ver todo o arquivo</button>
  </div>}
 </section>;
}

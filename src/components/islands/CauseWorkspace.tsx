import { useState, type ChangeEvent, type SyntheticEvent } from 'react';
import CauseTaskViews from './CauseTaskViews';
import CauseAiBrief from './CauseAiBrief';
import {
  blankWorkspace, createCause, today, uniqueId, updateCause, validateWorkspace,
  type Cause, type CauseDomain, type CauseStatus, type EvidenceStatus,
  type RequestStatus, type Workspace
} from '@/lib/civic-workspace';

const domainOptions: {value: CauseDomain; label: string}[] = [
  {value:'consumo',label:'Consumo'}, {value:'comunidade',label:'Comunidade'},
  {value:'servico-publico',label:'Serviço público'}, {value:'plataformas',label:'Plataformas digitais'},
  {value:'outro',label:'Outro'}
];
const statusOptions: {value: CauseStatus; label:string}[] = [
  {value:'em-preparacao',label:'Em preparação'}, {value:'em-acompanhamento',label:'Em acompanhamento'},
  {value:'respondida',label:'Respondida'}, {value:'encerrada',label:'Encerrada'}
];
const evidenceOptions: {value: EvidenceStatus; label:string}[] = [
  {value:'relato',label:'Relato atribuído'},{value:'documento',label:'Documento original'},
  {value:'resposta',label:'Resposta da parte'}, {value:'decisao',label:'Decisão oficial'},
  {value:'analise',label:'Análise com método'}
];
const requestStatuses: {value: RequestStatus; label:string}[] = [
  {value:'rascunho',label:'Rascunho'}, {value:'enviada-externamente',label:'Enviada fora do site'},
  {value:'respondida',label:'Respondida'}, {value:'encerrada',label:'Encerrada'}
];
const formControl = 'block w-full border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-strong';
const button = 'inline-flex cursor-pointer items-center justify-center border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-forest focus-visible:outline-2 focus-visible:outline-offset-2';
const secondary = 'inline-flex cursor-pointer items-center justify-center border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2';
const getForm = (form: HTMLFormElement) => new FormData(form);
const formString = (fd: FormData, name: string) => String(fd.get(name) || '').trim();
const domainName = (d: CauseDomain) => domainOptions.find(x=>x.value===d)?.label ?? d;

export default function CauseWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace>(()=>blankWorkspace());
  const [selected, setSelected] = useState<string>('');
  const [view, setView] = useState<'painel'|'fontes'|'tarefas'|'pedidos'|'diario'|'ia'>('painel');
  const [feedback, setFeedback] = useState<string>('Nenhuma informação foi enviada ao CasoAberto.');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [createOpen, setCreateOpen] = useState(true);
  const cause = workspace.causes.find(x=>x.id===selected);
  const doCause = (change: (cause: Cause)=>Cause) => {
    if(!cause) return;
    setWorkspace(old => updateCause(old, cause.id, change));
    setFeedback('Alteração feita apenas nesta sessão. Exporte o arquivo ou salve explicitamente.');
  };
  const addCause = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const f = event.currentTarget, fd = getForm(f);
    const title = formString(fd,'title'), objective = formString(fd,'objective');
    if(title.length < 5 || objective.length < 12){ setFeedback('Descreva o problema e um objetivo verificável.'); return; }
    const item = createCause(title, formString(fd,'domain') as CauseDomain, objective, formString(fd,'jurisdiction'));
    setWorkspace(old=>({...old,causes:[...old.causes,item]}));
    setSelected(item.id); setView('painel'); setCreateOpen(false); f.reset();
    setFeedback('Causa criada apenas neste navegador. Ainda não foi publicada.');
  };
  const exportJSON = () => {
    const payload = JSON.stringify(validateWorkspace(workspace),null,2);
    const objectUrl = URL.createObjectURL(new Blob([payload],{type:'application/json'}));
    const link = document.createElement('a'); link.href=objectUrl; link.download='casoaberto-caderno-'+today()+'.json';
    link.click(); window.setTimeout(()=>URL.revokeObjectURL(objectUrl),1000);
    setFeedback('Arquivo JSON preparado. Guarde-o em local privado: ele contém suas anotações.');
  };
  const importJSON = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if(file.size>512000) throw new Error('Arquivo acima do limite de 500 KB.');
      const parsed = validateWorkspace(JSON.parse(await file.text()));
      if(workspace.causes.length && !window.confirm('Substituir todo o caderno desta sessão pelo arquivo selecionado?')) return;
      setWorkspace(parsed); setSelected(parsed.causes[0]?.id ?? '');setView('painel');
      setFeedback('Arquivo importado somente nesta sessão. Verifique fontes e dados antes de compartilhar.');
    } catch(e) {setFeedback(e instanceof Error?e.message:'Erro ao importar arquivo.');}
    finally {event.target.value='';}
  };
  const saveLocal = () => {
    try {
      window.localStorage.setItem('casoaberto-workspace-v1',JSON.stringify(validateWorkspace(workspace)));
      setFeedback('Cópia salva neste dispositivo. Pessoas com acesso ao navegador podem ler os dados.');
    } catch{setFeedback('Não foi possível salvar neste navegador. Exporte o JSON.');}
  };
  const loadLocal = () => {
    try {
      const value = window.localStorage.getItem('casoaberto-workspace-v1');
      if(!value){setFeedback('Nenhuma cópia local encontrada.');return;}
      if(workspace.causes.length && !window.confirm('Substituir as anotações desta sessão pela cópia local?'))return;
      const restored=validateWorkspace(JSON.parse(value));setWorkspace(restored);setSelected(restored.causes[0]?.id??'');setView('painel');
      setFeedback('Cópia local aberta. Nenhuma informação foi enviada.');
    } catch{setFeedback('A cópia salva é inválida ou incompatível.');}
  };
  const clearLocal = () => {
    if(!window.confirm('Apagar a cópia salva neste dispositivo? O arquivo exportado, se houver, não será afetado.'))return;
    window.localStorage.removeItem('casoaberto-workspace-v1');setFeedback('Cópia local apagada. Dados desta sessão permanecem até fechar a página.');
  };
  return <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
    <aside className="space-y-5 border border-border bg-card p-5" aria-label="Controles do caderno">
      <div className="space-y-2"><p className="m-0 text-xs font-bold uppercase tracking-wider text-brand-strong">SEU CADERNO</p><strong className="block text-lg">{workspace.causes.length} {workspace.causes.length===1?'causa':'causas'}</strong><p className="m-0 text-xs text-muted-foreground">Privado nesta sessão. Sem login, envio ou sincronização.</p></div>
      <div className="space-y-2"><button type="button" className={button+' w-full'} onClick={()=>{setCreateOpen(true);setSelected('')}}>+ Nova causa</button>
        {workspace.causes.map(c=><button type="button" key={c.id} aria-current={c.id===selected?'page':undefined} className={(selected===c.id?'border-brand-strong bg-brand-soft':'border-border bg-background')+' block w-full cursor-pointer border p-3 text-left text-sm'} onClick={()=>{setSelected(c.id);setCreateOpen(false);setView('painel');setConfirmDelete(false)}}><strong className="block">{c.title}</strong><span className="block text-xs text-muted-foreground">{domainName(c.domain)} · {c.status.replaceAll('-',' ')}</span></button>)}
      </div>
      <div className="space-y-2 border-t border-border pt-4"><p className="m-0 text-xs font-bold">Controle do arquivo</p>
        <button type="button" className={secondary+' w-full'} onClick={exportJSON}>Exportar JSON</button>
        <label className={secondary+' w-full cursor-pointer'}>Importar JSON<input type="file" accept=".json,application/json" onChange={importJSON} className="sr-only" /></label>
        <button type="button" className={secondary+' w-full'} onClick={saveLocal}>Salvar neste dispositivo</button>
        <button type="button" className={secondary+' w-full'} onClick={loadLocal}>Abrir cópia local</button>
        <button type="button" className="cursor-pointer text-xs font-semibold text-brand-strong underline" onClick={clearLocal}>Apagar cópia local</button>
        <p className="m-0 text-xs text-muted-foreground">Salvar neste dispositivo é opcional e não usa criptografia. Não use em computadores compartilhados nem registre segredos ou dados de terceiros.</p>
      </div>
    </aside>
    <div className="min-w-0 space-y-5">
      <div role="status" aria-live="polite" className="border-l-4 border-brand bg-muted px-4 py-3 text-sm">{feedback}</div>
      {createOpen && <section className="border border-border bg-card p-6" aria-labelledby="nova-causa">
        <h2 id="nova-causa" className="mt-0 text-2xl">Comece pelos fatos</h2>
        <p className="text-sm text-muted-foreground">Trabalhe com perguntas verificáveis. Não registre CPF, endereço residencial, nomes de testemunhas vulneráveis, segredos ou documentos privados neste caderno de demonstração.</p>
        <form className="grid gap-4" onSubmit={addCause}>
          <label className="text-sm font-semibold">Título da causa<input className={formControl} name="title" required maxLength={160} minLength={5} placeholder="Ex.: Falta recorrente de água no bairro" /></label>
          <label className="text-sm font-semibold">Escopo<select className={formControl} name="domain">{domainOptions.map(d=><option key={d.value} value={d.value}>{d.label}</option>)}</select></label>
          <label className="text-sm font-semibold">Cidade ou jurisdição (opcional)<input className={formControl} name="jurisdiction" maxLength={120} placeholder="Ex.: RJ / âmbito nacional" /></label>
          <label className="text-sm font-semibold">Qual resposta concreta você quer obter?<textarea className={formControl} name="objective" required minLength={12} maxLength={1600} rows={4} placeholder="Descreva o resultado verificável, sem especular sobre intenções." /></label>
          <button type="submit" className={button+' justify-self-start'}>Criar caderno da causa</button>
        </form>
      </section>}
      {cause && !createOpen && <>
        <header className="space-y-3 border-b border-border pb-5"><p className="m-0 text-xs font-bold uppercase tracking-wider text-brand-strong">{domainName(cause.domain)} · Criada em {cause.created_at}</p><h2 className="m-0 text-3xl">{cause.title}</h2><p className="max-w-3xl">{cause.objective}</p><label className="block max-w-xs text-sm font-semibold">Andamento <select className={formControl} value={cause.status} onChange={e=>doCause(c=>({...c,status:e.target.value as CauseStatus}))}>{statusOptions.map(s=><option value={s.value} key={s.value}>{s.label}</option>)}</select></label></header>
        <nav aria-label="Seções do caderno" className="flex flex-wrap gap-2">{([{id:'painel',title:'Painel'},{id:'fontes',title:'Evidências'},{id:'tarefas',title:'Tarefas'},{id:'pedidos',title:'Pedidos'},{id:'diario',title:'Diário'},{id:'ia',title:'Brief para IA'}] as const).map(t=><button type="button" key={t.id} aria-current={view===t.id?'page':undefined} className={view===t.id?button:secondary} onClick={()=>setView(t.id)}>{t.title}</button>)}</nav>
        {view==='painel' && <section className="space-y-5"><h3>Visão da causa</h3><dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[['Evidências',cause.evidence.length],['Tarefas abertas',cause.tasks.filter(t=>!t.completed).length],['Pedidos',cause.requests.length],['Atualizações',cause.updates.length]].map(([name,n])=><div key={name} className="border border-border bg-card p-4"><dt className="text-xs text-muted-foreground">{name}</dt><dd className="m-0 text-3xl font-bold">{n}</dd></div>)}</dl><p className="text-sm text-muted-foreground">Não há contagem de apoiadores ou impacto estimado: este caderno não coleta assinaturas nem mede alcance.</p>
          <div className="space-y-2 border-t border-border pt-4"><h3>Próximas ações</h3>{cause.tasks.filter(t=>!t.completed).slice(0,6).map(t=><p key={t.id} className="border-l-2 border-brand px-3">{t.title} {t.deadline&&<span className="text-muted-foreground">· até {t.deadline}</span>}</p>)}{!cause.tasks.length&&<p className="text-muted-foreground">Crie uma tarefa e atribua um prazo verificável.</p>}</div>
          {!confirmDelete?<button type="button" onClick={()=>setConfirmDelete(true)} className="cursor-pointer text-sm text-brand-strong underline">Excluir esta causa da sessão</button>:<div className="space-x-3"><button type="button" className={button} onClick={()=>{setWorkspace(w=>({...w,causes:w.causes.filter(c=>c.id!==cause.id)}));setSelected('');setCreateOpen(true);setConfirmDelete(false);setFeedback('Causa excluída apenas da sessão. Não altera a cópia salva.')}}>Confirmar exclusão</button><button type="button" className={secondary} onClick={()=>setConfirmDelete(false)}>Cancelar</button></div>}
        </section>}
        {view==='fontes' && <section className="space-y-6"><h3>Arquivo de evidências</h3><p className="text-sm text-muted-foreground">Separe relato, documento, decisão e resposta. A inclusão de uma URL não certifica a veracidade da fonte nem envia o material.</p>
          <form className="grid gap-3 border border-border bg-card p-5" onSubmit={e=>{e.preventDefault();const f=e.currentTarget,v=getForm(f);const sourceUrl=formString(v,'url');try{const u=new URL(sourceUrl);if(!['https:','http:'].includes(u.protocol))throw Error('http(s)');}catch{setFeedback('URL inválida. Informe endereço http(s).');return;}doCause(c=>({...c,evidence:[...c.evidence,{id:uniqueId(),title:formString(v,'title'),url:sourceUrl,date:formString(v,'date'),kind:formString(v,'kind') as EvidenceStatus,summary:formString(v,'summary'),limitations:formString(v,'limitations'),created_at:today()}]}));f.reset();}}>
            <label className="text-sm font-semibold">Identificação da evidência<input className={formControl} name="title" maxLength={200} required placeholder="Documento, reportagem, protocolo..." /></label>
            <label className="text-sm font-semibold">Link para a fonte original<input className={formControl} name="url" type="url" maxLength={2048} required placeholder="https://" /></label>
            <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold">Tipo<select className={formControl} name="kind">{evidenceOptions.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label><label className="text-sm font-semibold">Data<input className={formControl} name="date" type="date" /></label></div>
            <label className="text-sm font-semibold">O que esta fonte demonstra?<textarea className={formControl} name="summary" maxLength={1500} rows={3} /></label>
            <label className="text-sm font-semibold">O que ela não demonstra?<textarea className={formControl} name="limitations" maxLength={1200} rows={2} /></label>
            <button className={button+' justify-self-start'} type="submit">Adicionar evidência</button>
          </form>
          <ul className="m-0 list-none space-y-3 p-0">{cause.evidence.map(ev=><li key={ev.id} className="space-y-2 border border-border p-4"><div className="flex flex-wrap items-start justify-between gap-2"><strong>{ev.title}</strong><button type="button" className="cursor-pointer text-xs text-brand-strong underline" onClick={()=>doCause(c=>({...c,evidence:c.evidence.filter(x=>x.id!==ev.id),requests:c.requests.map(r=>({...r,evidence_ids:r.evidence_ids.filter(x=>x!==ev.id)}))}))}>Remover</button></div><p className="m-0 text-xs text-muted-foreground">{ev.kind} · {ev.date||'Data não informada'}</p><a className="block break-all text-sm text-link" href={ev.url} target="_blank" rel="noopener noreferrer">{ev.url}</a>{ev.summary&&<p>{ev.summary}</p>}{ev.limitations&&<p className="text-sm text-muted-foreground">Limite: {ev.limitations}</p>}</li>)}</ul>
        </section>}
        {view==='tarefas' && <section className="space-y-5"><h3>Tarefas e prazos</h3><form className="grid gap-3 border border-border bg-card p-5 sm:grid-cols-[1fr_11rem_auto]" onSubmit={e=>{e.preventDefault();const f=e.currentTarget,v=getForm(f);doCause(c=>({...c,tasks:[...c.tasks,{id:uniqueId(),title:formString(v,'title'),deadline:formString(v,'deadline'),completed:false,created_at:today()}]}));f.reset();}}><label className="text-sm font-semibold">Tarefa<input name="title" className={formControl} maxLength={200} required placeholder="Confirmar informação com o órgão" /></label><label className="text-sm font-semibold">Prazo<input name="deadline" type="date" className={formControl}/></label><button type="submit" className={button+' self-end'}>Adicionar</button></form>
          <CauseTaskViews tasks={cause.tasks} onToggle={(id,checked)=>doCause(c=>({...c,tasks:c.tasks.map(t=>t.id===id?{...t,completed:checked}:t)}))} onRemove={id=>doCause(c=>({...c,tasks:c.tasks.filter(t=>t.id!==id)}))}/></section>}
        {view==='pedidos' && <section className="space-y-5"><h3>Pedidos e acompanhamento</h3><p className="text-sm text-muted-foreground">A ferramenta apenas organiza o rascunho. Nenhum pedido é enviado automaticamente a empresas, órgãos ou representantes.</p>
          <form className="grid gap-3 border border-border bg-card p-5" onSubmit={e=>{e.preventDefault();const f=e.currentTarget,v=getForm(f);const related = formString(v,'evidence');doCause(c=>({...c,requests:[...c.requests,{id:uniqueId(),title:formString(v,'title'),institution:formString(v,'institution'),question:formString(v,'question'),due_date:formString(v,'due'),status:'rascunho',evidence_ids:related?[related]:[],created_at:today()}]}));f.reset();}}>
            <label className="text-sm font-semibold">Título do pedido<input className={formControl} name="title" maxLength={200} required /></label>
            <label className="text-sm font-semibold">Instituição ou empresa responsável<input className={formControl} name="institution" maxLength={160} required /></label>
            <label className="text-sm font-semibold">Pergunta ou medida verificável<textarea className={formControl} name="question" maxLength={1600} required rows={4}/></label>
            <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold">Prazo de revisão<input className={formControl} name="due" type="date" /></label><label className="text-sm font-semibold">Fonte vinculada<select className={formControl} name="evidence"><option value="">Nenhuma</option>{cause.evidence.map(x=><option key={x.id} value={x.id}>{x.title}</option>)}</select></label></div>
            <button className={button+' justify-self-start'} type="submit">Registrar pedido em rascunho</button>
          </form>
          <ul className="m-0 list-none space-y-3 p-0">{cause.requests.map(r=><li key={r.id} className="space-y-3 border border-border p-4"><div className="flex items-start justify-between gap-4"><div><h4 className="m-0 text-lg">{r.title}</h4><p className="m-0 text-sm text-muted-foreground">{r.institution}{r.due_date?' · prazo '+r.due_date:''}</p></div><button type="button" className="cursor-pointer text-xs text-brand-strong underline" onClick={()=>doCause(c=>({...c,requests:c.requests.filter(x=>x.id!==r.id)}))}>Remover</button></div><p>{r.question}</p><label className="block max-w-xs text-sm font-semibold">Status<select className={formControl} value={r.status} onChange={e=>doCause(c=>({...c,requests:c.requests.map(x=>x.id===r.id?{...x,status:e.target.value as RequestStatus}:x)}))}>{requestStatuses.map(s=><option value={s.value} key={s.value}>{s.label}</option>)}</select></label>{r.evidence_ids.map(id=><p key={id} className="text-xs text-muted-foreground">Fonte: {cause.evidence.find(x=>x.id===id)?.title||id}</p>)}</li>)}</ul>
        </section>}
        {view==='ia' && <CauseAiBrief cause={cause}/>}
        {view==='diario' && <section className="space-y-5"><h3>Diário de decisões, respostas e correções</h3><form className="grid gap-3 border border-border bg-card p-5" onSubmit={e=>{e.preventDefault();const f=e.currentTarget,v=getForm(f);doCause(c=>({...c,updates:[...c.updates,{id:uniqueId(),title:formString(v,'title'),detail:formString(v,'detail'),date:formString(v,'date')||today()}]}));f.reset();}}><label className="text-sm font-semibold">O que mudou?<input className={formControl} maxLength={180} name="title" required/></label><label className="text-sm font-semibold">Descrição e evidência da alteração<textarea className={formControl} maxLength={1400} name="detail" rows={4}/></label><label className="text-sm font-semibold">Data<input className={formControl} name="date" type="date" defaultValue={today()}/></label><button className={button+' justify-self-start'} type="submit">Registrar atualização</button></form>
          <ol className="m-0 list-none space-y-3 p-0">{[...cause.updates].sort((a,b)=>b.date.localeCompare(a.date)).map(u=><li key={u.id} className="border-l-4 border-brand bg-card p-5"><p className="m-0 text-xs text-muted-foreground">{u.date}</p><strong className="block">{u.title}</strong><p>{u.detail}</p><button type="button" className="cursor-pointer text-xs text-brand-strong underline" onClick={()=>doCause(c=>({...c,updates:c.updates.filter(x=>x.id!==u.id)}))}>Remover</button></li>)}</ol>
        </section>}
      </>}
    </div>
  </div>;
}

import { useState } from 'react';
import type { CauseTask } from '@/lib/civic-workspace';

interface Props {
  tasks: CauseTask[];
  onToggle: (id: string, checked: boolean) => void;
  onRemove: (id: string) => void;
}
type Mode = 'lista'|'quadro'|'calendario';
const modes: {id: Mode; label: string}[] = [
  {id:'lista',label:'Lista'}, {id:'quadro',label:'Quadro'}, {id:'calendario',label:'Calendário'}
];
const pad = (n: number) => String(n).padStart(2,'0');
const currentMonth = () => {
  const now = new Date();
  return now.getFullYear()+'-'+pad(now.getMonth()+1);
};
const nextMonth = (month: string, offset: number): string => {
  const [y,m] = month.split('-').map(Number);
  const d = new Date(y,m-1+offset,1);
  return d.getFullYear()+'-'+pad(d.getMonth()+1);
};
const localToday = () => {
  const d = new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
};
const dateLabel=(iso: string)=>iso?iso.split('-').reverse().join('/'):'Sem prazo';
function TaskCard({task,onToggle,onRemove}: {task:CauseTask;onToggle:Props['onToggle'];onRemove:Props['onRemove']}) {
  return <div className="flex min-w-0 flex-col gap-3 border border-border bg-card p-3">
    <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" checked={task.completed} onChange={event=>onToggle(task.id,event.target.checked)} className="mt-1 size-5 shrink-0" aria-label={'Concluir '+task.title}/>
      <span className={task.completed?'line-through text-muted-foreground':'font-medium'}>{task.title}</span></label>
    <div className="flex items-center justify-between gap-3"><time className="text-xs text-muted-foreground" dateTime={task.deadline||undefined}>{dateLabel(task.deadline)}</time><button type="button" className="cursor-pointer text-xs font-semibold text-brand-strong underline" onClick={()=>onRemove(task.id)} aria-label={'Remover '+task.title}>Remover</button></div>
  </div>;
}
export default function CauseTaskViews({tasks,onToggle,onRemove}:Props) {
  const [mode,setMode] = useState<Mode>('lista');
  const [month,setMonth] = useState(currentMonth);
  const today=localToday();
  const pending=tasks.filter(t=>!t.completed);
  const groups=[
    {id:'atrasadas',label:'Atrasadas',items:pending.filter(t=>t.deadline && t.deadline<today)},
    {id:'proximas',label:'Com prazo',items:pending.filter(t=>t.deadline && t.deadline>=today)},
    {id:'sem-prazo',label:'Sem prazo',items:pending.filter(t=>!t.deadline)},
    {id:'concluidas',label:'Concluídas',items:tasks.filter(t=>t.completed)}
  ];
  const [y,m]=month.split('-').map(Number);
  const dateStart = (new Date(y,m-1,1).getDay()+6)%7;
  const last = new Date(y,m,0).getDate();
  const calendarDays=Array.from({length:Math.ceil((last+dateStart)/7)*7},(_,i)=> {
    const date=i-dateStart+1;
    return date>0&&date<=last?date:0;
  });
  const monthLabel = new Intl.DateTimeFormat('pt-BR',{month:'long',year:'numeric'}).format(new Date(y,m-1,1));
  return <div className="space-y-5">
    <div className="flex flex-wrap gap-2" role="group" aria-label="Visualização de tarefas">{modes.map(view=><button type="button" key={view.id} aria-pressed={mode===view.id} className={(mode===view.id?'border-primary bg-primary text-primary-foreground':'border-border bg-card text-foreground')+' cursor-pointer border px-4 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2'} onClick={()=>setMode(view.id)}>{view.label}</button>)}</div>
    {mode==='lista'&&<div className="space-y-3" aria-label="Tarefas em lista">{tasks.length===0&&<p className="text-sm text-muted-foreground">Ainda não há tarefas. Adicione uma atividade e escolha um prazo.</p>}{tasks.map(t=><TaskCard key={t.id} task={t} onToggle={onToggle} onRemove={onRemove}/>)}</div>}
    {mode==='quadro'&&<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" aria-label="Tarefas em quadro">{groups.map(g=><section key={g.id} className="min-w-0 space-y-3 bg-muted p-3"><h4 className="m-0 text-base">{g.label} <span className="text-xs text-muted-foreground">({g.items.length})</span></h4>{g.items.map(t=><TaskCard key={t.id} task={t} onToggle={onToggle} onRemove={onRemove}/>)}{!g.items.length&&<p className="text-xs text-muted-foreground">Nenhuma tarefa nesta coluna.</p>}</section>)}</div>}
    {mode==='calendario'&&<section className="space-y-4" aria-label="Calendário de tarefas">
      <div className="flex flex-wrap items-center justify-between gap-3"><h4 className="m-0 text-lg capitalize">{monthLabel}</h4><div className="flex gap-2"><button type="button" onClick={()=>setMonth(nextMonth(month,-1))} className="cursor-pointer border border-border bg-card px-3 py-2 text-sm" aria-label="Mês anterior">Anterior</button><button type="button" onClick={()=>setMonth(currentMonth())} className="cursor-pointer border border-border bg-card px-3 py-2 text-sm">Hoje</button><button type="button" onClick={()=>setMonth(nextMonth(month,1))} className="cursor-pointer border border-border bg-card px-3 py-2 text-sm" aria-label="Próximo mês">Próximo</button></div></div>
      <div className="grid grid-cols-7 gap-1" role="table" aria-label={'Prazos em '+monthLabel}>{['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(d=><strong key={d} role="columnheader" className="p-2 text-center text-xs">{d}</strong>)}{calendarDays.map((day,i)=>{
        const iso=day?month+'-'+pad(day):'';
        const items=tasks.filter(t=>t.deadline===iso);
        return <div key={i} role="cell" className={'min-h-20 border border-border p-1 sm:p-2 '+(day?'bg-card':'bg-muted/50')} aria-label={day?day+' de '+monthLabel:''}>
          {day>0&&<><span className={iso===today?'inline-block bg-brand-strong px-1 text-xs font-bold text-white':'text-xs font-semibold'}>{day}</span>{items.length>0&&<ul className="mt-1 space-y-1 p-0">{items.map(t=><li key={t.id} className={'break-words border-l-2 px-1 text-[10px] sm:text-xs '+(t.completed?'border-success line-through':'border-brand-strong')} title={t.title}>{t.title}</li>)}</ul>}</>}
        </div>;
      })}</div>
      <div className="space-y-2"><h4 className="m-0 text-base">Tarefas sem prazo ({tasks.filter(t=>!t.deadline&&!t.completed).length})</h4>{tasks.filter(t=>!t.deadline&&!t.completed).map(t=><TaskCard key={t.id} task={t} onToggle={onToggle} onRemove={onRemove}/>)}</div>
    </section>}
    <p className="text-xs text-muted-foreground">Visualizações locais da mesma lista de tarefas. Nenhum convite, lembrete, notificação ou tarefa é enviado a terceiros.</p>
  </div>;
}

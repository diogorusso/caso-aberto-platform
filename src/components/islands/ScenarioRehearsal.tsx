import {useState} from 'react';
import raw from '../../data/action-scenarios.json';
interface Props{caseId:string}
export default function ScenarioRehearsal({caseId}:Props){
 const linked=raw.cases.find(x=>x.case_id===caseId);
 const scenarios=raw.scenarios.filter(s=>linked?.scenario_ids.includes(s.id));
 const [active,setActive]=useState(scenarios[0]?.id||'');
 const selected=scenarios.find(s=>s.id===active)||scenarios[0];
 const actors=raw.actor_roles.filter(a=>selected?.actors.includes(a.id));
 if(!selected)return <p>Sem roteiros cadastrados para este caso.</p>;
 return <div className="scenario-workbench">
  <div className="scenario-mode-selector" aria-label="Selecionar cenário para planejamento">{scenarios.map(s=><button type="button" key={s.id} aria-pressed={active===s.id} onClick={()=>setActive(s.id)}>{s.label}</button>)}</div>
  <div className="scenario-panel">
   <div className="scenario-panel-head"><span>CENÁRIOS DE IMPACTO / PRÓXIMOS PASSOS</span><h3>{selected.title}</h3><p><strong>Gatilho documental:</strong> {selected.evidence_trigger}</p></div>
   <div className="scenario-panel-grid"><div><h4>O que fazer agora</h4><ol>{selected.next_steps.map((s,i)=><li key={i}>{s}</li>)}</ol></div><div><h4>O que pode mudar o caso</h4><ul>{selected.observe.map((s,i)=><li key={i}>{s}</li>)}</ul><h4>Atores envolvidos</h4><div className="scenario-actors">{actors.map(a=><span key={a.id} title={a.role}>{a.label}</span>)}</div></div></div>
   <p className="scenario-not-forecast">{selected.not_a_forecast} Confira fatos, fontes e atualização antes de tomar decisões.</p>
  </div>
 </div>
}
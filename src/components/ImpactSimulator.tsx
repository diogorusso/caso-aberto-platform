import {useMemo,useState} from 'react';

type Assumptions={
 incremental_cost_per_delay_day_brl:number;
 opportunity_cost_monthly_rate_pct:number;
 illustration_reach:number;
 purchase_ready_share_pct:number;
 decision_change_share_pct:number;
 illustrative_contract_ticket_brl:number;
 other_disputes_hypothetical:number;
 illustrative_claim_value_brl:number;
};
type Props={
 reportedPayment:number;daysHeld:number;daysDelay:number;asOf:string;defaults:Assumptions;
};
const brl=(value:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(value);
const whole=(value:number)=>new Intl.NumberFormat('pt-BR').format(value);
const pct=(value:number)=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(value)+'%';
const initialScenarios=[
 {label:'10 mil impressões',reach:10000,qualified:1,shifted:5,ticket:100000},
 {label:'100 mil impressões',reach:100000,qualified:1,shifted:5,ticket:100000},
 {label:'1 milhão de impressões',reach:1000000,qualified:1,shifted:5,ticket:100000}
];
function ScenarioField({label,value,min,max,step,onChange,suffix}:{label:string,value:number,min:number,max:number,step:number,onChange:(n:number)=>void,suffix?:string}){
 const id='assumption-'+label.toLowerCase().replace(/\W+/g,'-');
 return <label className="impact-control" htmlFor={id}><span>{label}</span><strong>{whole(value)}{suffix||''}</strong>
   <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.currentTarget.value))}/>
 </label>;
}
export default function ImpactSimulator({reportedPayment,daysHeld,daysDelay,asOf,defaults}:Props){
 const [daily,setDaily]=useState(defaults.incremental_cost_per_delay_day_brl);
 const [monthly,setMonthly]=useState(defaults.opportunity_cost_monthly_rate_pct);
 const [reach,setReach]=useState(defaults.illustration_reach);
 const [qualified,setQualified]=useState(defaults.purchase_ready_share_pct);
 const [shifted,setShifted]=useState(defaults.decision_change_share_pct);
 const [ticket,setTicket]=useState(defaults.illustrative_contract_ticket_brl);
 const [otherDisputes,setOtherDisputes]=useState(defaults.other_disputes_hypothetical);
 const [claimValue,setClaimValue]=useState(defaults.illustrative_claim_value_brl);
 const modeledCosts=useMemo(()=>{
  const estimatedExpense=daysDelay*daily;
  const hypotheticalOpportunityCost=reportedPayment*(monthly/100)*(daysHeld/30);
  return {estimatedExpense,hypotheticalOpportunityCost,total:estimatedExpense+hypotheticalOpportunityCost};
 },[daily,monthly,daysDelay,daysHeld,reportedPayment]);
 const market=useMemo(()=>{
  const purchaseReady=reach*qualified/100;
  const influenced=purchaseReady*shifted/100;
  return {purchaseReady,influenced,value:influenced*ticket};
 },[reach,qualified,shifted,ticket]);
 const analogousClaims=otherDisputes*claimValue;
 const preset=(n:number)=>{
  const s=initialScenarios[n];
  setReach(s.reach);setQualified(s.qualified);setShifted(s.shifted);setTicket(s.ticket);
 };
 return <div className="impact-simulator">
   <div className="impact-simulator-header">
     <div><span className="eyebrow">SIMULAÇÃO INTERATIVA · SEM PREVISÃO ESTATÍSTICA</span><h3>Explore o tamanho possível da exposição.</h3><p>Modifique as premissas para entender a sensibilidade dos resultados. Nenhum valor deste simulador representa perda, audiência, custo ou demanda judicial comprovados.</p></div>
     <span className="impact-scenario-stamp">Hipóteses — revisão {asOf.split('-').reverse().join('/')}</span>
   </div>
   <section className="impact-model-section" aria-labelledby="financial-model-title">
     <div className="impact-model-head"><div><span className="impact-model-n">01 / CONSUMIDOR</span><h4 id="financial-model-title">Custo econômico adicional hipotético</h4><p>Gastos que precisariam ser comprovados e custo de oportunidade ilustrativo do capital. O pagamento original não é considerado prejuízo definitivo.</p></div><div className="impact-model-value"><span>Resultado do cenário</span><strong aria-live="polite">{brl(modeledCosts.total)}</strong><small>Além do valor já pago (não somar como dano apurado)</small></div></div>
     <div className="impact-controls">
       <ScenarioField label="Custos extras por dia de atraso" value={daily} min={0} max={3000} step={50} onChange={setDaily} suffix=" R$/dia"/>
       <ScenarioField label="Custo do capital ilustrativo ao mês" value={monthly} min={0} max={5} step={0.25} onChange={setMonthly} suffix="%"/>
     </div>
     <div className="impact-formula"><span>{whole(daysDelay)} dias × {brl(daily)} = {brl(modeledCosts.estimatedExpense)}</span><span>{brl(reportedPayment)} × {pct(monthly)}/mês × {whole(daysHeld)} ÷ 30 dias = {brl(modeledCosts.hypotheticalOpportunityCost)}</span></div>
   </section>
   <section className="impact-model-section" aria-labelledby="market-model-title">
     <div className="impact-model-head"><div><span className="impact-model-n">02 / ALCANCE E DECISÕES</span><h4 id="market-model-title">Volume comercial hipoteticamente influenciado</h4><p>Um teste condicional: se uma publicação alcançasse determinada audiência, e parte dela estivesse pronta para comprar e mudasse de decisão, qual volume de contratos estaria em discussão?</p></div><div className="impact-model-value"><span>Valor teórico das decisões</span><strong aria-live="polite">{brl(market.value)}</strong><small>Não é receita perdida nem estimativa de dano à empresa</small></div></div>
     <div className="impact-preset-row" aria-label="Exemplos de alcance hipotético">
       {initialScenarios.map((s,i)=><button key={s.label} type="button" className={'impact-preset'+(reach===s.reach&&qualified===s.qualified&&shifted===s.shifted&&ticket===s.ticket?' selected':'')} onClick={()=>preset(i)}>{s.label}</button>)}
     </div>
     <div className="impact-controls">
       <ScenarioField label="Impressões hipotéticas" value={reach} min={0} max={1000000} step={10000} onChange={setReach}/>
       <ScenarioField label="Parcela pronta para comprar" value={qualified} min={0} max={10} step={0.5} onChange={setQualified} suffix="%"/>
       <ScenarioField label="Parcela que mudaria de decisão" value={shifted} min={0} max={30} step={1} onChange={setShifted} suffix="%"/>
       <ScenarioField label="Ticket médio hipotético" value={ticket} min={10000} max={250000} step={5000} onChange={setTicket} suffix=" R$"/>
     </div>
     <div className="impact-conversion-visual" aria-label="Funil numérico hipotético">
       <div><span>Impressões</span><strong>{whole(reach)}</strong></div><span aria-hidden="true">→</span><div><span>Potenciais compradores</span><strong>{whole(Math.round(market.purchaseReady))}</strong></div><span aria-hidden="true">→</span><div><span>Decisões hipoteticamente afetadas</span><strong>{new Intl.NumberFormat('pt-BR',{maximumFractionDigits:1}).format(market.influenced)}</strong></div>
     </div>
     <p className="impact-scenario-guard">Impressões não são visitantes únicos ou compradores. Os percentuais são escolhas do usuário, sem estudo de conversão da Florense. O valor não pode ser apresentado como perda efetiva de vendas.</p>
   </section>
   <section className="impact-model-section" aria-labelledby="claims-model-title">
     <div className="impact-model-head"><div><span className="impact-model-n">03 / DEMANDAS E DOCUMENTAÇÃO</span><h4 id="claims-model-title">Escala nominal de conflitos hipotéticos</h4><p>Simule uma carteira fictícia de demandas comparáveis. Quantidade de ações judiciais, valores pedidos e resultados reais não foram verificados nessa base.</p></div><div className="impact-model-value"><span>Valor nominal em cenário hipotético</span><strong aria-live="polite">{brl(analogousClaims)}</strong><small>Não é passivo judicial, condenação ou provisão contábil</small></div></div>
     <div className="impact-controls">
       <ScenarioField label="Outras demandas hipotéticas" value={otherDisputes} min={0} max={50} step={1} onChange={setOtherDisputes}/>
       <ScenarioField label="Valor contratual hipotético por demanda" value={claimValue} min={10000} max={250000} step={5000} onChange={setClaimValue} suffix=" R$"/>
     </div>
     <div className="impact-formula"><span>{whole(otherDisputes)} demandas hipotéticas × {brl(claimValue)} por contrato = {brl(analogousClaims)}</span></div>
     <p className="impact-scenario-guard">O protocolo Procon/RJ e a notificação extrajudicial não são processos judiciais. O modelo não prevê litígios e não aplica taxas de condenação, juros, multas, honorários ou danos morais.</p>
   </section>
   <div className="impact-model-footer"><strong>Como interpretar:</strong> mantenha separado o que foi pago/relatado, o que consta em fontes públicas e o que depende inteiramente de premissas. Simulações servem para avaliar sensibilidade, não para publicar perdas ou audiência inexistentes.</div>
 </div>;
}

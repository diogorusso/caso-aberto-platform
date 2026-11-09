import { useId, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Alert, AlertDescription } from '@/components/ui/alert';

type Assumptions = {
  incremental_cost_per_delay_day_brl: number;
  opportunity_cost_monthly_rate_pct: number;
  illustration_reach: number;
  purchase_ready_share_pct: number;
  decision_change_share_pct: number;
  illustrative_contract_ticket_brl: number;
  other_disputes_hypothetical: number;
  illustrative_claim_value_brl: number;
};
type Props = { reportedPayment: number; daysHeld: number; daysDelay: number; asOf: string; defaults: Assumptions };

const brl = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
const whole = (value: number) => new Intl.NumberFormat('pt-BR').format(value);
const pct = (value: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value) + '%';
const presets = [
  { label: '10 mil impressões', reach: 10000, qualified: 1, shifted: 5, ticket: 100000 },
  { label: '100 mil impressões', reach: 100000, qualified: 1, shifted: 5, ticket: 100000 },
  { label: '1 milhão de impressões', reach: 1000000, qualified: 1, shifted: 5, ticket: 100000 },
];

function ScenarioField({ label, value, min, max, step, onChange, suffix }: { label: string; value: number; min: number; max: number; step: number; onChange: (n: number) => void; suffix?: string }) {
  const id = useId();
  return (
    <div className="grid gap-3">
      <div className="flex items-baseline justify-between gap-4">
        <Label htmlFor={id} className="leading-snug font-normal text-muted-foreground">{label}</Label>
        <strong className="text-sm whitespace-nowrap tabular-nums">{whole(value)}{suffix || ''}</strong>
      </div>
      <Slider id={id} aria-label={label} min={min} max={max} step={step} value={[value]} onValueChange={(v) => onChange(v[0] ?? min)} />
    </div>
  );
}

function ModelCard({ n, title, description, resultLabel, result, resultNote, children }: { n: string; title: string; description: string; resultLabel: string; result: string; resultNote: string; children: React.ReactNode }) {
  return (
    <Card className="border-l-4 border-l-brand-strong">
      <CardHeader className="gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(14rem,0.6fr)]">
        <div className="space-y-2">
          <span className="text-xs font-semibold tracking-wider text-brand-strong uppercase">{n}</span>
          <CardTitle className="text-xl md:text-2xl">{title}</CardTitle>
          <CardDescription className="leading-relaxed">{description}</CardDescription>
        </div>
        <div className="bg-forest p-5 text-forest-foreground">
          <span className="text-xs tracking-wider text-white/70 uppercase">{resultLabel}</span>
          <strong aria-live="polite" className="my-2 block text-2xl font-bold tracking-tight break-words md:text-3xl">{result}</strong>
          <small className="block text-xs leading-snug text-white/70">{resultNote}</small>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">{children}</CardContent>
    </Card>
  );
}

export default function ImpactSimulator({ reportedPayment, daysHeld, daysDelay, asOf, defaults }: Props) {
  const [daily, setDaily] = useState(defaults.incremental_cost_per_delay_day_brl);
  const [monthly, setMonthly] = useState(defaults.opportunity_cost_monthly_rate_pct);
  const [reach, setReach] = useState(defaults.illustration_reach);
  const [qualified, setQualified] = useState(defaults.purchase_ready_share_pct);
  const [shifted, setShifted] = useState(defaults.decision_change_share_pct);
  const [ticket, setTicket] = useState(defaults.illustrative_contract_ticket_brl);
  const [otherDisputes, setOtherDisputes] = useState(defaults.other_disputes_hypothetical);
  const [claimValue, setClaimValue] = useState(defaults.illustrative_claim_value_brl);

  const costs = useMemo(() => {
    const estimatedExpense = daysDelay * daily;
    const opportunity = reportedPayment * (monthly / 100) * (daysHeld / 30);
    return { estimatedExpense, opportunity, total: estimatedExpense + opportunity };
  }, [daily, monthly, daysDelay, daysHeld, reportedPayment]);
  const market = useMemo(() => {
    const purchaseReady = (reach * qualified) / 100;
    const influenced = (purchaseReady * shifted) / 100;
    return { purchaseReady, influenced, value: influenced * ticket };
  }, [reach, qualified, shifted, ticket]);
  const analogousClaims = otherDisputes * claimValue;
  const activePreset = presets.find((s) => reach === s.reach && qualified === s.qualified && shifted === s.shifted && ticket === s.ticket)?.label ?? '';

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl space-y-3">
          <p className="m-0 text-xs font-semibold tracking-[0.14em] text-brand-strong uppercase">Simulação interativa · hipóteses separadas dos fatos</p>
          <h2 className="m-0">Explore o tamanho possível da exposição.</h2>
          <p className="m-0 text-lg text-muted-foreground">Mexa nas premissas. O que já foi pago e documentado fica no painel acima; aqui só entram cenários editáveis — sem inventar audiência, prejuízo ou processo.</p>
        </div>
        <Badge variant="outline" className="shrink-0 bg-card">Hipóteses — revisão {asOf.split('-').reverse().join('/')}</Badge>
      </div>

      <ModelCard n="01 / Consumidor" title="Custo econômico adicional hipotético" description="O dinheiro do contrato já saiu. Aqui você testa custos extras e custo de capital — só entram valores que você conseguir comprovar." resultLabel="Resultado do cenário" result={brl(costs.total)} resultNote="Além do valor já pago (cenário editável)">
        <div className="grid gap-6 md:grid-cols-2">
          <ScenarioField label="Custos extras por dia de atraso" value={daily} min={0} max={3000} step={50} onChange={setDaily} suffix=" R$/dia" />
          <ScenarioField label="Custo do capital ilustrativo ao mês" value={monthly} min={0} max={5} step={0.25} onChange={setMonthly} suffix="%" />
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-1 border-t pt-4 font-mono text-xs text-muted-foreground">
          <span>{whole(daysDelay)} dias × {brl(daily)} = {brl(costs.estimatedExpense)}</span>
          <span>{brl(reportedPayment)} × {pct(monthly)}/mês × {whole(daysHeld)} ÷ 30 dias = {brl(costs.opportunity)}</span>
        </div>
      </ModelCard>

      <ModelCard n="02 / Alcance e decisões" title="Volume comercial hipoteticamente influenciado" description="Teste condicional: se o alerta alcançasse X pessoas, e parte delas deixasse de comprar, qual volume de contratos estaria em jogo?" resultLabel="Valor teórico das decisões" result={brl(market.value)} resultNote="Cenário editável — separado do faturamento real">
        <ToggleGroup
          type="single"
          variant="outline"
          aria-label="Exemplos de alcance hipotético"
          value={activePreset}
          onValueChange={(label) => {
            const s = presets.find((p) => p.label === label);
            if (!s) return;
            setReach(s.reach); setQualified(s.qualified); setShifted(s.shifted); setTicket(s.ticket);
          }}
          className="flex-wrap"
        >
          {presets.map((s) => <ToggleGroupItem key={s.label} value={s.label} className="px-3">{s.label}</ToggleGroupItem>)}
        </ToggleGroup>
        <div className="grid gap-6 md:grid-cols-2">
          <ScenarioField label="Impressões hipotéticas" value={reach} min={0} max={1000000} step={10000} onChange={setReach} />
          <ScenarioField label="Parcela pronta para comprar" value={qualified} min={0} max={10} step={0.5} onChange={setQualified} suffix="%" />
          <ScenarioField label="Parcela que mudaria de decisão" value={shifted} min={0} max={30} step={1} onChange={setShifted} suffix="%" />
          <ScenarioField label="Ticket médio hipotético" value={ticket} min={10000} max={250000} step={5000} onChange={setTicket} suffix=" R$" />
        </div>
        <ol aria-label="Funil numérico hipotético" className="m-0 grid list-none gap-2 p-0 md:grid-cols-3">
          {[
            ['Impressões', whole(reach)],
            ['Potenciais compradores', whole(Math.round(market.purchaseReady))],
            ['Decisões hipoteticamente afetadas', new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(market.influenced)],
          ].map(([k, v], i) => (
            <li key={k} className="relative border-t-4 border-t-brand bg-muted p-4">
              <span className="block text-xs text-muted-foreground">{i > 0 ? '→ ': ''}{k}</span>
              <strong className="text-xl font-bold tracking-tight tabular-nums break-words md:text-2xl">{v}</strong>
            </li>
          ))}
        </ol>
        <Alert variant="warning"><AlertDescription className="text-foreground/80">Impressões ≠ compradores. Os percentuais são sua escolha — sem inventar taxa de conversão. Não publique este número como perda de vendas medida.</AlertDescription></Alert>
      </ModelCard>

      <ModelCard n="03 / Demandas e documentação" title="Escala nominal de conflitos hipotéticos" description="Simule uma carteira fictícia de demandas comparáveis. Cada ação real exigiria processo, valor e resultado próprios — conferidos na fonte." resultLabel="Valor nominal em cenário hipotético" result={brl(analogousClaims)} resultNote="Cenário editável — não é condenação nem provisão">
        <div className="grid gap-6 md:grid-cols-2">
          <ScenarioField label="Outras demandas hipotéticas" value={otherDisputes} min={0} max={50} step={1} onChange={setOtherDisputes} />
          <ScenarioField label="Valor contratual hipotético por demanda" value={claimValue} min={10000} max={250000} step={5000} onChange={setClaimValue} suffix=" R$" />
        </div>
        <div className="border-t pt-4 font-mono text-xs text-muted-foreground">{whole(otherDisputes)} demandas hipotéticas × {brl(claimValue)} por contrato = {brl(analogousClaims)}</div>
        <Alert variant="warning"><AlertDescription className="text-foreground/80">Procon/RJ e notificação extrajudicial ≠ processo judicial. Este bloco não inventa condenação, juros, multa ou dano moral.</AlertDescription></Alert>
      </ModelCard>

      <Card className="py-5"><CardFooter className="block px-5 text-sm text-muted-foreground"><strong className="text-foreground">Como interpretar:</strong> separe o que foi pago/relatado, o que está em fonte pública e o que depende só de premissa. Simulação mede sensibilidade — não inventa perda nem audiência.</CardFooter></Card>
    </div>
  );
}

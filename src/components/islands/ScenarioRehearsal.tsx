import raw from '../../data/action-scenarios.json';
import { copy } from '@/lib/copy';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props { caseId: string; slug?: string }

const dmy = (iso: string) => iso.split('-').reverse().join('/');

export default function ScenarioRehearsal({ caseId, slug }: Props) {
  const linked = raw.cases.find((x) => x.case_id === caseId);
  const scenarios = raw.scenarios.filter((s) => linked?.scenario_ids.includes(s.id));
  const e = copy.risk.escalation;
  const esc = raw.escalation && raw.escalation.case_id === caseId ? raw.escalation : null;
  const days = esc ? Math.max(0, Math.round((Date.parse(esc.as_of + 'T00:00:00Z') - Date.parse(esc.start_date + 'T00:00:00Z')) / 86400000)) : 0;
  const caseBase = slug ? `/casos/${slug}/` : undefined;

  return (
    <>
      {scenarios.length > 0 && (
        <Tabs defaultValue={scenarios[0].id} className="my-6 gap-4">
          <TabsList aria-label="Selecionar cenário para planejamento" className="h-auto w-full flex-wrap justify-start">
            {scenarios.map((s) => <TabsTrigger key={s.id} value={s.id} className="flex-none whitespace-normal">{s.label}</TabsTrigger>)}
          </TabsList>
          {scenarios.map((s) => {
            const actors = raw.actor_roles.filter((a) => s.actors.includes(a.id));
            return (
              <TabsContent key={s.id} value={s.id} forceMount className="data-[state=inactive]:hidden">
                <Card>
                  <CardHeader className="gap-2 border-b">
                    <span className="text-xs font-semibold tracking-wider text-brand-strong uppercase">Cenários de impacto / próximos passos</span>
                    <CardTitle className="text-xl md:text-2xl">{s.title}</CardTitle>
                    <p className="m-0 text-sm text-muted-foreground"><strong className="text-foreground">Gatilho documental:</strong> {s.evidence_trigger}</p>
                  </CardHeader>
                  <CardContent className="grid gap-8 md:grid-cols-2">
                    <div className="space-y-3">
                      <h4 className="m-0">O que fazer agora</h4>
                      <ol className="m-0 list-decimal space-y-2 pl-5 text-sm">{s.next_steps.map((x, i) => <li key={i}>{x}</li>)}</ol>
                    </div>
                    <div className="space-y-3">
                      <h4 className="m-0">O que pode mudar o caso</h4>
                      <ul className="m-0 list-disc space-y-2 pl-5 text-sm">{s.observe.map((x, i) => <li key={i}>{x}</li>)}</ul>
                      <h4 className="m-0 pt-2">Atores envolvidos</h4>
                      <div className="flex flex-wrap gap-2">{actors.map((a) => <Badge key={a.id} variant="outline" title={a.role}>{a.label}</Badge>)}</div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t text-xs text-muted-foreground">{s.not_a_forecast} Confira fatos, fontes e atualização antes de tomar decisões.</CardFooter>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      )}

      {esc && (
        <section className="mt-10" aria-labelledby="escalada-titulo">
          <span className="text-xs font-semibold tracking-[0.14em] text-brand-strong uppercase">{e.eyebrow}</span>
          <h2 id="escalada-titulo" className="my-3 text-2xl md:text-3xl">{e.title}</h2>
          <p className="m-0 max-w-3xl text-muted-foreground">{e.description}</p>

          <div className="my-6 flex flex-wrap items-center gap-x-8 gap-y-3 border bg-muted/40 p-5">
            <div>
              <span className="block text-xs font-semibold tracking-wider text-muted-foreground uppercase">{e.daysLabel}</span>
              <strong className="mt-1 block text-4xl font-extrabold tracking-tight text-brand-strong">{days}</strong>
            </div>
            <p className="m-0 max-w-md text-sm text-muted-foreground">
              {e.daysWithoutReply(days)} — de {dmy(esc.start_date)} a {dmy(esc.as_of)}. {esc.counter_label}.
            </p>
          </div>

          <ol className="m-0 grid list-none gap-4 p-0">
            {esc.steps.map((step) => (
              <li key={step.id} className={cn('border-l-4 bg-card p-5 shadow-sm', step.status === 'consumado' ? 'border-brand-strong' : 'border-warning')}>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant={step.status === 'consumado' ? 'brand' : 'warning'}>{step.status === 'consumado' ? e.statusDone : e.statusPossible}</Badge>
                  {step.date && <time dateTime={step.date} className="text-sm font-semibold text-brand-strong">{dmy(step.date)}</time>}
                </div>
                <h3 className="mt-2 mb-1 text-xl">{step.title}</h3>
                <p className="m-0 text-sm text-muted-foreground">{step.description}</p>
                <p className="mt-3 mb-0 border-t pt-3 text-sm">
                  <strong>{e.losesLabel}:</strong> {step.company_loses}{' '}
                  <a className="font-semibold text-brand-strong" href={step.effect_source} target={step.effect_source.startsWith('http') ? '_blank' : undefined} rel={step.effect_source.startsWith('http') ? 'noopener noreferrer' : undefined}>{e.effectSource} ↗</a>
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-8 bg-forest p-6 text-forest-foreground md:p-8">
            <h3 className="mt-0 mb-2 text-2xl font-extrabold">{esc.cta}</h3>
            <p className="m-0 max-w-2xl text-white/75">{esc.cta_note}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {caseBase && <a className={cn(buttonVariants({ variant: 'brand' }), 'no-underline')} href={`${caseBase}#apoiar`}>Junte-se à cobrança</a>}
              {caseBase && <a className={cn(buttonVariants({ variant: 'outline-inverse' }), 'no-underline')} href={`${caseBase}imprensa/`}>Perguntas à empresa e kit de imprensa</a>}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowRight, Clock3, ExternalLink, FileSearch, Scale, ShieldCheck, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ImpactMetricGrid, { type ImpactMetric } from './ImpactMetricGrid'
import EvidenceChart, { type EvidenceBar, type EvidencePoint } from './EvidenceChart'
import { cn } from '@/lib/utils'

export type ImpactSource = {
  title: string
  url: string
}

export type ImpactStoryPayload = {
  id: string
  slug?: string
  headline: string
  audience: string
  exposure: string
  worst_case: string
  threshold: string
  resolution: string
  action: string
  href: string
  date: string
  metrics: ImpactMetric[]
  points: EvidencePoint[]
  bars?: EvidenceBar[]
  graphTitle: string
  graphDescription: string
  graphSource?: string | null
  printHref?: string
  sources?: ImpactSource[]
}

type ImpactJsonCase = {
  id: string
  slug: string
  case_url: string
  reviewed_at: string
  headline: string
  affected_public: string
  impact_now: string
  conditional_consequence: string
  change_trigger: string
  resolution_evidence: string
  public_action: string
  indicators: ImpactMetric[]
  documentary_milestones: EvidencePoint[]
  evidence_graph: {
    title: string
    description: string
    source_url: string | null
    bars: EvidenceBar[]
  }
  sources?: ImpactSource[]
  source_urls?: string[]
  print_url: string
}

type Props = {
  caseId: string
  story?: ImpactStoryPayload | null
  triggerLabel?: string
  className?: string
  triggerClassName?: string
  size?: 'sm' | 'default'
  /** When false, renders content only (used inside section compositions). */
  withTrigger?: boolean
}

const dateLabel = (value: string) => value.split('-').reverse().join('/')

function fromJson(item: ImpactJsonCase): ImpactStoryPayload {
  const sources =
    item.sources?.length
      ? item.sources
      : (item.source_urls || []).map((url, index) => ({ title: `Fonte ${String(index + 1).padStart(2, '0')}`, url }))
  return {
    id: item.id,
    slug: item.slug,
    headline: item.headline,
    audience: item.affected_public,
    exposure: item.impact_now,
    worst_case: item.conditional_consequence,
    threshold: item.change_trigger,
    resolution: item.resolution_evidence,
    action: item.public_action,
    href: item.case_url,
    date: item.reviewed_at,
    metrics: item.indicators || [],
    points: item.documentary_milestones || [],
    bars: item.evidence_graph?.bars?.length ? item.evidence_graph.bars : undefined,
    graphTitle: item.evidence_graph?.title || 'Como o caso chegou até aqui',
    graphDescription: item.evidence_graph?.description || '',
    graphSource: item.evidence_graph?.source_url,
    printHref: item.print_url,
    sources,
  }
}

export default function ImpactStoryDrawer({
  caseId,
  story: initialStory = null,
  triggerLabel = 'Ver impacto e fontes',
  className,
  triggerClassName,
  size = 'default',
  withTrigger = true,
}: Props) {
  const [open, setOpen] = useState(false)
  const [story, setStory] = useState<ImpactStoryPayload | null>(initialStory)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || story || loading) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch('/casos/impacto.json')
      .then((response) => {
        if (!response.ok) throw new Error('Falha ao carregar impacto')
        return response.json()
      })
      .then((payload: { cases?: ImpactJsonCase[] }) => {
        if (cancelled) return
        const match = (payload.cases || []).find((item) => item.id === caseId)
        if (!match) throw new Error('Caso sem narrativa de impacto')
        setStory(fromJson(match))
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || 'Não foi possível abrir o impacto')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, story, loading, caseId])

  const printHref = useMemo(
    () => story?.printHref || (story?.slug ? `/casos/imprimir/${story.slug}/` : undefined),
    [story]
  )
  const sources = story?.sources || []

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {withTrigger && (
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size={size}
            className={cn('justify-between gap-2 border-brand/40 text-brand-strong hover:border-brand-strong hover:bg-brand-soft/40', triggerClassName)}
          >
            <span className="inline-flex items-center gap-2">
              <TrendingUp size={15} aria-hidden="true" />
              {triggerLabel}
            </span>
            <FileSearch size={14} aria-hidden="true" />
          </Button>
        </SheetTrigger>
      )}
      <SheetContent
        side="right"
        className={cn(
          'flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl md:max-w-2xl lg:max-w-3xl',
          className
        )}
      >
        <SheetHeader className="sticky top-0 z-10 border-b border-border bg-background px-5 py-4 md:px-6">
          <div className="flex flex-wrap items-center gap-2 text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-brand-strong">
            <TrendingUp size={14} aria-hidden="true" /> Impacto documentado
            {story?.date && <span className="font-semibold text-muted-foreground">· revisão {dateLabel(story.date)}</span>}
          </div>
          <SheetTitle className="max-w-3xl text-left text-xl leading-snug md:text-2xl">
            {story?.headline || 'Carregando consequência documentada…'}
          </SheetTitle>
          <SheetDescription className="max-w-3xl text-left text-sm leading-relaxed">
            {story?.audience || 'KPIs, gráfico, fontes e pior cenário condicional — sem sair do dossiê.'}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="impacto" className="flex min-h-0 flex-1 flex-col gap-0">
          <div className="border-b border-border px-5 pt-3 md:px-6">
            <TabsList variant="line" className="w-full justify-start">
              <TabsTrigger value="impacto">Impacto</TabsTrigger>
              <TabsTrigger value="fontes">Fontes ({sources.length || '…'})</TabsTrigger>
            </TabsList>
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 md:px-6 md:py-6">
            {loading && (
              <div className="space-y-3" aria-live="polite">
                <div className="h-24 animate-pulse border border-border bg-muted" />
                <div className="h-48 animate-pulse border border-border bg-muted" />
                <div className="h-32 animate-pulse border border-border bg-muted" />
              </div>
            )}
            {error && (
              <p className="m-0 border border-destructive/30 bg-brand-soft p-4 text-sm text-foreground">
                {error}. Continue na seção de impacto da página ou abra o dossiê completo.
              </p>
            )}

            {story && !loading && (
              <>
                <TabsContent value="impacto" className="mt-0 space-y-5">
                  <p className="m-0 text-sm leading-relaxed text-muted-foreground md:text-base">{story.exposure}</p>
                  <ImpactMetricGrid metrics={story.metrics} />
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(15rem,0.8fr)]">
                    <EvidenceChart
                      title={story.graphTitle}
                      description={story.graphDescription}
                      points={story.points}
                      bars={story.bars}
                      sourceUrl={story.graphSource || undefined}
                    />
                    <div className="grid gap-4">
                      <article className="border border-border border-t-[3px] border-t-brand-strong bg-card p-5">
                        <div className="flex items-center gap-2 text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-brand-strong">
                          <AlertTriangle size={15} aria-hidden="true" /> Se a situação continuar
                        </div>
                        <h3 className="mb-3 mt-3 text-lg leading-snug">Qual consequência não pode ser ignorada?</h3>
                        <p className="m-0 text-sm leading-relaxed">{story.worst_case}</p>
                      </article>
                      <article className="border border-border bg-card p-5">
                        <div className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          <FileSearch size={15} aria-hidden="true" /> O que muda o status
                        </div>
                        <p className="mb-0 mt-3 text-sm leading-relaxed">{story.threshold}</p>
                      </article>
                    </div>
                  </div>

                  <section className="border border-border bg-card" aria-label="Caminhos documentais do caso">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                      <h3 className="m-0 flex items-center gap-2 text-lg">
                        <Scale size={18} className="text-brand-strong" aria-hidden="true" /> Acompanhamento sem adivinhação
                      </h3>
                    </div>
                    <div className="grid gap-0 md:grid-cols-3">
                      <div className="border-b border-border p-5 md:border-b-0 md:border-r">
                        <div className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-brand-strong">
                          <Clock3 size={15} aria-hidden="true" /> 01 · Agora
                        </div>
                        <h4 className="my-2 text-base">O que já está em jogo</h4>
                        <p className="m-0 text-sm leading-relaxed text-muted-foreground">{story.exposure}</p>
                      </div>
                      <div className="border-b border-border bg-brand-soft/40 p-5 md:border-b-0 md:border-r">
                        <div className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-brand-strong">
                          <AlertTriangle size={15} aria-hidden="true" /> 02 · Se persistir
                        </div>
                        <h4 className="my-2 text-base">O agravamento possível</h4>
                        <p className="m-0 text-sm leading-relaxed">{story.worst_case}</p>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-success">
                          <ShieldCheck size={15} aria-hidden="true" /> 03 · Para resolver
                        </div>
                        <h4 className="my-2 text-base">Qual prova encerra a pendência?</h4>
                        <p className="m-0 text-sm leading-relaxed text-muted-foreground">{story.resolution}</p>
                      </div>
                    </div>
                    <div className="border-t border-border bg-muted/60 px-5 py-4 text-sm">
                      <strong>Cobre uma resposta verificável:</strong> {story.action}
                    </div>
                  </section>
                </TabsContent>

                <TabsContent value="fontes" className="mt-0 space-y-4">
                  <p className="m-0 text-sm text-muted-foreground">
                    Lista de fontes deste caso. Cada link abre o documento ou cobertura original — sem misturar denominadores.
                  </p>
                  {sources.length === 0 ? (
                    <p className="m-0 border border-border bg-muted p-4 text-sm">
                      As fontes detalhadas estão no dossiê. Abra a página completa para conferir.
                    </p>
                  ) : (
                    <ol className="m-0 list-none space-y-3 p-0">
                      {sources.map((source, index) => (
                        <li key={`${source.url}-${index}`} className="border border-border bg-card p-4">
                          <span className="text-xs font-bold text-brand-strong">{String(index + 1).padStart(2, '0')}</span>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 flex items-start gap-2 text-sm font-semibold text-link no-underline hover:underline"
                          >
                            <span className="min-w-0 flex-1">{source.title}</span>
                            <ExternalLink size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                          </a>
                        </li>
                      ))}
                    </ol>
                  )}
                  {story.graphSource && (
                    <p className="m-0 text-sm text-muted-foreground">
                      Origem do gráfico:{' '}
                      <a className="font-semibold text-link hover:underline" href={story.graphSource} target="_blank" rel="noopener noreferrer">
                        Conferir ↗
                      </a>
                    </p>
                  )}
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>

        {story && (
          <div className="sticky bottom-0 z-10 space-y-3 border-t border-border bg-background px-5 py-4 md:px-6">
            <Button asChild className="min-h-11 w-full sm:w-auto">
              <a href={story.href}>
                Continuar no dossiê <ArrowRight size={15} aria-hidden="true" />
              </a>
            </Button>
            <p className="m-0 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <a className="font-semibold text-link hover:underline" href={`/casos/acoes/${story.id}/`}>Abrir página completa de cobrança ↗</a>
              {printHref && <a className="font-semibold text-link hover:underline" href={printHref}>Ficha A4 ↗</a>}
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

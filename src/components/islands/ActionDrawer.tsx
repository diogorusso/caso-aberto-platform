'use client'

import { useMemo, useState } from 'react'
import { Copy, Download, ExternalLink, FileCheck2, FilePenLine, Scale } from 'lucide-react'
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
import { cn } from '@/lib/utils'

export type ActionChannel = {
  id: string
  title: string
  url: string
  purpose: string
  source_url: string
  note: string
  stage: string
  step: string
}

export type ActionTemplate = {
  id: string
  label: string
  audience: string
  description: string
  body: string
  channelIds: string[]
}

export type ActionPlanPayload = {
  id: string
  title: string
  company: string
  summary: string
  href: string
  isCivic: boolean
  judicialNote: string
  templates: ActionTemplate[]
  channels: ActionChannel[]
}

type Props = {
  plan: ActionPlanPayload
  triggerLabel?: string
  size?: 'sm' | 'default'
  className?: string
  variant?: 'default' | 'brand'
}

export default function ActionDrawer({
  plan,
  triggerLabel = 'Escrever cobrança',
  size = 'default',
  className,
  variant = 'brand',
}: Props) {
  const [activeTemplate, setActiveTemplate] = useState(plan.templates[0]?.id || '')
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(plan.templates.map((item) => [item.id, item.body]))
  )
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const stages = useMemo(() => [...new Set(plan.channels.map((channel) => channel.stage))], [plan.channels])
  const current = plan.templates.find((item) => item.id === activeTemplate) || plan.templates[0]

  async function copyText(id: string, value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedId(id)
      window.setTimeout(() => setCopiedId(null), 2000)
    } catch {
      window.prompt('Copie o texto do modelo', value)
    }
  }

  function downloadText(id: string, value: string) {
    const blob = new Blob([value], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `casoaberto-${plan.id}-${id}.txt`
    anchor.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 3000)
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          size={size === 'sm' ? 'sm' : 'default'}
          variant={variant === 'brand' ? 'brand' : 'outline'}
          className={cn(
            'w-fit',
            size === 'sm' ? 'min-h-10' : 'min-h-11',
            variant === 'brand' &&
              'border-brand-strong bg-brand-strong text-white hover:bg-brand-strong/90 hover:text-white focus-visible:text-white',
            className
          )}
        >
          <FilePenLine size={16} aria-hidden="true" />
          {triggerLabel}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
        <SheetHeader className="sticky top-0 z-10 border-b border-border bg-background px-5 py-4 text-left md:px-6">
          <p className="m-0 text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-brand-strong">
            {plan.isCivic ? 'Pedido com documentos' : 'Cobrança com documentos'} · {plan.id}
          </p>
          <SheetTitle className="max-w-3xl text-left text-xl leading-snug md:text-2xl">
            {plan.isCivic
              ? 'Peça o documento. Exija a resposta pública.'
              : 'A resposta não chegou? Escreva a cobrança agora.'}
          </SheetTitle>
          <SheetDescription className="max-w-3xl text-left text-sm leading-relaxed">
            {plan.templates.length} textos prontos para {plan.company}. Edite no navegador, copie e envie pelo canal certo — sem sair do dossiê.
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="modelos" className="flex min-h-0 flex-1 flex-col gap-0">
          <div className="border-b border-border px-5 pt-3 md:px-6">
            <TabsList variant="line" className="w-full justify-start">
              <TabsTrigger value="modelos">Textos prontos</TabsTrigger>
              <TabsTrigger value="canais">Onde enviar</TabsTrigger>
              {!plan.isCivic && <TabsTrigger value="justica">Ir à Justiça</TabsTrigger>}
            </TabsList>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6">
            <TabsContent value="modelos" className="mt-0 space-y-4">
              <div className="flex flex-wrap gap-2">
                {plan.templates.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTemplate(item.id)}
                    className={cn(
                      'inline-flex min-h-10 items-center rounded-md border px-3 text-sm font-semibold transition-colors',
                      activeTemplate === item.id
                        ? 'border-brand-strong bg-brand-strong text-white'
                        : 'border-border bg-card text-foreground hover:border-brand'
                    )}
                  >
                    {String(index + 1).padStart(2, '0')} · {item.label}
                  </button>
                ))}
              </div>

              {current && (
                <article className="space-y-4 border border-border bg-card p-4 md:p-5">
                  <div className="space-y-1">
                    <p className="m-0 text-xs font-bold uppercase tracking-wide text-brand-strong">{current.audience}</p>
                    <h3 className="m-0 text-lg">{current.label}</h3>
                    <p className="m-0 text-sm text-muted-foreground">{current.description}</p>
                  </div>
                  <label className="block text-sm font-semibold" htmlFor={`action-draft-${plan.id}-${current.id}`}>
                    Editar texto
                  </label>
                  <textarea
                    id={`action-draft-${plan.id}-${current.id}`}
                    spellCheck
                    rows={14}
                    className="w-full rounded-md border border-border bg-background p-3 font-mono text-xs leading-relaxed text-foreground focus-visible:ring-2 focus-visible:ring-brand"
                    value={drafts[current.id] || ''}
                    onChange={(event) => setDrafts((prev) => ({ ...prev, [current.id]: event.target.value }))}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" onClick={() => copyText(current.id, drafts[current.id] || '')}>
                      <Copy size={15} aria-hidden="true" />
                      {copiedId === current.id ? 'Texto copiado ✓' : 'Copiar texto'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => downloadText(current.id, drafts[current.id] || '')}>
                      <Download size={15} aria-hidden="true" />
                      Baixar .txt
                    </Button>
                    {current.channelIds.slice(0, 2).map((channelId) => {
                      const channel = plan.channels.find((item) => item.id === channelId)
                      if (!channel) return null
                      return (
                        <Button key={channel.id} asChild variant="outline">
                          <a href={channel.url} target="_blank" rel="noopener noreferrer">
                            {channel.title} <ExternalLink size={13} aria-hidden="true" />
                          </a>
                        </Button>
                      )
                    })}
                  </div>
                </article>
              )}
            </TabsContent>

            <TabsContent value="canais" className="mt-0 space-y-4">
              <p className="m-0 text-sm text-muted-foreground">
                Cada canal tem finalidade e fonte. Alguns exigem cadastro, protocolo anterior ou o fornecedor na lista de participantes.
              </p>
              {stages.map((stage) => (
                <div key={stage} className="space-y-2 rounded-lg border border-border bg-card p-4">
                  <h3 className="m-0 text-xs font-bold uppercase tracking-widest text-brand-strong">{stage}</h3>
                  {plan.channels
                    .filter((channel) => channel.stage === stage)
                    .map((channel) => (
                      <article key={channel.id} className="space-y-2 border-t border-border pt-3 first:border-0 first:pt-0">
                        <a
                          href={channel.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-bold text-link"
                        >
                          {channel.title} <ExternalLink size={14} aria-hidden="true" />
                        </a>
                        <p className="m-0 text-sm">{channel.purpose}</p>
                        <p className="m-0 text-xs leading-relaxed text-muted-foreground">{channel.note}</p>
                        <a href={channel.source_url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-link">
                          Fonte desse canal ↗
                        </a>
                      </article>
                    ))}
                </div>
              ))}
            </TabsContent>

            {!plan.isCivic && (
              <TabsContent value="justica" className="mt-0 space-y-4">
                <div className="space-y-3 border-l-4 border-brand bg-muted p-4">
                  <p className="m-0 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-strong">
                    <Scale size={14} aria-hidden="true" /> O caminho judicial
                  </p>
                  <h3 className="m-0 text-lg">Não comece pelo formulário errado.</h3>
                  <p className="m-0 text-sm text-muted-foreground">{plan.judicialNote}</p>
                </div>
                <ol className="m-0 grid list-none gap-3 p-0">
                  {[
                    ['01 · Organizar', 'Separe contrato, comprovantes, prazos, registros de atendimento e valor pretendido.'],
                    ['02 · Verificar a via', 'Confira competência territorial, valor da causa, natureza do pedido e necessidade de representação.'],
                    ['03 · Protocolar', 'Use o canal do tribunal correspondente ou peça assistência jurídica; guarde recibo, número e intimações.'],
                  ].map(([title, body]) => (
                    <li key={title} className="border border-border bg-card p-4">
                      <strong className="block text-sm">{title}</strong>
                      <p className="mb-0 mt-2 text-sm text-muted-foreground">{body}</p>
                    </li>
                  ))}
                </ol>
                <Button asChild variant="outline">
                  <a href="/guias/como-acionar-empresa-na-justica/">Passo a passo para entrar com ação ↗</a>
                </Button>
              </TabsContent>
            )}
          </div>
        </Tabs>

        <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background px-5 py-4 text-sm text-muted-foreground md:px-6">
          <span className="inline-flex items-center gap-1">
            <FileCheck2 size={16} aria-hidden="true" /> {plan.templates.length} textos prontos · {plan.channels.length} canais
          </span>
          <a className="font-semibold text-link hover:underline" href={`/casos/acoes/${plan.id}/`}>
            Abrir página completa de cobrança ↗
          </a>
        </div>
      </SheetContent>
    </Sheet>
  )
}

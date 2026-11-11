'use client'

import { useState } from 'react'
import { ClipboardList, Copy, Link2, MessageCircle, Printer, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

type Props = {
  title: string
  href: string
  summary?: string
  printHref?: string
  caseId?: string
  showComplaint?: boolean
  triggerLabel?: string
  size?: 'sm' | 'default'
  className?: string
}

const siteOrigin = 'https://casoaberto.pages.dev'

function absoluteUrl(href: string) {
  try {
    return new URL(href, siteOrigin).href
  } catch {
    return href
  }
}

export default function ShareDrawer({
  title,
  href,
  summary = '',
  printHref,
  caseId,
  showComplaint = true,
  triggerLabel = 'Compartilhar o dossiê',
  size = 'default',
  className,
}: Props) {
  const [copied, setCopied] = useState(false)
  const url = absoluteUrl(href)
  const message = `CasoAberto | ${title}\n${summary.slice(0, 240)}\n\nLeia o caso completo: cronologia, fontes e respostas:\n${url}`
  const channels = [
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(message)}`,
      icon: MessageCircle,
      note: 'Envie o dossiê completo com link.',
    },
    {
      label: 'X',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Caso documentado: ${title.slice(0, 115)}`)}&url=${encodeURIComponent(url)}`,
      icon: Share2,
      note: 'Publicação curta com o endereço da pesquisa.',
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: Share2,
      note: 'Abre o compartilhador oficial.',
    },
    {
      label: 'Telegram',
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      icon: Share2,
      note: 'Encaminhe o caso para um chat ou canal.',
    },
  ] as const

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copie o link do caso', url)
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size={size === 'sm' ? 'sm' : 'default'}
          className={cn(size === 'sm' ? 'min-h-10' : 'min-h-11', className)}
        >
          <Share2 size={16} aria-hidden="true" />
          {triggerLabel}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="border-b border-border text-left">
          <SheetTitle>Enviar o dossiê completo</SheetTitle>
          <SheetDescription>
            Escolha um canal. O link abre a pesquisa com cronologia e fontes — não um resumo solto.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 py-5">
          <div className="space-y-1 border-l-4 border-brand bg-muted p-4">
            <p className="m-0 text-xs font-bold uppercase tracking-wider text-brand-strong">Caso</p>
            <p className="m-0 text-sm font-semibold leading-snug text-foreground">{title}</p>
          </div>

          <div className="space-y-2">
            <p className="m-0 text-xs font-bold uppercase tracking-wider text-muted-foreground">Redes</p>
            <ul className="m-0 grid list-none gap-2 p-0">
              {channels.map((channel) => {
                const Icon = channel.icon
                return (
                  <li key={channel.label}>
                    <a
                      href={channel.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 border border-border bg-card p-3 no-underline transition-colors hover:border-brand"
                    >
                      <Icon size={18} className="mt-0.5 shrink-0 text-brand-strong" aria-hidden="true" />
                      <span className="min-w-0">
                        <strong className="block text-sm text-foreground">{channel.label}</strong>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{channel.note}</span>
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="space-y-2">
            <p className="m-0 text-xs font-bold uppercase tracking-wider text-muted-foreground">No site</p>
            <div className="grid gap-2">
              <Button type="button" variant="outline" className="min-h-11 justify-start" onClick={copyLink}>
                <Link2 size={16} aria-hidden="true" />
                {copied ? 'Link copiado ✓' : 'Copiar link da pesquisa'}
              </Button>
              {printHref && (
                <Button asChild variant="outline" className="min-h-11 justify-start">
                  <a href={printHref}>
                    <Printer size={16} aria-hidden="true" />
                    Imprimir ficha A4
                  </a>
                </Button>
              )}
              {caseId && (
                <Button asChild variant="outline" className="min-h-11 justify-start">
                  <a href={`/casos/acoes/${caseId}/`}>
                    <Copy size={16} aria-hidden="true" />
                    Abrir página completa de cobrança
                  </a>
                </Button>
              )}
              {showComplaint && !caseId && (
                <Button asChild variant="outline" className="min-h-11 justify-start">
                  <a href="https://www.consumidor.gov.br/">
                    <ClipboardList size={16} aria-hidden="true" />
                    Registrar no Consumidor.gov
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

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
import { absoluteShareUrl, buildSharePayload } from '@/lib/share-messages'

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
  /** Ready confrontational message; when omitted, built from title/summary/caseId. */
  message?: string
  /** Absolute URL already resolved for OG; when omitted, derived from href. */
  shareUrl?: string
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
  message: messageProp,
  shareUrl: shareUrlProp,
}: Props) {
  const [copied, setCopied] = useState(false)
  const payload = buildSharePayload({
    title,
    href,
    summary,
    caseId,
  })
  const url = shareUrlProp || payload.url || absoluteShareUrl(href)
  const message = messageProp || payload.message
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(message)}`
  const channels = [
    {
      label: 'WhatsApp',
      href: whatsapp,
      icon: MessageCircle,
      note: 'Mensagem pronta + link com preview de imagem.',
      emphasize: true,
    },
    {
      label: 'X',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title.slice(0, 115)}`)}&url=${encodeURIComponent(url)}`,
      icon: Share2,
      note: 'Publicação curta com o endereço da pesquisa.',
      emphasize: false,
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: Share2,
      note: 'Abre o compartilhador oficial — a imagem OG acompanha o link.',
      emphasize: false,
    },
    {
      label: 'Telegram',
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`,
      icon: Share2,
      note: 'Encaminhe o caso para um chat ou canal.',
      emphasize: false,
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

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copie a mensagem', message)
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
          <SheetTitle>Espalhe o dossiê completo</SheetTitle>
          <SheetDescription>
            WhatsApp leva a mensagem pronta. O link no final abre a página com imagem de preview (OG 1200×630).
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 py-5">
          <div className="space-y-1 border-l-4 border-[#25D366] bg-muted p-4">
            <p className="m-0 text-xs font-bold uppercase tracking-wider text-[#128C7E]">Mensagem pronta</p>
            <pre className="m-0 whitespace-pre-wrap font-sans text-sm font-semibold leading-snug text-foreground">
              {message}
            </pre>
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
                      className={cn(
                        'flex items-start gap-3 border p-3 no-underline transition-colors',
                        channel.emphasize
                          ? 'border-[#25D366]/60 bg-[#25D366]/10 hover:border-[#128C7E]'
                          : 'border-border bg-card hover:border-brand',
                      )}
                    >
                      <Icon
                        size={18}
                        className={cn('mt-0.5 shrink-0', channel.emphasize ? 'text-[#128C7E]' : 'text-brand-strong')}
                        aria-hidden="true"
                      />
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
              <Button type="button" variant="outline" className="min-h-11 justify-start" onClick={copyMessage}>
                <Copy size={16} aria-hidden="true" />
                {copied ? 'Copiado ✓' : 'Copiar mensagem + link'}
              </Button>
              <Button type="button" variant="outline" className="min-h-11 justify-start" onClick={copyLink}>
                <Link2 size={16} aria-hidden="true" />
                Copiar só o link (para preview OG)
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

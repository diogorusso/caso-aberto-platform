'use client'

import { MessageCircle } from 'lucide-react'
import ShareDrawer from './ShareDrawer'
import { buildSharePayload } from '@/lib/share-messages'
import { cn } from '@/lib/utils'

type Props = {
  title: string
  href: string
  summary?: string
  company?: string
  caseId?: string
  className?: string
}

export default function CaseCardShareActions({
  title,
  href,
  summary = '',
  company,
  caseId,
  className,
}: Props) {
  const share = buildSharePayload({ caseId, title, href, summary, company })

  return (
    <div
      className={cn('flex flex-wrap items-center gap-2', className)}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <a
        href={share.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-[#128C7E] px-3 py-1.5 text-xs font-extrabold text-white no-underline transition-colors hover:bg-[#075E54] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
        aria-label={`Mandar no WhatsApp: ${title}`}
      >
        <MessageCircle size={14} aria-hidden="true" />
        WhatsApp
      </a>
      <ShareDrawer
        title={title}
        href={href}
        summary={summary}
        caseId={caseId}
        showComplaint={false}
        triggerLabel="Compartilhar"
        size="sm"
        message={share.message}
        shareUrl={share.url}
        className="min-h-9 border-border px-3 text-xs"
      />
    </div>
  )
}

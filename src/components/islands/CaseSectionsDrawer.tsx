'use client'

import { ArrowUpRight, Layers3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export type CaseSectionLink = {
  label: string
  hint: string
  href: string
}

export type CaseSectionGroup = {
  label: string
  pitch: string
  sections: CaseSectionLink[]
}

type Props = {
  groups: CaseSectionGroup[]
  triggerLabel?: string
}

/** Secondary case IA: SEO pages stay as real routes; this drawer only helps discovery. */
export default function CaseSectionsDrawer({
  groups,
  triggerLabel = 'Mais páginas deste caso',
}: Props) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" className="min-h-11">
          <Layers3 size={16} aria-hidden="true" />
          {triggerLabel}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="border-b border-border text-left">
          <SheetTitle>Escolha uma página</SheetTitle>
          <SheetDescription>
            Cada item abre uma URL própria para SEO e compartilhamento. O resumo principal continua na página atual.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 px-4 py-5">
          {groups.map((group) => (
            <section key={group.label} className="space-y-3">
              <div>
                <h3 className="m-0 text-sm font-bold uppercase tracking-wider text-brand-strong">{group.label}</h3>
                <p className="mb-0 mt-1 text-xs text-muted-foreground">{group.pitch}</p>
              </div>
              <ul className="m-0 grid list-none gap-2 p-0">
                {group.sections.map((section) => (
                  <li key={section.href}>
                    <a
                      href={section.href}
                      className="flex items-start justify-between gap-3 border border-border bg-card p-3 no-underline transition-colors hover:border-brand"
                    >
                      <span className="min-w-0">
                        <strong className="block text-sm text-foreground">{section.label}</strong>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{section.hint}</span>
                      </span>
                      <ArrowUpRight size={16} className="mt-0.5 shrink-0 text-brand-strong" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}

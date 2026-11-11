import { motion, useReducedMotion } from "motion/react"
import {
  FolderSearch,
  Link2,
  CalendarClock,
  MessageSquareQuote,
  UsersRound,
  ClipboardList,
  Scale,
  Layers3,
} from "lucide-react"

export type ResearchMetricCard = {
  label: string
  value: string
  note: string
  href: string
  cta: string
}

const icons = [
  FolderSearch,
  Link2,
  CalendarClock,
  MessageSquareQuote,
  UsersRound,
  ClipboardList,
  Scale,
  Layers3,
]

type Props = {
  cards: readonly ResearchMetricCard[]
  reviewedAt: string
}

export default function ResearchMetricsBoard({ cards, reviewedAt }: Props) {
  const reduceMotion = useReducedMotion()
  const date = reviewedAt.split("-").reverse().join("/")

  return (
    <section className="border-y border-border bg-muted py-8 md:py-12" aria-labelledby="research-kpis-title">
      <div className="container space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="m-0 text-xs font-bold uppercase tracking-[.14em] text-brand-strong">
              Observatório · base documentada
            </p>
            <h2 id="research-kpis-title" className="mb-1 mt-2 text-2xl leading-tight md:text-3xl">
              A cobrança tem números. E cada número tem fonte.
            </h2>
            <p className="m-0 text-sm text-muted-foreground">Arquivo atualizado em {date}</p>
          </div>
          <a
            className="inline-flex min-h-11 items-center text-sm font-semibold text-link"
            href="/instituto/dados/pesquisa.json"
          >
            Auditar todos os números ↗
          </a>
        </header>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
          {cards.map((card, index) => {
            const Icon = icons[index % icons.length]
            return (
              <motion.a
                key={card.label}
                href={card.href}
                className="group flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-card px-3.5 py-4 no-underline transition-colors hover:border-brand-strong focus-visible:ring-2 focus-visible:ring-brand sm:p-5"
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                whileHover={reduceMotion ? undefined : { y: -2 }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[.68rem] font-bold uppercase leading-snug tracking-wide text-muted-foreground sm:text-xs">
                    {card.label}
                  </span>
                  <Icon size={17} className="shrink-0 text-brand-strong" aria-hidden="true" />
                </div>
                <strong className="block text-3xl font-extrabold leading-none tracking-tight tabular-nums text-foreground sm:text-4xl">
                  {card.value}
                </strong>
                <p className="m-0 flex-1 text-[.73rem] leading-snug text-muted-foreground sm:text-xs">{card.note}</p>
                <span className="text-xs font-semibold text-link group-hover:underline">{card.cta} ↗</span>
              </motion.a>
            )
          })}
        </div>

        <p className="m-0 text-xs leading-relaxed text-muted-foreground">
          Casos, reclamações, histórias e fontes são contagens diferentes. Nenhuma delas equivale à quantidade de
          pessoas únicas.{" "}
          <a className="text-link font-semibold" href="/instituto/dados/pesquisa.json">
            Conferir critérios e registros ↗
          </a>
        </p>
      </div>
    </section>
  )
}

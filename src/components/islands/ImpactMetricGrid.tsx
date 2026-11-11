import { motion, useReducedMotion } from "motion/react"
import { Wallet, Clock3, Files, Network } from "lucide-react"
import { cn } from "@/lib/utils"

export type ImpactMetric = {
  label: string
  value: string
  note: string
  href?: string
}

const icons = [Wallet, Clock3, Files, Network]

type Props = {
  metrics: ImpactMetric[]
  className?: string
}

/** Equal-height KPI tiles. Sources live in the impact drawer — no per-card link footers. */
export default function ImpactMetricGrid({ metrics, className }: Props) {
  const reduceMotion = useReducedMotion()

  return (
    <div className={cn("case-story-grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {metrics.map((metric, index) => {
        const Icon = icons[index % icons.length]
        return (
          <motion.article
            key={`${metric.label}-${index}`}
            className="case-story-card border-t-[3px] border-t-brand-strong"
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.4, delay: reduceMotion ? 0 : index * 0.05, ease: [0.22, 1, 0.36, 1] }}
            whileHover={reduceMotion ? undefined : { y: -2 }}
          >
            <div className="flex min-h-10 items-start justify-between gap-3">
              <span className="line-clamp-2 text-[0.68rem] font-bold uppercase leading-snug tracking-[0.08em] text-muted-foreground">
                {metric.label}
              </span>
              <Icon size={16} className="mt-0.5 shrink-0 text-brand-strong" aria-hidden="true" />
            </div>
            <strong className="block break-words text-[1.75rem] font-extrabold leading-none tracking-tight tabular-nums md:text-[2rem]">
              {metric.value}
            </strong>
            <p className="m-0 line-clamp-3 min-h-[3.6em] flex-1 text-xs leading-relaxed text-muted-foreground">
              {metric.note}
            </p>
          </motion.article>
        )
      })}
    </div>
  )
}

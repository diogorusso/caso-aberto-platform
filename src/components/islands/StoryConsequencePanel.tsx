import { motion, useReducedMotion } from "motion/react"
import { AlertTriangle, FileSearch } from "lucide-react"

type Props = {
  worstCase: string
  threshold: string
}

/** Two equal cards stacked with the same gap/padding as the rest of the impact grid. */
export default function StoryConsequencePanel({ worstCase, threshold }: Props) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className="case-story-grid h-full grid-rows-2"
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <article className="case-story-card border-t-[3px] border-t-brand-strong">
        <div className="flex items-center gap-2 text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-brand-strong">
          <AlertTriangle size={15} aria-hidden="true" /> Se a situação continuar
        </div>
        <h3 className="m-0 text-lg leading-snug md:text-xl">
          Qual consequência não pode ser ignorada?
        </h3>
        <p className="m-0 flex-1 text-sm leading-relaxed text-foreground/90">{worstCase}</p>
      </article>
      <article className="case-story-card">
        <div className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          <FileSearch size={15} aria-hidden="true" /> O que muda o status
        </div>
        <p className="m-0 flex-1 text-sm leading-relaxed text-foreground/90">{threshold}</p>
      </article>
    </motion.div>
  )
}

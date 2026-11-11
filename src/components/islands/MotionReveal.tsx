import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

type Props = {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  as?: "div" | "section" | "article" | "li"
}

/** Light entrance polish for static content islands. Honors reduced motion. */
export default function MotionReveal({
  children,
  className,
  delay = 0,
  y = 14,
  as = "div",
}: Props) {
  const reduceMotion = useReducedMotion()
  const Tag = motion[as]

  return (
    <Tag
      className={cn(className)}
      initial={reduceMotion ? false : { opacity: 0, y }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  )
}

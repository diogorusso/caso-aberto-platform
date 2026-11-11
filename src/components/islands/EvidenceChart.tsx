import { useMemo } from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { BookOpenText, ChartNoAxesCombined, ExternalLink } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

export type EvidencePoint = { date: string; title: string; url?: string }
export type EvidenceBar = { label: string; value: number }

type Props = {
  title: string
  description: string
  points: EvidencePoint[]
  bars?: EvidenceBar[]
  sourceUrl?: string
  className?: string
}

const dateLabel = (value: string) => value.split("-").reverse().join("/")
const tick = (value: number) => value.toLocaleString("pt-BR")

const shortBarLabel = (label: string) => {
  const map: Record<string, string> = {
    "Não resolvidas na consulta": "Não resolvidas",
    "Em réplica": "Em réplica",
    "Respondidas (não necessariamente resolvidas)": "Respondidas",
    Resolvidas: "Resolvidas",
    "A confirmar na origem": "A confirmar",
  }
  return map[label] || (label.length > 22 ? `${label.slice(0, 20)}…` : label)
}

const chartConfig = {
  cumulative: { label: "Marcos acumulados", color: "var(--brand-strong)" },
  value: { label: "Registros", color: "var(--brand-strong)" },
} satisfies ChartConfig

function buildTimeline(points: EvidencePoint[]) {
  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date))
  const grouped: Array<{ date: string; total: number; titles: string[] }> = []
  for (const point of sorted) {
    const last = grouped[grouped.length - 1]
    if (last && last.date === point.date) {
      last.total += 1
      last.titles.push(point.title)
    } else {
      grouped.push({ date: point.date, total: 1, titles: [point.title] })
    }
  }
  let running = 0
  return grouped.map((row) => {
    running += row.total
    return {
      date: row.date,
      label: dateLabel(row.date),
      step: row.total,
      cumulative: running,
      detail: row.titles.join("; "),
    }
  })
}

export default function EvidenceChart({
  title,
  description,
  points,
  bars,
  sourceUrl,
  className,
}: Props) {
  const reduceMotion = useReducedMotion()
  const barItems = useMemo(
    () =>
      (bars || [])
        .filter((item) => item.value > 0)
        .map((item) => ({
          ...item,
          short: shortBarLabel(item.label),
        })),
    [bars]
  )
  const timeline = useMemo(() => buildTimeline(points), [points])
  const total = points.length
  const mode = barItems.length ? "bars" : "timeline"
  const barHeight = Math.max(220, 36 + barItems.length * 42)

  return (
    <motion.div
      className={cn("case-data-chart flex h-full min-h-0 flex-col border border-border bg-card", className)}
      aria-labelledby="chart-title"
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-start justify-between gap-4 border-b border-border p-5">
        <div className="min-w-0 space-y-2">
          <p className="m-0 flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-brand-strong">
            <ChartNoAxesCombined size={15} aria-hidden="true" /> Dados documentados
          </p>
          <h3 id="chart-title" className="m-0 text-xl leading-snug md:text-[1.45rem]">
            {title}
          </h3>
          <p className="m-0 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <span className="shrink-0 border border-border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wide text-muted-foreground">
          {mode === "bars" ? "Barras" : "Cronologia"}
        </span>
      </div>

      {mode === "bars" ? (
        <div className="flex-1 p-5">
          <ChartContainer config={chartConfig} className="w-full aspect-auto" style={{ height: barHeight }}>
            <BarChart
              accessibilityLayer
              layout="vertical"
              data={barItems}
              margin={{ left: 4, right: 16, top: 4, bottom: 4 }}
            >
              <CartesianGrid horizontal={false} strokeDasharray="3 5" />
              <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tickFormatter={tick} />
              <YAxis
                type="category"
                dataKey="short"
                width={118}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <ChartTooltip
                cursor={{ fill: "var(--muted)" }}
                content={
                  <ChartTooltipContent
                    indicator="dot"
                    labelFormatter={(_, payload) => {
                      const row = payload?.[0]?.payload as { label?: string } | undefined
                      return row?.label || ""
                    }}
                  />
                }
              />
              <Bar
                dataKey="value"
                fill="var(--color-value)"
                radius={0}
                barSize={22}
                isAnimationActive={!reduceMotion}
                animationDuration={700}
              />
            </BarChart>
          </ChartContainer>
        </div>
      ) : timeline.length > 0 ? (
        <div className="flex flex-1 flex-col gap-3 p-5">
          <ChartContainer config={chartConfig} className="h-[240px] w-full aspect-auto">
            <AreaChart accessibilityLayer data={timeline} margin={{ left: 4, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 5" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={28} tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={36} tickFormatter={tick} />
              <ChartTooltip
                cursor={{ stroke: "var(--border)" }}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    labelFormatter={(_, payload) => {
                      const row = payload?.[0]?.payload as { label?: string; detail?: string } | undefined
                      return row?.label || ""
                    }}
                    formatter={(value, _name, item) => (
                      <div className="flex w-full flex-col gap-1">
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Acumulado</span>
                          <span className="font-mono font-medium tabular-nums">{tick(Number(value))}</span>
                        </div>
                        {item?.payload?.detail ? (
                          <p className="m-0 max-w-[16rem] text-[0.7rem] leading-snug text-muted-foreground">
                            {String(item.payload.detail)}
                          </p>
                        ) : null}
                      </div>
                    )}
                  />
                }
              />
              <Area
                type="stepAfter"
                dataKey="cumulative"
                stroke="var(--color-cumulative)"
                fill="var(--color-cumulative)"
                fillOpacity={0.12}
                strokeWidth={3}
                isAnimationActive={!reduceMotion}
                animationDuration={900}
                dot={{ r: 3, fill: "var(--color-cumulative)", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ChartContainer>
          <p className="m-0 text-xs text-muted-foreground">
            <BookOpenText size={13} className="mr-1 inline-block align-[-2px]" aria-hidden="true" />
            Cada degrau representa um marco registrado, não uma medida de dano nem um novo caso individual.
          </p>
        </div>
      ) : (
        <p className="p-6 text-sm text-muted-foreground">Nenhum marco datado catalogado.</p>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4 text-xs text-muted-foreground">
        <span>
          {mode === "bars"
            ? `${tick(barItems.reduce((sum, item) => sum + item.value, 0))} registros na distribuição exibida`
            : `${tick(total)} marcos no recorte do dossiê`}
        </span>
        {sourceUrl ? (
          <a
            href={sourceUrl}
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-brand-strong transition-opacity hover:opacity-80"
          >
            Conferir origem <ExternalLink size={13} aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </motion.div>
  )
}

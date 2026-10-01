import type { ReactNode } from "react"
import { ArrowUpRight, Check, Circle, CircleDot, Clock, Undo2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { countdown, fmt, range, today, dow } from "@/lib/date"
import { photoUrl, type Model } from "@/data"
import { busyOn, label, useStore, type Cell } from "@/store"

/** Double-bezel container: tinted tray + paper core. */
export function Bezel({ className, inner, children }: { className?: string; inner?: string; children: ReactNode }) {
  return (
    <div className={cn("shell", className)}>
      <div className={cn("core h-full", inner)}>{children}</div>
    </div>
  )
}

export function PageHeader({ eyebrow, title, sub, actions }: { eyebrow: string; title: ReactNode; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-6">
      <div>
        <div className="eyebrow mb-2"><i className="size-1.5 rounded-full bg-clay" />{eyebrow}</div>
        <h1 className="font-serif text-[44px] leading-[0.95] tracking-[-0.02em]">{title}</h1>
        {sub && <p className="mt-2 max-w-[60ch] text-[13.5px] text-muted-foreground">{sub}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

/** Primary pill CTA with nested trailing icon ("button-in-button"). */
export function Cta({ children, onClick, disabled, icon = <ArrowUpRight className="size-4" />, variant = "ink", type = "button", className }: {
  children: ReactNode; onClick?: () => void; disabled?: boolean; icon?: ReactNode; variant?: "ink" | "ghost" | "clay"; type?: "button" | "submit"; className?: string
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group t-soft inline-flex h-11 items-center gap-3 rounded-full py-1.5 pr-1.5 pl-5 text-[13.5px] font-medium active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45",
        variant === "ink" && "bg-ink text-paper hover:bg-ink-2",
        variant === "clay" && "bg-clay text-paper hover:bg-clay-ink",
        variant === "ghost" && "bg-ink/5 text-ink ring-1 ring-ink/10 ring-inset hover:bg-ink/8",
        className,
      )}
    >
      {children}
      <span className={cn(
        "t-soft grid size-8 place-items-center rounded-full group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105",
        variant === "ghost" ? "bg-paper shadow-[0_2px_8px_-2px_rgba(70,45,25,.25)]" : "bg-paper/15",
      )}>{icon}</span>
    </button>
  )
}

export function Chip({ active, onClick, children, className }: { active?: boolean; onClick?: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "t-soft inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[12.5px] ring-1 ring-inset",
        active ? "bg-ink text-paper ring-ink" : "bg-paper text-ink-2 ring-ink/12 hover:ring-ink/30",
        className,
      )}
    >
      {children}
    </button>
  )
}

export function Photo({ model, size = 36, className }: { model: Model; size?: number; className?: string }) {
  return (
    <img
      src={photoUrl(model.photo)}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      className={cn("shrink-0 rounded-full bg-sand object-cover", className)}
      style={{ width: size, height: size }}
    />
  )
}

/* ---------- Response states: always icon + text label, never colour alone ---------- */
export const CELL_STYLE: Record<Cell, string> = {
  first: "bg-clay text-paper",
  second: "bg-clay-soft text-clay-ink ring-1 ring-inset ring-clay/40 hatch",
  ng: "bg-[#E4DDD2] text-ink-2",
  waiting: "bg-paper text-muted-foreground border border-dashed border-ink/30",
  confirmed: "bg-ink text-paper",
  released: "bg-transparent text-muted-foreground line-through decoration-ink/40",
}
const CELL_ICON: Record<Cell, ReactNode> = {
  first: <CircleDot className="size-3.5" />,
  second: <Circle className="size-3.5" />,
  ng: <X className="size-3.5" />,
  waiting: <Clock className="size-3.5" />,
  confirmed: <Check className="size-3.5" />,
  released: <Undo2 className="size-3.5" />,
}
export function StatePill({ state, className }: { state: Cell; className?: string }) {
  return (
    <span className={cn("inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium whitespace-nowrap", CELL_STYLE[state], className)}>
      {CELL_ICON[state]}
      {label(state)}
    </span>
  )
}

export function Countdown({ deadline, now, className }: { deadline: number; now: number; className?: string }) {
  const c = countdown(deadline, now)
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 font-mono text-[11px] tabular-nums whitespace-nowrap",
        c.over ? "bg-ink/6 text-muted-foreground" : c.urgent ? "bg-clay-soft text-clay-ink ring-1 ring-inset ring-clay/35" : "bg-sage-soft text-sage-ink",
        className,
      )}
    >
      <Clock className="size-3" />
      {c.label}
    </span>
  )
}

/* ---------- 30-day availability strip ---------- */
export const DAY_STYLE = {
  free: "bg-paper ring-1 ring-inset ring-ink/10",
  job: "bg-ink",
  audition: "bg-sage",
  unavailable: "bg-sand hatch ring-1 ring-inset ring-ink/15",
  google: "bg-sand hatch ring-1 ring-inset ring-ink/15",
} as const

export function AvailStrip({ modelId, days = 30, from = today() }: { modelId: string; days?: number; from?: string }) {
  const s = useStore()
  return (
    <div className="flex gap-[2px]" aria-label="Availability next 30 days">
      {range(from, days).map((d) => {
        const b = busyOn(s, modelId, d)
        const weekend = ["Sat", "Sun"].includes(dow(d))
        return (
          <span
            key={d}
            title={b ? b.reason : `Free ${fmt(d)}`}
            className={cn("h-4 w-[5px] rounded-[2px]", DAY_STYLE[b?.kind ?? "free"], !b && weekend && "bg-cream")}
          />
        )
      })}
    </div>
  )
}

export function Legend({ items }: { items: [string, string][] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-muted-foreground">
      {items.map(([cls, text]) => (
        <span key={text} className="inline-flex items-center gap-1.5">
          <i className={cn("block size-3 rounded-[3px]", cls)} />
          {text}
        </span>
      ))}
    </div>
  )
}

export function Stat({ label: l, value, hint, className }: { label: string; value: ReactNode; hint?: ReactNode; className?: string }) {
  return (
    <Bezel className={className} inner="p-5">
      <div className="eyebrow">{l}</div>
      <div className="mt-3 font-serif text-[46px] leading-none tracking-[-0.02em] tabular-nums">{value}</div>
      {hint && <div className="mt-2 text-[12.5px] text-muted-foreground">{hint}</div>}
    </Bezel>
  )
}

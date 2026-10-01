import { useEffect, useState } from "react"
import { CalendarCheck, ChevronLeft, ChevronRight, Link2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Bezel, Cta, DAY_STYLE, Legend, PageHeader } from "@/components/bits"
import { ME_MODEL } from "@/data"
import { between, fmtDow, monthGrid, monthLabel, parse, range, today } from "@/lib/date"
import { label, useNow, useStore, type State } from "@/store"

export const CAL_LEGEND: [string, string][] = [
  [DAY_STYLE.free, "Free"],
  [DAY_STYLE.job, "Job"],
  [DAY_STYLE.audition, "Audition"],
  ["bg-clay-soft ring-1 ring-inset ring-clay/40", "On keep"],
  [DAY_STYLE.unavailable, "Unavailable"],
]

type DayInfo = { kind: "job" | "audition" | "google" | "unavailable" | "hold" | "free"; text?: string }
function dayInfo(s: State, d: string, now: number): DayInfo {
  const b = s.bookings.find((x) => x.modelId === ME_MODEL && x.date === d)
  if (b) return { kind: b.kind, text: b.title }
  const g = s.gcalConnected && s.gcalEvents.find((e) => e.date === d)
  if (g) return { kind: "google", text: g.title }
  if (s.models[0].unavailable.includes(d)) return { kind: "unavailable", text: "Unavailable" }
  const hold = s.requests.find((r) => r.deadline > now - 86_400_000 && r.replies[ME_MODEL]?.answers[d] && r.replies[ME_MODEL].answers[d] !== "ng" && !r.decisions[ME_MODEL]?.[d])
  if (hold) return { kind: "hold", text: `${label(hold.replies[ME_MODEL].answers[d])} · ${hold.title}` }
  return { kind: "free" }
}

const CELL: Record<DayInfo["kind"], string> = {
  free: "bg-paper ring-1 ring-inset ring-ink/8 hover:ring-ink/25",
  job: "bg-ink text-paper",
  audition: "bg-sage text-paper",
  google: "bg-sand hatch ring-1 ring-inset ring-ink/15 text-ink-2",
  unavailable: "bg-sand hatch ring-1 ring-inset ring-ink/15 text-ink-2",
  hold: "bg-clay-soft text-clay-ink ring-1 ring-inset ring-clay/40",
}

export function MonthCell({ date, inMonth, compact, highlight, preview, onDown, onEnter, onToggle }: {
  date: string; inMonth: boolean; compact?: boolean; highlight?: boolean; preview?: boolean
  onDown?: () => void; onEnter?: () => void; onToggle?: () => void
}) {
  const s = useStore()
  const now = useNow(60000)
  const info = dayInfo(s, date, now)
  const past = date < today()
  if (!inMonth) return <span className={compact ? "h-9" : "h-[92px]"} />
  const toggleable = !compact && !past && (info.kind === "free" || info.kind === "unavailable")
  const Tag = compact ? "div" : "button"
  return (
    <Tag
      {...(!compact && {
        type: "button" as const,
        disabled: !toggleable,
        onPointerDown: (e: React.PointerEvent) => { e.preventDefault(); onDown?.() },
        onClick: (e: React.MouseEvent) => { if (e.detail === 0) onToggle?.() }, // keyboard activation
        onMouseEnter: onEnter,
        "aria-label": `${fmtDow(date)}: ${info.text ?? "Free"}${toggleable ? ". Toggle availability" : ""}`,
        "aria-pressed": info.kind === "unavailable",
      })}
      title={info.text}
      className={cn(
        "t-soft relative flex flex-col rounded-xl text-left select-none",
        compact ? "h-9 items-center justify-center rounded-lg text-[11.5px]" : "h-[92px] p-2 text-[12px]",
        CELL[info.kind],
        past && "opacity-45",
        toggleable && "cursor-pointer",
        preview && "ring-2 ring-clay ring-inset",
        highlight && "outline-2 outline-offset-1 outline-clay",
      )}
    >
      <span className={cn("tabular-nums", !compact && "font-medium", date === today() && "underline decoration-clay decoration-2 underline-offset-4")}>{parse(date).getDate()}</span>
      {!compact && info.text && <span className="mt-auto line-clamp-2 text-[10.5px] leading-tight opacity-90">{info.text}</span>}
    </Tag>
  )
}

export default function MyCalendar() {
  const s = useStore()
  const now = useNow(60000)
  const [cursor, setCursor] = useState(() => ({ y: new Date().getFullYear(), m: new Date().getMonth() }))
  const [drag, setDrag] = useState<{ from: string; to: string; makeUnavailable: boolean } | null>(null)
  const [syncing, setSyncing] = useState(false)
  const me = s.models.find((m) => m.id === ME_MODEL)!

  // Commit a click or drag range on mouseup anywhere.
  useEffect(() => {
    if (!drag) return
    const up = () => {
      const days = between(drag.from, drag.to).filter((d) => d >= today() && !s.bookings.some((b) => b.modelId === ME_MODEL && b.date === d))
      s.setDays(ME_MODEL, days, drag.makeUnavailable)
      if (days.length > 1) s.toast(`${days.length} days marked ${drag.makeUnavailable ? "unavailable" : "available"}`)
      setDrag(null)
    }
    window.addEventListener("pointerup", up)
    return () => window.removeEventListener("pointerup", up)
  }, [drag, s])

  const preview = drag ? new Set(between(drag.from, drag.to)) : new Set<string>()
  const upcoming = range(today(), 60).map((d) => ({ d, info: dayInfo(s, d, now) })).filter((x) => x.info.kind !== "free" && x.info.kind !== "unavailable").slice(0, 8)
  const freeNext30 = range(today(), 30).filter((d) => dayInfo(s, d, now).kind === "free").length

  const connect = () => {
    if (s.gcalConnected) { s.setGcal(false); return }
    setSyncing(true)
    setTimeout(() => { s.setGcal(true); setSyncing(false); s.toast(`Google Calendar connected · ${s.gcalEvents.length} busy events imported`) }, 900)
  }

  return (
    <>
      <PageHeader
        eyebrow="My calendar"
        title={<>Free on <em className="italic">{freeNext30}</em> of the next 30 days</>}
        sub="Click a day to mark it unavailable, or drag across days. Agencies see this instantly when they match a brief, so no more re-sending a doc of free dates."
        actions={
          <Cta variant={s.gcalConnected ? "ghost" : "ink"} onClick={connect} disabled={syncing} icon={s.gcalConnected ? <CalendarCheck className="size-4" /> : <Link2 className="size-4" />}>
            {syncing ? "Connecting…" : s.gcalConnected ? "Google Calendar connected" : "Connect Google Calendar"}
          </Cta>
        }
      />
      <div className="grid grid-cols-12 items-start gap-5">
        <Bezel className="col-span-9" inner="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-[30px] leading-none">{monthLabel(cursor.y, cursor.m)}</h2>
            <div className="flex items-center gap-1.5">
              <button aria-label="Previous month" onClick={() => setCursor((p) => { const d = new Date(p.y, p.m - 1, 1); return { y: d.getFullYear(), m: d.getMonth() } })} className="t-soft grid size-9 place-items-center rounded-full ring-1 ring-ink/10 ring-inset hover:bg-ink/5"><ChevronLeft className="size-4" /></button>
              <button aria-label="Next month" onClick={() => setCursor((p) => { const d = new Date(p.y, p.m + 1, 1); return { y: d.getFullYear(), m: d.getMonth() } })} className="t-soft grid size-9 place-items-center rounded-full ring-1 ring-ink/10 ring-inset hover:bg-ink/5"><ChevronRight className="size-4" /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <span key={d} className="px-1 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">{d}</span>)}
            {monthGrid(cursor.y, cursor.m).map((d) => (
              <MonthCell
                key={d}
                date={d}
                inMonth={parse(d).getMonth() === cursor.m}
                preview={preview.has(d)}
                onDown={() => setDrag({ from: d, to: d, makeUnavailable: !me.unavailable.includes(d) })}
                onToggle={() => s.setDays(ME_MODEL, [d], !me.unavailable.includes(d))}
                onEnter={() => drag && setDrag({ ...drag, to: d })}
              />
            ))}
          </div>
          <div className="mt-4"><Legend items={CAL_LEGEND} /></div>
        </Bezel>
        <div className="col-span-3 flex flex-col gap-4">
          <Bezel inner="p-5">
            <div className="eyebrow mb-3">Coming up</div>
            <ul className="space-y-2.5">
              {upcoming.map(({ d, info }) => (
                <li key={d} className="flex gap-3">
                  <i className={cn("mt-1 size-2.5 shrink-0 rounded-[3px]", CELL[info.kind])} />
                  <div className="leading-tight">
                    <div className="font-mono text-[10.5px] text-muted-foreground">{fmtDow(d)}</div>
                    <div className="text-[13px]">{info.text}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Bezel>
          <Bezel inner="p-5 text-[12.5px] leading-relaxed text-ink-2">
            <div className="eyebrow mb-2">How agencies see you</div>
            Unavailable and booked days grey you out in agency matching with the reason, e.g. “Unavailable 12 Nov”. Keeps are soft holds and stay visible.
          </Bezel>
        </div>
      </div>
    </>
  )
}

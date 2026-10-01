import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Bezel, Chip, DAY_STYLE, Legend, PageHeader, Photo } from "@/components/bits"
import { addDays, dow, fmt, monthGrid, monthLabel, parse, range, today } from "@/lib/date"
import { busyOn, useStore } from "@/store"

export default function Schedule() {
  const s = useStore()
  const t = today()
  const [view, setView] = useState<"month" | "week">("month")
  const [month, setMonth] = useState(() => ({ y: new Date().getFullYear(), m: new Date().getMonth() }))
  const monday = (d: string) => addDays(d, -((parse(d).getDay() + 6) % 7))
  const [weekStart, setWeekStart] = useState(monday(t))
  const short = (id: string) => {
    const n = s.models.find((m) => m.id === id)!.name.split(" ")
    return n[1] ? `${n[0]} ${n[1][0]}.` : n[0]
  }

  const step = (dir: number) => {
    if (view === "week") setWeekStart(addDays(weekStart, dir * 7))
    else setMonth((p) => { const d = new Date(p.y, p.m + dir, 1); return { y: d.getFullYear(), m: d.getMonth() } })
  }

  return (
    <>
      <PageHeader
        eyebrow="Schedule"
        title={view === "month" ? monthLabel(month.y, month.m) : <>Week of {fmt(weekStart)}</>}
        sub="Jobs, auditions and days off across the whole roster."
        actions={
          <>
            <div className="flex gap-1.5">
              <Chip active={view === "month"} onClick={() => setView("month")}>Month</Chip>
              <Chip active={view === "week"} onClick={() => setView("week")}>Week</Chip>
            </div>
            <button aria-label="Previous" onClick={() => step(-1)} className="t-soft grid size-9 place-items-center rounded-full ring-1 ring-ink/10 ring-inset hover:bg-ink/5"><ChevronLeft className="size-4" /></button>
            <button onClick={() => { setMonth({ y: new Date().getFullYear(), m: new Date().getMonth() }); setWeekStart(monday(t)) }} className="t-soft h-9 rounded-full px-4 text-[12.5px] ring-1 ring-ink/10 ring-inset hover:bg-ink/5">Today</button>
            <button aria-label="Next" onClick={() => step(1)} className="t-soft grid size-9 place-items-center rounded-full ring-1 ring-ink/10 ring-inset hover:bg-ink/5"><ChevronRight className="size-4" /></button>
          </>
        }
      />
      {view === "month" ? (
        <Bezel inner="overflow-hidden">
          <div className="grid grid-cols-7 border-b border-ink/8">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="px-3 py-2.5 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">{d}</div>)}
          </div>
          <div className="grid grid-cols-7">
            {monthGrid(month.y, month.m).map((d, i) => {
              const inMonth = parse(d).getMonth() === month.m
              const events = s.bookings.filter((b) => b.date === d).sort((a, b) => a.kind.localeCompare(b.kind))
              const off = s.models.filter((m) => m.unavailable.includes(d)).length
              return (
                <div key={d} className={cn("min-h-[118px] border-ink/6 p-2", i % 7 !== 6 && "border-r", i < 35 && "border-b", !inMonth && "bg-cream/50")}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className={cn("grid size-6 place-items-center rounded-full text-[12px] tabular-nums", d === t ? "bg-clay text-paper" : inMonth ? "text-ink" : "text-ink/30")}>{parse(d).getDate()}</span>
                    {off > 0 && inMonth && <span className="font-mono text-[9.5px] text-muted-foreground">{off} off</span>}
                  </div>
                  {inMonth && (
                    <div className="flex flex-col gap-0.5">
                      {events.slice(0, 3).map((b) => (
                        <div key={b.id} title={`${short(b.modelId)} · ${b.title}`} className={cn("truncate rounded-md px-1.5 py-0.5 text-[10.5px]", b.kind === "job" ? "bg-ink text-paper" : "bg-sage text-paper")}>
                          {short(b.modelId)} · {b.title}
                        </div>
                      ))}
                      {events.length > 3 && <div className="px-1.5 text-[10.5px] text-muted-foreground">+{events.length - 3} more</div>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="border-t border-ink/8 px-5 py-3">
            <Legend items={[[DAY_STYLE.job, "Job"], [DAY_STYLE.audition, "Audition"]]} />
          </div>
        </Bezel>
      ) : (
        <Bezel inner="overflow-hidden">
          <table className="w-full table-fixed text-[12px]">
            <thead>
              <tr>
                <th className="w-[210px] px-4 py-2.5 text-left font-mono text-[10px] font-normal tracking-[0.12em] text-muted-foreground uppercase">Model</th>
                {range(weekStart, 7).map((d) => (
                  <th key={d} className={cn("px-1.5 py-2.5 text-left font-normal", d === t && "text-clay")}>
                    <span className="font-mono text-[10px] tracking-[0.1em] uppercase">{dow(d)}</span> <span className="font-serif text-[18px]">{parse(d).getDate()}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.models.map((m) => (
                <tr key={m.id} className="border-t border-ink/6">
                  <td className="px-4 py-1.5">
                    <div className="flex items-center gap-2"><Photo model={m} size={24} /><span className="truncate">{m.name}</span></div>
                  </td>
                  {range(weekStart, 7).map((d) => {
                    const b = s.bookings.find((x) => x.modelId === m.id && x.date === d)
                    const busy = busyOn(s, m.id, d)
                    return (
                      <td key={d} className="px-1 py-1">
                        {b ? (
                          <div title={b.title} className={cn("truncate rounded-md px-1.5 py-1 text-[10.5px]", b.kind === "job" ? "bg-ink text-paper" : "bg-sage text-paper")}>{b.title}</div>
                        ) : busy ? (
                          <div className={cn("rounded-md px-1.5 py-1 text-[10.5px] text-ink-2", DAY_STYLE.unavailable)}>Unavailable</div>
                        ) : (
                          <div className="h-[22px] rounded-md" />
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-ink/8 px-5 py-3">
            <Legend items={[[DAY_STYLE.job, "Job"], [DAY_STYLE.audition, "Audition"], [DAY_STYLE.unavailable, "Unavailable"]]} />
          </div>
        </Bezel>
      )}
    </>
  )
}


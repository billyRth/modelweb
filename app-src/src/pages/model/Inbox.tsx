import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Bezel, Countdown, PageHeader, StatePill } from "@/components/bits"
import { ME_MODEL } from "@/data"
import { fmt } from "@/lib/date"
import { useNow, useStore } from "@/store"

export default function ModelInbox() {
  const now = useNow(1000)
  const requests = useStore((s) => s.requests).filter((r) => r.recipients.includes(ME_MODEL))
  const bucket = (r: (typeof requests)[number]) => (r.deadline <= now ? 2 : r.replies[ME_MODEL] ? 1 : 0)
  const sorted = [...requests].sort((a, b) => bucket(a) - bucket(b) || a.deadline - b.deadline)
  const todo = sorted.filter((r) => bucket(r) === 0).length

  return (
    <>
      <PageHeader
        eyebrow="Requests"
        title={todo ? <>{todo} request{todo > 1 ? "s" : ""} <em className="italic">need an answer</em></> : "You're all caught up"}
        sub="Sorted by deadline. Answer per date — your profile is attached automatically."
      />
      <Bezel inner="overflow-hidden">
        <ul className="divide-y divide-ink/7">
          {sorted.map((r) => {
            const b = bucket(r)
            const isNew = !r.seenBy.includes(ME_MODEL) && b === 0
            const decisions = Object.values(r.decisions[ME_MODEL] ?? {})
            return (
              <li key={r.id}>
                <Link to={`/model/requests/${r.id}`} className={cn("t-soft group flex items-center gap-5 px-5 py-4 hover:bg-cream/60", b === 2 && "opacity-70")}>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ink font-serif text-[20px] text-paper">{r.agency[0]}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-muted-foreground">{r.agency}</span>
                      {isNew && <span className="rounded-full bg-clay px-2 py-px font-mono text-[10px] tracking-[0.08em] text-paper uppercase">New</span>}
                    </div>
                    <div className={cn("truncate text-[16px]", b === 0 ? "font-medium" : "")}>{r.title}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px] text-ink-2">
                      <span>{r.clientType}</span><span className="text-ink/25">·</span>
                      {r.dates.map((d) => (
                        <span key={d.date} className={cn("rounded-full px-2 py-px text-[11px]", d.kind === "audition" ? "bg-sage-soft text-sage-ink" : "bg-ink/6")}>
                          {d.kind === "audition" ? "Aud." : "Shoot"} {fmt(d.date)}
                        </span>
                      ))}
                      <span className="text-ink/25">·</span><span>{r.fee}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {decisions.includes("confirmed") ? <StatePill state="confirmed" /> : b === 1 ? <span className="rounded-full bg-sage-soft px-2.5 py-1 text-[12px] text-sage-ink">Answered</span> : null}
                    <Countdown deadline={r.deadline} now={now} />
                    <ArrowRight className="t-soft size-4 text-muted-foreground group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </Bezel>
    </>
  )
}

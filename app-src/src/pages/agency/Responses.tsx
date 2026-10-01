import { Link, Navigate, useParams } from "react-router-dom"
import { BellRing, Check, MessageSquare, Undo2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Bezel, CELL_STYLE, Countdown, Cta, Legend, PageHeader, Photo, StatePill } from "@/components/bits"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ME_AGENCY, ME_MODEL, type JobRequest } from "@/data"
import { ago, fmt, dow } from "@/lib/date"
import { cellState, label, modelById, useNow, useStore, visibleReply, type Cell } from "@/store"

export default function Responses() {
  const { id } = useParams()
  const now = useNow(1000)
  const s = useStore()
  const mine = s.requests.filter((r) => r.agency === ME_AGENCY).sort((a, b) => (a.deadline > now) === (b.deadline > now) ? a.deadline - b.deadline : a.deadline > now ? -1 : 1)
  if (!id && mine[0]) return <Navigate to={`/agency/responses/${mine[0].id}`} replace />
  const req = mine.find((r) => r.id === id)

  return (
    <>
      <PageHeader eyebrow="Responses" title="Who said yes, per date" sub="Every model × date in one grid. Click a cell to confirm or release." />
      <div className="grid grid-cols-12 items-start gap-5">
        <nav className="col-span-3 flex flex-col gap-1.5" aria-label="Requests">
          {mine.map((r) => {
            const got = r.recipients.filter((m) => visibleReply(r, m, now)).length
            return (
              <Link
                key={r.id}
                to={`/agency/responses/${r.id}`}
                className={cn(
                  "t-soft rounded-2xl p-3.5 ring-1 ring-inset",
                  r.id === id ? "bg-paper shadow-[0_20px_40px_-28px_rgba(70,45,25,.45)] ring-ink/15" : "ring-transparent hover:bg-paper/60",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground">{r.id}</span>
                  <Countdown deadline={r.deadline} now={now} className="h-5 px-2 text-[10px]" />
                </div>
                <div className="mt-1.5 truncate text-[14px] font-medium">{r.title}</div>
                <div className="mt-0.5 text-[12px] text-muted-foreground">{r.clientType} · {got}/{r.recipients.length} answered</div>
              </Link>
            )
          })}
        </nav>
        <div className="col-span-9">{req ? <Matrix req={req} now={now} /> : <Bezel inner="p-10 text-center text-muted-foreground">Request not found.</Bezel>}</div>
      </div>
    </>
  )
}

function Matrix({ req, now }: { req: JobRequest; now: number }) {
  const s = useStore()
  const waiting = req.recipients.filter((m) => !visibleReply(req, m, now))
  const open = req.deadline > now
  const nudge = () => {
    const n = s.nudge(req.id)
    s.toast(n ? `Nudged ${n} waiting model${n === 1 ? "" : "s"}` : "Everyone has answered")
  }
  const rank = (m: string) => {
    const states = req.dates.map((d) => cellState(req, m, d.date, now))
    return states.includes("confirmed") ? 0 : states.includes("first") ? 1 : states.includes("second") ? 2 : states.every((x) => x === "waiting") ? 4 : 3
  }
  const rows = [...req.recipients].sort((a, b) => rank(a) - rank(b))

  return (
    <Bezel inner="overflow-hidden">
      <div className="flex items-start justify-between gap-6 border-b border-ink/8 p-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10.5px] text-muted-foreground">{req.id}</span>
            <span className="rounded-full bg-cream px-2 py-0.5 text-[11px] text-ink-2">{req.clientType}</span>
            <span className="rounded-full bg-cream px-2 py-0.5 text-[11px] text-ink-2">{req.fee}</span>
          </div>
          <h2 className="mt-1.5 font-serif text-[32px] leading-none">{req.title}</h2>
          <p className="mt-1.5 text-[12.5px] text-muted-foreground">{req.location} · sent {ago(req.createdAt, now)}{req.nudgedAt ? ` · nudged ${ago(req.nudgedAt, now)}` : ""}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Countdown deadline={req.deadline} now={now} className="h-7 px-3 text-[12px]" />
          <Cta variant="ghost" onClick={nudge} disabled={!open || waiting.length === 0} icon={<BellRing className="size-4" />}>
            Nudge {waiting.length} waiting
          </Cta>
        </div>
      </div>

      <table className="w-full border-separate border-spacing-0 text-[13px]">
        <thead>
          <tr className="text-left">
            <th className="sticky left-0 w-[260px] px-5 py-3 font-mono text-[10px] font-normal tracking-[0.12em] text-muted-foreground uppercase">Model</th>
            {req.dates.map((d) => {
              const counts = req.recipients.map((m) => cellState(req, m, d.date, now))
              const n = (c: Cell) => counts.filter((x) => x === c).length
              return (
                <th key={d.date} className="px-3 py-3 align-bottom font-normal">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-serif text-[22px] leading-none">{fmt(d.date)}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{dow(d.date)}</span>
                  </div>
                  <div className={cn("mt-1 inline-block rounded-full px-2 py-px text-[10.5px]", d.kind === "audition" ? "bg-sage-soft text-sage-ink" : "bg-ink/6 text-ink-2")}>
                    {d.kind === "audition" ? "Audition" : "Shoot"}
                  </div>
                  <div className="mt-1.5 font-mono text-[10px] text-muted-foreground">
                    {n("confirmed")} conf · {n("first")} 1st · {n("second")} 2nd
                  </div>
                </th>
              )
            })}
            <th className="w-12" />
          </tr>
        </thead>
        <tbody>
          {rows.map((mId) => {
            const m = modelById(s, mId)
            const reply = visibleReply(req, mId, now)
            return (
              <tr key={mId} className="group">
                <td className="border-t border-ink/6 px-5 py-2.5">
                  <div className="flex items-center gap-3">
                    <Photo model={m} size={34} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 truncate font-medium">
                        {m.name}
                        {mId === ME_MODEL && <span className="rounded-full bg-clay-soft px-1.5 py-px font-mono text-[9.5px] text-clay-ink">demo</span>}
                      </div>
                      <div className="font-mono text-[10.5px] text-muted-foreground">
                        {reply ? `answered ${ago(reply.at, now)}` : open ? "no answer yet" : "did not answer"}
                      </div>
                      {reply?.note && <div className="mt-0.5 max-w-[220px] truncate text-[11.5px] text-ink-2 italic">“{reply.note}”</div>}
                    </div>
                  </div>
                </td>
                {req.dates.map((d) => (
                  <td key={d.date} className="border-t border-ink/6 px-3 py-2.5">
                    <CellMenu req={req} modelId={mId} date={d.date} state={cellState(req, mId, d.date, now)} answered={!!reply} />
                  </td>
                ))}
                <td className="border-t border-ink/6 pr-4">
                  <Link to={`/agency/messages/${mId}`} aria-label={`Message ${m.name}`} className="t-soft grid size-8 place-items-center rounded-full text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-ink/5">
                    <MessageSquare className="size-4" />
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="flex items-center justify-between border-t border-ink/8 px-5 py-3.5">
        <Legend items={[[CELL_STYLE.confirmed, "Confirmed"], [CELL_STYLE.first, "1st keep"], [CELL_STYLE.second, "2nd keep"], [CELL_STYLE.ng, "NG"], [CELL_STYLE.waiting, "Waiting"]]} />
        <span className="font-mono text-[10.5px] text-muted-foreground">{req.recipients.length - waiting.length}/{req.recipients.length} answered</span>
      </div>
    </Bezel>
  )
}

function CellMenu({ req, modelId, date, state, answered }: { req: JobRequest; modelId: string; date: string; state: Cell; answered: boolean }) {
  const decide = useStore((s) => s.decide)
  const toast = useStore((s) => s.toast)
  const name = useStore((s) => modelById(s, modelId).name)
  const original = req.replies[modelId]?.answers[date]
  const act = (d: "confirmed" | "released" | null, msg: string) => { decide(req.id, modelId, date, d); toast(msg) }
  return (
    <Popover>
      <PopoverTrigger className="t-soft rounded-full hover:scale-[1.03] focus-visible:outline-2" aria-label={`${name}, ${fmt(date)}: ${label(state)}. Change`}>
        <StatePill state={state} />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60 rounded-2xl p-1.5">
        <div className="px-2.5 pt-1.5 pb-2 text-[12px] text-muted-foreground">
          {name} · {fmt(date)}<br />
          Answer: <b className="font-medium text-ink">{original ? label(original) : answered ? "—" : "Waiting"}</b>
        </div>
        <button onClick={() => act("confirmed", `Confirmed ${name} for ${fmt(date)}`)} disabled={state === "confirmed" || (original !== "first" && original !== "second")} className="t-soft flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] hover:bg-ink/5 disabled:opacity-40">
          <Check className="size-4" /> Confirm booking
        </button>
        <button onClick={() => act("released", `Released ${name} for ${fmt(date)}`)} disabled={state === "released"} className="t-soft flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] hover:bg-ink/5 disabled:opacity-40">
          <Undo2 className="size-4" /> Release
        </button>
        {(state === "confirmed" || state === "released") && (
          <button onClick={() => act(null, "Decision cleared")} className="t-soft flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] text-muted-foreground hover:bg-ink/5">
            <X className="size-4" /> Clear decision
          </button>
        )}
      </PopoverContent>
    </Popover>
  )
}

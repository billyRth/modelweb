import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Banknote, Image, MapPin, Paperclip, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { Bezel, Countdown, Cta, Legend, StatePill } from "@/components/bits"
import { ME_MODEL, photoUrl, type Answer } from "@/data"
import { fmt, fmtDow, monthGrid, monthLabel, parse } from "@/lib/date"
import { busyOn, label, useNow, useStore } from "@/store"
import { MonthCell, CAL_LEGEND } from "./MyCalendar"

const OPTIONS: Answer[] = ["first", "second", "ng"]

// Keyed by id so per-request answer state resets when switching requests.
export default function RequestDetail() {
  const { id } = useParams()
  return <Detail key={id} id={id} />
}

function Detail({ id }: { id?: string }) {
  const nav = useNavigate()
  const now = useNow(1000)
  const s = useStore()
  const req = s.requests.find((r) => r.id === id)
  const me = s.models.find((m) => m.id === ME_MODEL)!
  const prev = req?.replies[ME_MODEL]
  const [answers, setAnswers] = useState<Record<string, Answer>>(prev?.answers ?? {})
  const [note, setNote] = useState(prev?.note ?? "")
  const markSeen = s.markSeen

  useEffect(() => { if (id) markSeen(id, ME_MODEL) }, [id, markSeen])
  if (!req) return <p className="p-10 text-muted-foreground">Request not found. <Link to="/model/inbox" className="text-clay underline">Back to inbox</Link></p>

  const open = req.deadline > now
  const complete = req.dates.every((d) => answers[d.date])
  const decisions = req.decisions[ME_MODEL] ?? {}
  const months = [...new Set(req.dates.map((d) => d.date.slice(0, 7)))].slice(0, 2)

  const submit = () => {
    s.submitReply(req.id, ME_MODEL, answers, note.trim() || undefined)
    s.toast(`Sent to ${req.agency} with your profile`)
    nav("/model/inbox")
  }

  return (
    <>
      <Link to="/model/inbox" className="t-soft mb-4 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-ink"><ArrowLeft className="size-4" /> All requests</Link>
      <div className="grid grid-cols-12 items-start gap-5">
        {/* Job */}
        <div className="col-span-5 flex flex-col gap-4">
          <Bezel inner="p-6">
            <div className="flex items-center justify-between">
              <span className="eyebrow"><i className="size-1.5 rounded-full bg-clay" />{req.agency}</span>
              <Countdown deadline={req.deadline} now={now} />
            </div>
            <h1 className="mt-3 font-serif text-[40px] leading-[0.95] tracking-[-0.02em]">{req.title}</h1>
            <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">{req.brief}</p>
            <dl className="mt-5 grid grid-cols-1 gap-2.5 text-[13px]">
              <div className="flex items-center gap-2.5"><Image className="size-4 text-muted-foreground" /><dt className="sr-only">Client</dt><dd>{req.clientType} · {req.jobType === "audition" ? "Audition" : "Shoot"}</dd></div>
              <div className="flex items-center gap-2.5"><Banknote className="size-4 text-muted-foreground" /><dt className="sr-only">Fee</dt><dd>{req.fee}</dd></div>
              <div className="flex items-center gap-2.5"><MapPin className="size-4 text-muted-foreground" /><dt className="sr-only">Location</dt><dd>{req.location}</dd></div>
            </dl>
            <div className="mt-5 border-t border-ink/8 pt-4">
              <div className="eyebrow mb-2">Dates</div>
              <ul className="space-y-1.5">
                {req.dates.map((d) => (
                  <li key={d.date} className="flex items-center gap-2 text-[13px]">
                    <span className={cn("rounded-full px-2 py-px text-[11px]", d.kind === "audition" ? "bg-sage-soft text-sage-ink" : "bg-ink/6")}>{d.kind === "audition" ? "Audition" : "Shoot"}</span>
                    {fmtDow(d.date)}
                    {decisions[d.date] && <StatePill state={decisions[d.date]} className="ml-auto" />}
                  </li>
                ))}
              </ul>
            </div>
          </Bezel>
          <Bezel inner="flex items-center gap-4 p-4">
            <div className="flex shrink-0 -space-x-3">
              {["faces", "", "bottom"].map((c, i) => (
                <img key={i} src={photoUrl(me.photo, 120, 150, c)} alt="" className="h-14 w-11 rounded-lg bg-sand object-cover ring-2 ring-paper" />
              ))}
            </div>
            <div className="text-[12.5px] leading-snug">
              <div className="flex items-center gap-1.5 font-medium"><Paperclip className="size-3.5" /> Your profile will be shared</div>
              <div className="text-muted-foreground">Photos, IG @{me.instagram}, measurements {me.height} · {me.bust}/{me.waist}/{me.hips}, experience and conflicts. <Link to="/model/profile" className="text-clay hover:underline">Edit profile</Link></div>
            </div>
          </Bezel>
        </div>

        {/* Calendar + answers */}
        <div className="col-span-7">
          <Bezel inner="p-6">
            <div className="flex items-baseline justify-between">
              <h2 className="font-serif text-[28px] leading-none">Your calendar</h2>
              <Legend items={CAL_LEGEND.filter(([, t]) => t !== "Free")} />
            </div>
            <div className={cn("mt-4 grid gap-5", months.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
              {months.map((ym) => {
                const [y, m] = ym.split("-").map(Number)
                return (
                  <div key={ym}>
                    <div className="mb-1.5 text-[12.5px] font-medium">{monthLabel(y, m - 1)}</div>
                    <div className="grid grid-cols-7 gap-1">
                      {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i} className="text-center font-mono text-[9.5px] text-muted-foreground">{d}</span>)}
                      {monthGrid(y, m - 1).map((d) => (
                        <MonthCell key={d} date={d} inMonth={parse(d).getMonth() === m - 1} compact highlight={req.dates.some((x) => x.date === d)} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 border-t border-ink/8 pt-5">
              <div className="eyebrow mb-3">Your answer per date</div>
              <ul className="space-y-2">
                {req.dates.map((d) => {
                  const busy = busyOn(s, ME_MODEL, d.date, req.id)
                  return (
                    <li key={d.date} className="flex items-center gap-4 rounded-2xl bg-cream/70 px-4 py-3 ring-1 ring-ink/6 ring-inset">
                      <div className="w-36">
                        <div className="text-[14px] font-medium">{fmtDow(d.date)}</div>
                        <div className="text-[11.5px] text-muted-foreground">{d.kind === "audition" ? "Audition" : "Shoot"}</div>
                      </div>
                      <div className={cn("flex-1 text-[12px]", busy ? "text-clay-ink" : "text-sage-ink")}>
                        {busy ? busy.reason.replace(` ${fmt(d.date)}`, "") + " that day" : "Free that day"}
                      </div>
                      <div role="radiogroup" aria-label={`Answer for ${fmt(d.date)}`} className="flex gap-1 rounded-full bg-paper p-1 ring-1 ring-ink/8 ring-inset">
                        {OPTIONS.map((o) => {
                          const on = answers[d.date] === o
                          return (
                            <button
                              key={o}
                              role="radio"
                              aria-checked={on}
                              disabled={!open}
                              onClick={() => setAnswers((p) => ({ ...p, [d.date]: o }))}
                              className={cn(
                                "t-soft h-8 rounded-full px-3.5 text-[12.5px] font-medium disabled:cursor-not-allowed",
                                on ? (o === "first" ? "bg-clay text-paper" : o === "second" ? "hatch bg-clay-soft text-clay-ink ring-1 ring-clay/40 ring-inset" : "bg-ink-2 text-paper") : "text-ink-2 hover:bg-ink/5",
                              )}
                            >
                              {label(o)}
                            </button>
                          )
                        })}
                      </div>
                    </li>
                  )
                })}
              </ul>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={!open}
                rows={2}
                placeholder="Optional note to the agency (e.g. can arrive from 11:00)"
                className="mt-3 w-full resize-none rounded-2xl bg-paper px-4 py-3 text-[13px] ring-1 ring-ink/10 ring-inset outline-none focus:ring-ink/25"
              />
              <div className="mt-4 flex items-center justify-between">
                <span className="text-[12px] text-muted-foreground">
                  {!open ? "This request is closed." : prev ? `You answered ${new Date(prev.at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}. You can update it until the deadline.` : complete ? "Ready to send." : `Answer all ${req.dates.length} dates to submit.`}
                </span>
                <Cta onClick={submit} disabled={!open || !complete} variant="clay" icon={<Send className="size-4" />}>
                  {prev ? "Update answer" : "Submit answer"}
                </Cta>
              </div>
            </div>
          </Bezel>
        </div>
      </div>
    </>
  )
}

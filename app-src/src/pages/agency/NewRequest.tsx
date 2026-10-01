import { useState, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight, Send, ShieldAlert, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Bezel, Chip, Cta, PageHeader } from "@/components/bits"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  BRIEF_OFFSETS, CLIENT_TYPES, CONFLICT_CATEGORIES, ETHNICITIES, EXPERIENCE, HAIR, LOCATIONS, ME_MODEL,
  type Criteria, type DateKind, type Gender, type ReqDate,
} from "@/data"
import { addDays, fmt, fmtDow, monthGrid, monthLabel, parse, today } from "@/lib/date"
import { matchModels, useStore } from "@/store"

const toggle = <T,>(arr: T[], v: T) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

function Section({ n, title, children, aside }: { n: string; title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <Bezel inner="p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="font-mono text-[10.5px] text-muted-foreground">{n}</span>
        <h2 className="font-serif text-[24px] leading-none">{title}</h2>
        {aside && <div className="ml-auto">{aside}</div>}
      </div>
      {children}
    </Bezel>
  )
}
function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div role="group" aria-label={label} className={cn("flex flex-col gap-2", className)}>
      <span className="eyebrow">{label}</span>
      {children}
    </div>
  )
}

export default function NewRequest() {
  const nav = useNavigate()
  const s = useStore()
  const t = today()
  const [title, setTitle] = useState("Spring running campaign — key visual")
  const [clientType, setClientType] = useState("Sportswear brand")
  const [jobType, setJobType] = useState<DateKind>("shoot")
  const [brief, setBrief] = useState("A sportswear brand wants 20s, black hair, Asian, Tokyo-based runners for a spring campaign. Light running on set.")
  const [dates, setDates] = useState<ReqDate[]>([
    { date: addDays(t, BRIEF_OFFSETS.audition), kind: "audition" },
    ...BRIEF_OFFSETS.shoot.map((n) => ({ date: addDays(t, n), kind: "shoot" as const })),
  ])
  const [fee, setFee] = useState("¥120,000 / day + 1yr usage")
  const [location, setLocation] = useState("Studio in Shibuya, Tokyo")
  const [deadlineH, setDeadlineH] = useState(6)
  const [c, setC] = useState<Criteria>({
    ageMin: 20, ageMax: 29, gender: "Any", ethnicities: ["Japanese", "East Asian", "Southeast Asian", "Mixed"], hair: ["Black"],
    heightMin: 155, heightMax: 185, experience: ["Sportswear", "Commercial", "Fitness"], location: "Tokyo area", conflictCategory: "Sportswear",
  })
  const [excluded, setExcluded] = useState<string[]>([])
  const [cursor, setCursor] = useState(() => ({ y: new Date().getFullYear(), m: new Date().getMonth() }))

  const sorted = [...dates].sort((a, b) => a.date.localeCompare(b.date))
  const { matches, filtered } = matchModels(s, c, sorted)
  const sendable = matches.filter((m) => m.busy.length === 0 && !m.conflict && !excluded.includes(m.model.id))
  const set = <K extends keyof Criteria>(k: K, v: Criteria[K]) => setC((p) => ({ ...p, [k]: v }))
  const toggleDate = (d: string) =>
    setDates((p) => (p.some((x) => x.date === d) ? p.filter((x) => x.date !== d) : [...p, { date: d, kind: jobType }]))

  const send = () => {
    const id = s.sendRequest({
      title, clientType, jobType, dates: sorted, fee, location, brief, criteria: c,
      deadline: Date.now() + deadlineH * 3_600_000, recipients: sendable.map((m) => m.model.id),
    })
    s.toast(`Sent to ${sendable.length} models${sendable.some((m) => m.model.id === ME_MODEL) ? " (incl. Aiko Tanaka)" : ""}`)
    nav(`/agency/responses/${id}`)
  }

  const months = [0, 1].map((i) => {
    const d = new Date(cursor.y, cursor.m + i, 1)
    return { y: d.getFullYear(), m: d.getMonth() }
  })

  return (
    <>
      <PageHeader eyebrow="New request" title="Brief to shortlist" sub="Fill in the client brief. Matching models update on the right, and anyone already booked on a date is greyed out with the reason." />
      <div className="grid grid-cols-12 items-start gap-5">
        <div className="col-span-7 flex flex-col gap-4">
          <Section n="01" title="The job">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Request title" className="col-span-2">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="h-10 rounded-xl bg-paper" />
              </Field>
              <Field label="Client type" className="col-span-2">
                <div className="flex flex-wrap gap-1.5">
                  {CLIENT_TYPES.map((x) => <Chip key={x} active={clientType === x} onClick={() => setClientType(x)}>{x}</Chip>)}
                </div>
              </Field>
              <Field label="Job type">
                <div className="flex gap-1.5">
                  {(["shoot", "audition"] as const).map((x) => <Chip key={x} active={jobType === x} onClick={() => setJobType(x)}>{x === "shoot" ? "Shoot" : "Audition"}</Chip>)}
                </div>
              </Field>
              <Field label="Fee">
                <Input value={fee} onChange={(e) => setFee(e.target.value)} className="h-10 rounded-xl bg-paper" />
              </Field>
              <Field label="Location">
                <Input value={location} onChange={(e) => setLocation(e.target.value)} className="h-10 rounded-xl bg-paper" />
              </Field>
              <Field label="Reply deadline">
                <div className="flex flex-wrap gap-1.5">
                  {[3, 6, 24, 48].map((h) => <Chip key={h} active={deadlineH === h} onClick={() => setDeadlineH(h)}>{h < 24 ? `In ${h}h` : `In ${h / 24}d`}</Chip>)}
                </div>
              </Field>
              <Field label="Brief for models" className="col-span-2">
                <Textarea value={brief} onChange={(e) => setBrief(e.target.value)} rows={2} className="rounded-xl bg-paper" />
              </Field>
            </div>
          </Section>

          <Section
            n="02"
            title="Dates"
            aside={
              <div className="flex items-center gap-1">
                <button aria-label="Previous month" onClick={() => setCursor((p) => ({ y: p.m === 0 ? p.y - 1 : p.y, m: (p.m + 11) % 12 }))} className="t-soft grid size-8 place-items-center rounded-full hover:bg-ink/5"><ChevronLeft className="size-4" /></button>
                <button aria-label="Next month" onClick={() => setCursor((p) => ({ y: p.m === 11 ? p.y + 1 : p.y, m: (p.m + 1) % 12 }))} className="t-soft grid size-8 place-items-center rounded-full hover:bg-ink/5"><ChevronRight className="size-4" /></button>
              </div>
            }
          >
            <div className="grid grid-cols-2 gap-6">
              {months.map(({ y, m }) => (
                <div key={`${y}-${m}`}>
                  <div className="mb-2 text-[13px] font-medium">{monthLabel(y, m)}</div>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i} className="font-mono text-[10px] text-muted-foreground">{d}</span>)}
                    {monthGrid(y, m).map((d) => {
                      const inMonth = parse(d).getMonth() === m
                      const sel = dates.find((x) => x.date === d)
                      const past = d < t
                      return (
                        <button
                          key={d}
                          disabled={!inMonth || past}
                          onClick={() => toggleDate(d)}
                          aria-pressed={!!sel}
                          aria-label={fmtDow(d)}
                          className={cn(
                            "t-soft relative h-8 rounded-lg text-[12.5px] tabular-nums",
                            !inMonth && "invisible",
                            past && "text-ink/25",
                            !sel && !past && "hover:bg-ink/6",
                            sel?.kind === "shoot" && "bg-ink text-paper",
                            sel?.kind === "audition" && "bg-sage text-paper",
                          )}
                        >
                          {parse(d).getDate()}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-ink/8 pt-4">
              {sorted.length === 0 && <span className="text-[12.5px] text-muted-foreground">Pick at least one date.</span>}
              {sorted.map((d) => (
                <span key={d.date} className="inline-flex items-center gap-1 rounded-full bg-cream py-1 pr-1 pl-3 text-[12.5px] ring-1 ring-ink/8 ring-inset">
                  {fmtDow(d.date)}
                  <button
                    onClick={() => setDates((p) => p.map((x) => (x.date === d.date ? { ...x, kind: x.kind === "shoot" ? "audition" : "shoot" } : x)))}
                    className={cn("t-soft ml-1 rounded-full px-2 py-0.5 text-[11px]", d.kind === "shoot" ? "bg-ink text-paper" : "bg-sage text-paper")}
                    title="Switch shoot / audition"
                  >
                    {d.kind === "shoot" ? "Shoot" : "Audition"}
                  </button>
                  <button aria-label={`Remove ${fmt(d.date)}`} onClick={() => toggleDate(d.date)} className="grid size-6 place-items-center rounded-full hover:bg-ink/8"><X className="size-3" /></button>
                </span>
              ))}
            </div>
          </Section>

          <Section n="03" title="Who the client wants">
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <Field label={`Age ${c.ageMin}–${c.ageMax}`}>
                <div className="flex items-center gap-2">
                  <Input type="number" value={c.ageMin} onChange={(e) => set("ageMin", +e.target.value)} className="h-9 w-20 rounded-xl bg-paper" aria-label="Minimum age" />
                  <span className="text-muted-foreground">to</span>
                  <Input type="number" value={c.ageMax} onChange={(e) => set("ageMax", +e.target.value)} className="h-9 w-20 rounded-xl bg-paper" aria-label="Maximum age" />
                </div>
              </Field>
              <Field label={`Height ${c.heightMin}–${c.heightMax} cm`}>
                <div className="flex items-center gap-2">
                  <Input type="number" value={c.heightMin} onChange={(e) => set("heightMin", +e.target.value)} className="h-9 w-20 rounded-xl bg-paper" aria-label="Minimum height" />
                  <span className="text-muted-foreground">to</span>
                  <Input type="number" value={c.heightMax} onChange={(e) => set("heightMax", +e.target.value)} className="h-9 w-20 rounded-xl bg-paper" aria-label="Maximum height" />
                </div>
              </Field>
              <Field label="Gender">
                <div className="flex flex-wrap gap-1.5">
                  {(["Any", "Female", "Male", "Non-binary"] as (Gender | "Any")[]).map((g) => <Chip key={g} active={c.gender === g} onClick={() => set("gender", g)}>{g}</Chip>)}
                </div>
              </Field>
              <Field label="Based in">
                <div className="flex flex-wrap gap-1.5">
                  {LOCATIONS.map((l) => <Chip key={l} active={c.location === l} onClick={() => set("location", l)}>{l}</Chip>)}
                </div>
              </Field>
              <Field label="Ethnicity (any of)" className="col-span-2">
                <div className="flex flex-wrap gap-1.5">
                  {ETHNICITIES.map((x) => <Chip key={x} active={c.ethnicities.includes(x)} onClick={() => set("ethnicities", toggle(c.ethnicities, x))}>{x}</Chip>)}
                </div>
              </Field>
              <Field label="Hair colour (any of)">
                <div className="flex flex-wrap gap-1.5">
                  {HAIR.map((x) => <Chip key={x} active={c.hair.includes(x)} onClick={() => set("hair", toggle(c.hair, x))}>{x}</Chip>)}
                </div>
              </Field>
              <Field label="Experience (any of)">
                <div className="flex flex-wrap gap-1.5">
                  {EXPERIENCE.map((x) => <Chip key={x} active={c.experience.includes(x)} onClick={() => set("experience", toggle(c.experience, x))}>{x}</Chip>)}
                </div>
              </Field>
              <Field label="Conflicts" className="col-span-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-[13px] text-ink-2">No competing</span>
                  {CONFLICT_CATEGORIES.map((x) => <Chip key={x} active={c.conflictCategory === x} onClick={() => set("conflictCategory", c.conflictCategory === x ? null : x)}>{x}</Chip>)}
                  <span className="ml-1 text-[13px] text-ink-2">ads in the last 12 months</span>
                </div>
              </Field>
            </div>
          </Section>
        </div>

        {/* Live matching */}
        <div className="sticky top-[76px] col-span-5">
          <Bezel inner="flex max-h-[calc(100vh-100px)] flex-col">
            <div className="border-b border-ink/8 px-5 pt-5 pb-4">
              <div className="flex items-baseline justify-between">
                <h2 className="font-serif text-[28px] leading-none">Live matching</h2>
                <span className="font-mono text-[10.5px] text-muted-foreground">{filtered} filtered out</span>
              </div>
              <p className="mt-1.5 text-[12.5px] text-muted-foreground">
                <b className="font-medium text-ink">{matches.length}</b> match the brief · <b className="font-medium text-ink">{sendable.length}</b> free on all {sorted.length} dates
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <ul className="grid grid-cols-1 gap-2">
                {matches.map(({ model: m, busy, conflict }) => {
                  const blocked = busy.length > 0 || !!conflict
                  const off = excluded.includes(m.id)
                  return (
                    <li key={m.id}>
                      <label
                        className={cn(
                          "t-soft flex items-center gap-3 rounded-2xl p-2 pr-3 ring-1 ring-inset",
                          blocked ? "bg-ink/[0.03] ring-ink/6" : off ? "bg-paper ring-ink/8" : "bg-paper ring-ink/12 hover:ring-ink/25",
                          !blocked && "cursor-pointer",
                        )}
                      >
                        <img
                          src={`https://images.unsplash.com/photo-${m.photo}?w=200&h=250&fit=crop&q=70&auto=format`}
                          alt=""
                          className={cn("h-[60px] w-12 shrink-0 rounded-xl bg-sand object-cover", blocked && "opacity-45 grayscale")}
                        />
                        <div className={cn("min-w-0 flex-1", blocked && "text-ink/50")}>
                          <div className="flex items-center gap-2">
                            <span className="truncate text-[13.5px] font-medium">{m.name}</span>
                            {m.id === ME_MODEL && <span className="rounded-full bg-clay-soft px-1.5 py-px font-mono text-[9.5px] text-clay-ink">demo model</span>}
                          </div>
                          <div className="font-mono text-[10.5px] text-muted-foreground">{m.age} · {m.height}cm · {m.hair} · {m.background}</div>
                          {blocked ? (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {busy.map((b) => (
                                <span key={b.reason} className="rounded-full bg-sand px-2 py-px text-[11px] text-ink-2">{b.reason}</span>
                              ))}
                              {conflict && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-clay-soft px-2 py-px text-[11px] text-clay-ink">
                                  <ShieldAlert className="size-3" /> {conflict.category} ad · {conflict.month}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="mt-1 text-[11px] text-sage-ink">Free on all dates · {m.experience.slice(0, 2).join(", ")}</div>
                          )}
                        </div>
                        {!blocked && (
                          <input
                            type="checkbox"
                            checked={!off}
                            onChange={() => setExcluded((p) => toggle(p, m.id))}
                            className="size-4 accent-[var(--ink)]"
                            aria-label={`Include ${m.name}`}
                          />
                        )}
                      </label>
                    </li>
                  )
                })}
                {matches.length === 0 && <li className="py-10 text-center text-muted-foreground">No models match. Loosen the criteria.</li>}
              </ul>
            </div>
            <div className="border-t border-ink/8 p-4">
              <Cta onClick={send} disabled={sendable.length === 0 || sorted.length === 0 || !title.trim()} icon={<Send className="size-4" />} className="w-full justify-between">
                Send to {sendable.length} model{sendable.length === 1 ? "" : "s"}
              </Cta>
              <p className="mt-2 text-center text-[11.5px] text-muted-foreground">Each model gets one request with per-date 1st keep / 2nd keep / NG.</p>
            </div>
          </Bezel>
        </div>
      </div>
    </>
  )
}

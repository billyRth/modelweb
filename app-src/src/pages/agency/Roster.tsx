import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { AtSign, MessageSquare, Search, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import { AvailStrip, Bezel, Chip, Cta, DAY_STYLE, Legend, PageHeader, Photo } from "@/components/bits"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { EXPERIENCE, HAIR, ME_MODEL, photoUrl, type Model } from "@/data"
import { addDays, fmt, range, today } from "@/lib/date"
import { busyOn, useStore } from "@/store"

export default function RosterPage() {
  const s = useStore()
  const [q, setQ] = useState("")
  const [gender, setGender] = useState("Any")
  const [hair, setHair] = useState<string | null>(null)
  const [exp, setExp] = useState<string | null>(null)
  const [freeWeek, setFreeWeek] = useState(false)
  const [sel, setSel] = useState<Model | null>(null)
  const week = range(addDays(today(), 1), 7)

  const rows = s.models.filter((m) =>
    (!q || `${m.name} ${m.instagram} ${m.background}`.toLowerCase().includes(q.toLowerCase())) &&
    (gender === "Any" || m.gender === gender) &&
    (!hair || m.hair === hair) &&
    (!exp || m.experience.includes(exp)) &&
    (!freeWeek || week.every((d) => !busyOn(s, m.id, d))),
  )

  return (
    <>
      <PageHeader eyebrow="Roster" title={<>{s.models.length} models, <em className="italic">live availability</em></>} sub="Availability comes from each model's own calendar on Roster, so it's always current." />
      <Bezel inner="overflow-hidden">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-ink/8 p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, IG, background" className="h-9 w-64 rounded-full bg-paper pl-9" />
          </div>
          <div className="flex gap-1.5">{["Any", "Female", "Male"].map((g) => <Chip key={g} active={gender === g} onClick={() => setGender(g)}>{g}</Chip>)}</div>
          <div className="flex gap-1.5">{HAIR.map((h) => <Chip key={h} active={hair === h} onClick={() => setHair(hair === h ? null : h)}>{h}</Chip>)}</div>
          <select value={exp ?? ""} onChange={(e) => setExp(e.target.value || null)} className="h-8 rounded-full bg-paper px-3 text-[12.5px] ring-1 ring-ink/12 ring-inset" aria-label="Experience">
            <option value="">Any experience</option>
            {EXPERIENCE.map((x) => <option key={x}>{x}</option>)}
          </select>
          <Chip active={freeWeek} onClick={() => setFreeWeek(!freeWeek)}>Free all next 7 days</Chip>
          <span className="ml-auto font-mono text-[10.5px] text-muted-foreground">{rows.length} shown</span>
        </div>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
              <th className="px-5 py-3 font-normal">Model</th>
              <th className="px-3 py-3 font-normal">Age</th>
              <th className="px-3 py-3 font-normal">Height</th>
              <th className="px-3 py-3 font-normal">Hair</th>
              <th className="px-3 py-3 font-normal">Background</th>
              <th className="px-3 py-3 font-normal">Based</th>
              <th className="px-3 py-3 font-normal">Experience</th>
              <th className="px-3 py-3 font-normal">Next 30 days</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} onClick={() => setSel(m)} className="t-soft cursor-pointer border-t border-ink/6 hover:bg-cream/70">
                <td className="px-5 py-2.5">
                  <button className="flex items-center gap-3 text-left" onClick={(e) => { e.stopPropagation(); setSel(m) }}>
                    <Photo model={m} size={34} />
                    <span>
                      <span className="block font-medium">{m.name}{m.id === ME_MODEL && <span className="ml-1.5 rounded-full bg-clay-soft px-1.5 py-px font-mono text-[9.5px] text-clay-ink">demo</span>}</span>
                      <span className="font-mono text-[10.5px] text-muted-foreground">@{m.instagram} · {m.followers}</span>
                    </span>
                  </button>
                </td>
                <td className="px-3 tabular-nums">{m.age}</td>
                <td className="px-3 tabular-nums">{m.height}</td>
                <td className="px-3 whitespace-nowrap">{m.hair}</td>
                <td className="px-3">{m.background}</td>
                <td className="px-3">{m.location}</td>
                <td className="px-3">
                  <div className="flex flex-wrap gap-1">{m.experience.slice(0, 3).map((e) => <span key={e} className="rounded-full bg-cream px-2 py-px text-[11px] text-ink-2">{e}</span>)}</div>
                </td>
                <td className="px-3"><AvailStrip modelId={m.id} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-ink/8 px-5 py-3">
          <Legend items={[[DAY_STYLE.free, "Free"], [DAY_STYLE.job, "Booked"], [DAY_STYLE.audition, "Audition"], [DAY_STYLE.unavailable, "Unavailable"]]} />
        </div>
      </Bezel>
      <ProfileDrawer model={sel} onClose={() => setSel(null)} />
    </>
  )
}

function ProfileDrawer({ model, onClose }: { model: Model | null; onClose: () => void }) {
  const nav = useNavigate()
  const s = useStore()
  const m = model && s.models.find((x) => x.id === model.id)
  const upcoming = m ? range(today(), 30).map((d) => ({ d, b: busyOn(s, m.id, d) })).filter((x) => x.b).slice(0, 6) : []
  return (
    <Sheet open={!!m} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[520px] gap-0 overflow-y-auto bg-paper p-0 sm:max-w-[520px]">
        {m && (
          <>
            <div className="grid grid-cols-3 gap-1.5 p-4 pb-0">
              <img src={photoUrl(m.photo, 400, 500)} alt={m.name} className="col-span-2 row-span-2 aspect-[4/5] w-full rounded-2xl bg-sand object-cover" />
              <img src={photoUrl(m.photo, 300, 300, "faces")} alt="" className="aspect-square w-full rounded-xl bg-sand object-cover" />
              <img src={photoUrl(m.photo, 300, 300, "bottom")} alt="" className="aspect-square w-full rounded-xl bg-sand object-cover" />
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <SheetTitle className="font-serif text-[36px] leading-none font-normal">{m.name}</SheetTitle>
                <Cta onClick={() => nav(`/agency/messages/${m.id}`)} icon={<MessageSquare className="size-4" />}>Message</Cta>
              </div>
              <SheetDescription className="mt-1.5 flex items-center gap-1.5 text-[13px]">
                <AtSign className="size-3.5" /> {m.instagram} · {m.followers} followers · {m.background} · {m.location}
              </SheetDescription>
              <div className="mt-5 grid grid-cols-4 gap-px overflow-hidden rounded-2xl bg-ink/8 ring-1 ring-ink/8">
                {[["Age", m.age], ["Height", `${m.height}`], ["Bust", m.bust], ["Waist", m.waist], ["Hips", m.hips], ["Shoe", m.shoe], ["Hair", m.hair], ["Gender", m.gender]].map(([k, v]) => (
                  <div key={k} className="bg-paper px-3 py-2.5">
                    <div className="font-mono text-[9.5px] tracking-[0.12em] text-muted-foreground uppercase">{k}</div>
                    <div className="mt-0.5 text-[14px] font-medium">{v}</div>
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <div className="eyebrow mb-2">Experience</div>
                <div className="flex flex-wrap gap-1.5">{m.experience.map((e) => <span key={e} className="rounded-full bg-cream px-2.5 py-1 text-[12px]">{e}</span>)}</div>
                {m.credits.length > 0 && <ul className="mt-2 list-disc pl-5 text-[12.5px] text-ink-2">{m.credits.map((c) => <li key={c}>{c}</li>)}</ul>}
              </div>
              <div className="mt-5">
                <div className="eyebrow mb-2">Conflicts</div>
                {m.conflicts.length === 0 ? <p className="text-[12.5px] text-muted-foreground">None declared.</p> : m.conflicts.map((c) => (
                  <div key={c.note} className="flex items-center gap-2 text-[12.5px]"><ShieldAlert className="size-3.5 text-clay" />{c.category}: {c.note} · {c.month}</div>
                ))}
              </div>
              <div className="mt-5">
                <div className="eyebrow mb-2">Next 30 days</div>
                <AvailStrip modelId={m.id} />
                <ul className="mt-3 space-y-1 text-[12.5px]">
                  {upcoming.map(({ d, b }) => (
                    <li key={d} className="flex items-center gap-2"><i className={cn("size-2.5 rounded-[3px]", DAY_STYLE[b!.kind])} /><span className="w-14 font-mono text-[11px] text-muted-foreground">{fmt(d)}</span>{b!.reason.replace(` ${fmt(d)}`, "")}</li>
                  ))}
                  {upcoming.length === 0 && <li className="text-muted-foreground">Free every day.</li>}
                </ul>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

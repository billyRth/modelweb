import { useState } from "react"
import { AtSign, Check, ImagePlus, Plus, ShieldAlert, X } from "lucide-react"
import { Bezel, Chip, PageHeader } from "@/components/bits"
import { Input } from "@/components/ui/input"
import { CONFLICT_CATEGORIES, EXPERIENCE, ME_MODEL, photoUrl, type Model } from "@/data"
import { useStore } from "@/store"

export default function Profile() {
  const s = useStore()
  const me = s.models.find((m) => m.id === ME_MODEL)!
  const up = (patch: Partial<Model>) => s.updateModel(ME_MODEL, patch)
  const [conf, setConf] = useState({ category: "Sportswear", note: "", month: "2026-09" })
  const num = (k: keyof Model) => (
    <label key={k} className="flex flex-col gap-1.5">
      <span className="eyebrow">{k}</span>
      <Input type="number" step={k === "shoe" ? 0.5 : 1} value={me[k] as number} onChange={(e) => up({ [k]: +e.target.value })} className="h-10 rounded-xl bg-paper tabular-nums" />
    </label>
  )

  return (
    <>
      <PageHeader
        eyebrow="Profile"
        title={<>Filled once, <em className="italic">sent every time</em></>}
        sub="Attached automatically to every answer you send. Changes save as you type."
        actions={<span className="inline-flex items-center gap-1.5 rounded-full bg-sage-soft px-3 py-1.5 text-[12px] text-sage-ink"><Check className="size-3.5" /> Saved</span>}
      />
      <div className="grid grid-cols-12 items-start gap-5">
        <Bezel className="col-span-5" inner="p-4">
          <div className="grid grid-cols-3 gap-2">
            <img src={photoUrl(me.photo, 400, 500)} alt={me.name} className="col-span-2 row-span-2 aspect-[4/5] w-full rounded-2xl bg-sand object-cover" />
            <img src={photoUrl(me.photo, 300, 300, "faces")} alt="" className="aspect-square w-full rounded-xl bg-sand object-cover" />
            <img src={photoUrl(me.photo, 300, 300, "bottom")} alt="" className="aspect-square w-full rounded-xl bg-sand object-cover" />
            <img src={photoUrl(me.photo, 200, 250, "top")} alt="" className="aspect-[4/5] w-full rounded-xl bg-sand object-cover" />
            <img src={photoUrl(me.photo, 200, 250, "entropy")} alt="" className="aspect-[4/5] w-full rounded-xl bg-sand object-cover" />
            <button onClick={() => s.toast("Photo upload is not part of this prototype")} className="t-soft grid aspect-[4/5] w-full place-items-center rounded-xl border border-dashed border-ink/25 text-muted-foreground hover:bg-ink/4">
              <span className="flex flex-col items-center gap-1 text-[12px]"><ImagePlus className="size-5" />Add photo</span>
            </button>
          </div>
        </Bezel>

        <div className="col-span-7 flex flex-col gap-4">
          <Bezel inner="p-5">
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="eyebrow">Name</span>
                <Input value={me.name} onChange={(e) => up({ name: e.target.value })} className="h-10 rounded-xl bg-paper" />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="eyebrow">Instagram</span>
                <div className="relative">
                  <AtSign className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={me.instagram} onChange={(e) => up({ instagram: e.target.value })} className="h-10 rounded-xl bg-paper pl-9" />
                </div>
              </label>
            </div>
            <div className="mt-4 grid grid-cols-6 gap-3">
              {(["age", "height", "bust", "waist", "hips", "shoe"] as (keyof Model)[]).map(num)}
            </div>
          </Bezel>

          <Bezel inner="p-5">
            <div className="eyebrow mb-3">Experience</div>
            <div className="flex flex-wrap gap-1.5">
              {EXPERIENCE.map((x) => (
                <Chip key={x} active={me.experience.includes(x)} onClick={() => up({ experience: me.experience.includes(x) ? me.experience.filter((e) => e !== x) : [...me.experience, x] })}>{x}</Chip>
              ))}
            </div>
            <ul className="mt-3 list-disc pl-5 text-[13px] text-ink-2">{me.credits.map((c) => <li key={c}>{c}</li>)}</ul>
          </Bezel>

          <Bezel inner="p-5">
            <div className="eyebrow mb-3">Conflicts (ads you've done that block competitors)</div>
            <ul className="space-y-1.5">
              {me.conflicts.map((c, i) => (
                <li key={i} className="flex items-center gap-2 rounded-xl bg-cream/70 px-3 py-2 text-[13px] ring-1 ring-ink/6 ring-inset">
                  <ShieldAlert className="size-4 text-clay" />
                  <b className="font-medium">{c.category}</b> · {c.note} · <span className="font-mono text-[11px] text-muted-foreground">{c.month}</span>
                  <button aria-label="Remove conflict" onClick={() => up({ conflicts: me.conflicts.filter((_, j) => j !== i) })} className="ml-auto grid size-7 place-items-center rounded-full hover:bg-ink/6"><X className="size-3.5" /></button>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center gap-2">
              <select value={conf.category} onChange={(e) => setConf({ ...conf, category: e.target.value })} aria-label="Category" className="h-10 rounded-xl bg-paper px-3 text-[13px] ring-1 ring-ink/12 ring-inset">
                {CONFLICT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <Input value={conf.note} onChange={(e) => setConf({ ...conf, note: e.target.value })} placeholder="e.g. Running shoe web ad" className="h-10 flex-1 rounded-xl bg-paper" />
              <Input type="month" value={conf.month} onChange={(e) => setConf({ ...conf, month: e.target.value })} aria-label="Month" className="h-10 w-40 rounded-xl bg-paper" />
              <button
                onClick={() => { if (conf.note.trim()) { up({ conflicts: [...me.conflicts, { ...conf, note: conf.note.trim() }] }); setConf({ ...conf, note: "" }) } }}
                className="t-soft inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-[13px] text-paper hover:bg-ink-2"
              >
                <Plus className="size-4" /> Add
              </button>
            </div>
          </Bezel>
        </div>
      </div>
    </>
  )
}

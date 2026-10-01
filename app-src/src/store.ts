import { useEffect, useState } from "react"
import { create } from "zustand"
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware"
import {
  buildSeed, ME_AGENCY, ME_MODEL,
  type Answer, type Criteria, type JobRequest, type Model, type Notice, type ReqDate, type SeedState,
} from "@/data"
import { fmt } from "@/lib/date"

// localStorage can throw (private mode, blocked storage, quota): never let that break the demo.
const safeStorage: StateStorage = {
  getItem: (k) => { try { return localStorage.getItem(k) } catch { return null } },
  setItem: (k, v) => { try { localStorage.setItem(k, v) } catch { /* ignore */ } },
  removeItem: (k) => { try { localStorage.removeItem(k) } catch { /* ignore */ } },
}

export type Role = "agency" | "model"
export type Cell = Answer | "waiting" | "confirmed" | "released"

interface Actions {
  toasts: { id: number; text: string }[]
  reset: () => void
  toast: (text: string) => void
  sendRequest: (r: Pick<JobRequest, "title" | "clientType" | "jobType" | "dates" | "fee" | "location" | "deadline" | "brief" | "criteria" | "recipients">) => string
  markSeen: (reqId: string, modelId: string) => void
  submitReply: (reqId: string, modelId: string, answers: Record<string, Answer>, note?: string) => void
  decide: (reqId: string, modelId: string, date: string, d: "confirmed" | "released" | null) => void
  nudge: (reqId: string) => number
  setDays: (modelId: string, dates: string[], unavailable: boolean) => void
  setGcal: (on: boolean) => void
  sendMessage: (agency: string, modelId: string, from: "agency" | "model", text: string) => void
  readNotices: (to: Role) => void
  updateModel: (id: string, patch: Partial<Model>) => void
}
export type State = SeedState & Actions

let nid = 1000
const notice = (n: Omit<Notice, "id" | "read">): Notice => ({ ...n, id: `n${++nid}-${Date.now()}`, read: false })

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...buildSeed(),
      toasts: [],
      reset: () => {
        set({ ...buildSeed(), toasts: [] })
        get().toast("Demo data reset")
      },
      toast: (text) => {
        const id = Date.now() + Math.random()
        set((s) => ({ toasts: [...s.toasts, { id, text }] }))
        setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3200)
      },

      sendRequest: (input) => {
        const now = Date.now()
        const id = `R-${now.toString(36).slice(-5).toUpperCase()}`
        // ponytail: other models' replies are simulated, revealed over the next ~40s via `at`.
        const replies: JobRequest["replies"] = {}
        input.recipients.forEach((m, i) => {
          if (m === ME_MODEL || i % 4 === 3) return
          const answers: Record<string, Answer> = {}
          input.dates.forEach((d, j) => {
            const x = (i * 7 + j * 3) % 10
            answers[d.date] = x < 5 ? "first" : x < 8 ? "second" : "ng"
          })
          replies[m] = { answers, at: now + 6000 + i * 5000 }
        })
        const req: JobRequest = { ...input, id, agency: ME_AGENCY, createdAt: now, replies, decisions: {}, seenBy: [] }
        const s = get()
        const notices: Notice[] = []
        if (input.recipients.includes(ME_MODEL))
          notices.push(notice({ to: "model", kind: "request", text: `New request from ${ME_AGENCY}: ${input.title}`, at: now, link: `/model/requests/${id}` }))
        Object.entries(replies).forEach(([m, r]) => {
          const name = s.models.find((x) => x.id === m)?.name
          notices.push(notice({ to: "agency", kind: "reply", text: `${name} answered ${input.title}`, at: r.at, link: `/agency/responses/${id}` }))
        })
        set({ requests: [req, ...s.requests], notices: [...notices, ...s.notices] })
        return id
      },

      markSeen: (reqId, modelId) =>
        set((s) => ({
          requests: s.requests.map((r) => (r.id === reqId && !r.seenBy.includes(modelId) ? { ...r, seenBy: [...r.seenBy, modelId] } : r)),
        })),

      submitReply: (reqId, modelId, answers, note) => {
        const s = get()
        const req = s.requests.find((r) => r.id === reqId)
        if (!req) return
        const name = s.models.find((m) => m.id === modelId)?.name
        const summary = req.dates.map((d) => `${label(answers[d.date])} ${fmt(d.date)}`).join(", ")
        set({
          requests: s.requests.map((r) => (r.id === reqId ? { ...r, replies: { ...r.replies, [modelId]: { answers, at: Date.now(), note } } } : r)),
          notices: req.agency === ME_AGENCY
            ? [notice({ to: "agency", kind: "reply", text: `${name} answered ${req.title}: ${summary}`, at: Date.now(), link: `/agency/responses/${reqId}` }), ...s.notices]
            : s.notices,
        })
      },

      decide: (reqId, modelId, date, d) => {
        const s = get()
        const req = s.requests.find((r) => r.id === reqId)
        if (!req) return
        if (d === "confirmed" && busyOn(s, modelId, date, reqId)) { get().toast("Already booked that day"); return }
        const kind = req.dates.find((x) => x.date === date)?.kind === "audition" ? "audition" : "job"
        const prev = { ...(req.decisions[modelId] ?? {}) }
        if (d) prev[date] = d
        else delete prev[date]
        const bookings = s.bookings.filter((b) => !(b.requestId === reqId && b.modelId === modelId && b.date === date))
        if (d === "confirmed") bookings.push({ id: `b${Date.now()}`, modelId, date, kind, title: req.title, requestId: reqId })
        const notices = modelId === ME_MODEL && d
          ? [notice({ to: "model", kind: d, text: `${d === "confirmed" ? "Confirmed" : "Released"}: ${req.title} on ${fmt(date)}`, at: Date.now(), link: `/model/requests/${reqId}` }), ...s.notices]
          : s.notices
        set({ requests: s.requests.map((r) => (r.id === reqId ? { ...r, decisions: { ...r.decisions, [modelId]: prev } } : r)), bookings, notices })
      },

      nudge: (reqId) => {
        const s = get()
        const req = s.requests.find((r) => r.id === reqId)
        if (!req) return 0
        const waiting = req.recipients.filter((m) => !visibleReply(req, m, Date.now()))
        const notices = waiting.includes(ME_MODEL)
          ? [notice({ to: "model", kind: "nudge", text: `Reminder from ${req.agency}: please answer ${req.title}`, at: Date.now(), link: `/model/requests/${reqId}` }), ...s.notices]
          : s.notices
        set({ requests: s.requests.map((r) => (r.id === reqId ? { ...r, nudgedAt: Date.now() } : r)), notices })
        return waiting.length
      },

      setDays: (modelId, dates, unavailable) =>
        set((s) => ({
          models: s.models.map((m) => {
            if (m.id !== modelId) return m
            const set_ = new Set(m.unavailable)
            dates.forEach((d) => (unavailable ? set_.add(d) : set_.delete(d)))
            return { ...m, unavailable: [...set_].sort() }
          }),
        })),

      setGcal: (gcalConnected) => set({ gcalConnected }),

      sendMessage: (agency, modelId, from, text) =>
        set((s) => {
          const id = `${agency}:${modelId}`
          const msg = { from, text, at: Date.now() }
          const exists = s.threads.some((t) => t.id === id)
          return {
            threads: exists
              ? s.threads.map((t) => (t.id === id ? { ...t, messages: [...t.messages, msg] } : t))
              : [{ id, agency, modelId, messages: [msg] }, ...s.threads],
          }
        }),

      readNotices: (to) => set((s) => ({ notices: s.notices.map((n) => (n.to === to && n.at <= Date.now() ? { ...n, read: true } : n)) })),

      updateModel: (id, patch) => set((s) => ({ models: s.models.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
    }),
    {
      name: "roster-demo-v1",
      storage: createJSONStorage(() => safeStorage),
      partialize: ({ toasts: _t, ...rest }) => rest,
    },
  ),
)

/* ---------- selectors / pure helpers ---------- */

export const label = (a: Cell) =>
  ({ first: "1st keep", second: "2nd keep", ng: "NG", waiting: "Waiting", confirmed: "Confirmed", released: "Released" })[a]

export function visibleReply(req: JobRequest, modelId: string, now: number) {
  const r = req.replies[modelId]
  return r && r.at <= now ? r : undefined
}

export function cellState(req: JobRequest, modelId: string, date: string, now: number): Cell {
  const d = req.decisions[modelId]?.[date]
  if (d) return d
  return visibleReply(req, modelId, now)?.answers[date] ?? "waiting"
}

export type Busy = { kind: "job" | "audition" | "unavailable" | "google"; reason: string }
export function busyOn(s: SeedState, modelId: string, date: string, ignoreRequest?: string): Busy | null {
  const b = s.bookings.find((x) => x.modelId === modelId && x.date === date && (!ignoreRequest || x.requestId !== ignoreRequest))
  if (b) return b.kind === "audition" ? { kind: "audition", reason: `Audition ${fmt(date)}` } : { kind: "job", reason: `Booked ${fmt(date)}` }
  const m = s.models.find((x) => x.id === modelId)
  if (m?.unavailable.includes(date)) return { kind: "unavailable", reason: `Unavailable ${fmt(date)}` }
  if (modelId === ME_MODEL && s.gcalConnected) {
    const g = s.gcalEvents.find((e) => e.date === date)
    if (g) return { kind: "google", reason: `Busy ${fmt(date)} (Google)` }
  }
  return null
}

/** Conflict within 12 months of today in the given category. */
export function conflictFor(m: Model, category: string | null) {
  if (!category) return null
  const cut = new Date()
  cut.setMonth(cut.getMonth() - 12)
  const cutYm = `${cut.getFullYear()}-${String(cut.getMonth() + 1).padStart(2, "0")}`
  return m.conflicts.find((c) => c.category === category && c.month >= cutYm) ?? null
}

export interface Match { model: Model; busy: Busy[]; conflict: ReturnType<typeof conflictFor> }
export function matchModels(s: SeedState, c: Criteria, dates: ReqDate[]): { matches: Match[]; filtered: number } {
  const ok = s.models.filter((m) =>
    m.age >= c.ageMin && m.age <= c.ageMax &&
    (c.gender === "Any" || m.gender === c.gender) &&
    (c.ethnicities.length === 0 || c.ethnicities.includes(m.ethnicity)) &&
    (c.hair.length === 0 || c.hair.includes(m.hair)) &&
    m.height >= c.heightMin && m.height <= c.heightMax &&
    (c.experience.length === 0 || c.experience.some((e) => m.experience.includes(e))) &&
    (c.location === "Anywhere in Japan" || (c.location === "Tokyo area" ? ["Tokyo", "Yokohama"].includes(m.location) : m.location === c.location)),
  )
  const matches = ok.map((model) => ({
    model,
    busy: dates.map((d) => busyOn(s, model.id, d.date)).filter((b): b is Busy => !!b),
    conflict: conflictFor(model, c.conflictCategory),
  }))
  matches.sort((a, b) => Number(a.busy.length > 0 || !!a.conflict) - Number(b.busy.length > 0 || !!b.conflict))
  return { matches, filtered: s.models.length - ok.length }
}

/** Ticking clock for countdowns and simulated replies. */
export function useNow(ms = 1000) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(t)
  }, [ms])
  return now
}

export const modelById = (s: SeedState, id: string) => s.models.find((m) => m.id === id)!

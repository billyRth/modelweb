// Dates are local 'YYYY-MM-DD' strings throughout the app.
const pad = (n: number) => String(n).padStart(2, "0")

export const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const parse = (s: string) => {
  const [y, m, d] = s.split("-").map(Number)
  return new Date(y, m - 1, d)
}
export const today = () => iso(new Date())
export const addDays = (s: string, n: number) => {
  const d = parse(s)
  d.setDate(d.getDate() + n)
  return iso(d)
}
export const range = (from: string, n: number) => Array.from({ length: n }, (_, i) => addDays(from, i))
export const between = (a: string, b: string) => {
  const [lo, hi] = a < b ? [a, b] : [b, a]
  const out: string[] = []
  for (let d = lo; d <= hi; d = addDays(d, 1)) out.push(d)
  return out
}

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
export const fmt = (s: string) => {
  const d = parse(s)
  return `${d.getDate()} ${MON[d.getMonth()]}`
}
export const fmtDow = (s: string) => `${DOW[parse(s).getDay()]} ${fmt(s)}`
export const dow = (s: string) => DOW[parse(s).getDay()]
export const monthLabel = (y: number, m: number) =>
  new Date(y, m, 1).toLocaleString("en-GB", { month: "long", year: "numeric" })
export const monthShort = (ym: string) => {
  const [y, m] = ym.split("-").map(Number)
  return `${MON[m - 1]} ${y}`
}

/** 6x7 grid of ISO dates starting on Monday for the month (y, m 0-based). */
export function monthGrid(y: number, m: number) {
  const first = new Date(y, m, 1)
  const offset = (first.getDay() + 6) % 7
  const start = new Date(y, m, 1 - offset)
  return range(iso(start), 42)
}

export function countdown(deadline: number, now: number) {
  const ms = deadline - now
  if (ms <= 0) return { label: "Closed", ms, urgent: false, over: true }
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  const label = h >= 48 ? `Due in ${Math.floor(h / 24)}d` : h >= 1 ? `Due in ${h}h ${pad(m)}m` : `Due in ${m}m`
  return { label, ms, urgent: h < 6, over: false }
}

export const ago = (t: number, now: number) => {
  const m = Math.round((now - t) / 60_000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

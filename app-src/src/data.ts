// Fictional seed data. Every person, agency and client here is made up.
import { addDays, fmt, today } from "@/lib/date"

export const ME_AGENCY = "Tokyo Faces"
export const ME_MODEL = "m1"

export type Gender = "Female" | "Male" | "Non-binary"
export type Answer = "first" | "second" | "ng"
export type DateKind = "shoot" | "audition"

export interface Conflict { category: string; note: string; month: string } // month 'YYYY-MM'
export interface Model {
  id: string
  name: string
  age: number
  gender: Gender
  ethnicity: string
  background: string
  hair: string
  height: number
  bust: number
  waist: number
  hips: number
  shoe: number
  location: string
  instagram: string
  followers: string
  experience: string[]
  credits: string[]
  conflicts: Conflict[]
  photo: string // unsplash photo id
  unavailable: string[]
}
export interface Booking { id: string; modelId: string; date: string; kind: "job" | "audition"; title: string; requestId?: string }
export interface ReqDate { date: string; kind: DateKind }
export interface Criteria {
  ageMin: number; ageMax: number
  gender: Gender | "Any"
  ethnicities: string[]
  hair: string[]
  heightMin: number; heightMax: number
  experience: string[]
  location: string
  conflictCategory: string | null
}
export interface Reply { answers: Record<string, Answer>; at: number; note?: string }
export interface JobRequest {
  id: string
  agency: string
  title: string
  clientType: string
  jobType: DateKind
  dates: ReqDate[]
  fee: string
  location: string
  deadline: number
  createdAt: number
  brief: string
  criteria?: Criteria
  recipients: string[]
  replies: Record<string, Reply>
  decisions: Record<string, Record<string, "confirmed" | "released">>
  seenBy: string[]
  nudgedAt?: number
}
export interface Message { from: "agency" | "model"; text: string; at: number }
export interface Thread { id: string; agency: string; modelId: string; messages: Message[] }
export interface Notice { id: string; to: "agency" | "model"; text: string; at: number; read: boolean; link: string; kind: "request" | "deadline" | "confirmed" | "released" | "reply" | "nudge" }

export const ETHNICITIES = ["Japanese", "East Asian", "Southeast Asian", "South Asian", "Black", "White", "Latina/o", "Middle Eastern", "Mixed"]
export const HAIR = ["Black", "Dark brown", "Brown", "Blonde", "Red"]
export const EXPERIENCE = ["Commercial", "Sportswear", "Fitness", "Beauty", "Editorial", "Runway", "TV CM", "Catalogue", "Lifestyle"]
export const CONFLICT_CATEGORIES = ["Sportswear", "Beverage", "Cosmetics", "Automotive", "Telecom", "Fashion retail"]
export const CLIENT_TYPES = ["Sportswear brand", "Cosmetics brand", "Beverage brand", "Fashion retail", "Magazine", "Automotive", "Telecom"]
export const LOCATIONS = ["Tokyo area", "Osaka", "Anywhere in Japan"]

export const photoUrl = (id: string, w = 200, h = 250, crop = "") =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=70&auto=format${crop ? `&crop=${crop}` : ""}`

type Seed = Omit<Model, "unavailable" | "credits"> & { credits?: string[] }
const M: Seed[] = [
  { id: "m1", name: "Aiko Tanaka", age: 24, gender: "Female", ethnicity: "Japanese", background: "Japanese", hair: "Black", height: 166, bust: 80, waist: 59, hips: 86, shoe: 23.5, location: "Tokyo", instagram: "aiko.tnk", followers: "12.4k", experience: ["Commercial", "Beauty", "Lifestyle"], conflicts: [{ category: "Beverage", note: "Green tea print ad", month: "2026-02" }], photo: "1544725176-7c40e5a71c5e", credits: ["Café chain web campaign (2026)", "Skincare e-commerce (2025)", "Travel magazine feature (2025)"] },
  { id: "m2", name: "Yui Nakamura", age: 22, gender: "Female", ethnicity: "Japanese", background: "Japanese", hair: "Black", height: 168, bust: 79, waist: 58, hips: 85, shoe: 24, location: "Tokyo", instagram: "yui.nkmr", followers: "31k", experience: ["Runway", "Sportswear", "Editorial"], conflicts: [{ category: "Sportswear", note: "Running shoe campaign", month: "2026-03" }], photo: "1541823709867-1b206113eafd" },
  { id: "m3", name: "Mei Lin", age: 27, gender: "Female", ethnicity: "East Asian", background: "Taiwanese", hair: "Black", height: 172, bust: 81, waist: 60, hips: 88, shoe: 24.5, location: "Tokyo", instagram: "meilin.studio", followers: "8.9k", experience: ["Beauty", "Editorial", "Commercial"], conflicts: [], photo: "1502823403499-6ccfcf4fb453" },
  { id: "m4", name: "Rina Sato", age: 26, gender: "Female", ethnicity: "Japanese", background: "Japanese", hair: "Black", height: 163, bust: 78, waist: 58, hips: 84, shoe: 23, location: "Tokyo", instagram: "rina_sato_", followers: "22k", experience: ["Commercial", "TV CM", "Sportswear"], conflicts: [], photo: "1534528741775-53994a69daeb" },
  { id: "m5", name: "Haruto Kobayashi", age: 25, gender: "Male", ethnicity: "Japanese", background: "Japanese", hair: "Black", height: 180, bust: 92, waist: 74, hips: 90, shoe: 27, location: "Tokyo", instagram: "haruto.kby", followers: "5.2k", experience: ["Sportswear", "Fitness"], conflicts: [], photo: "1628157588553-5eeea00af15c" },
  { id: "m6", name: "Kenji Mori", age: 29, gender: "Male", ethnicity: "Japanese", background: "Japanese", hair: "Black", height: 178, bust: 94, waist: 76, hips: 92, shoe: 26.5, location: "Tokyo", instagram: "kenji.mori", followers: "3.1k", experience: ["Commercial", "Catalogue"], conflicts: [], photo: "1531427186611-ecfd6d936c79" },
  { id: "m7", name: "Saki Watanabe", age: 21, gender: "Female", ethnicity: "Japanese", background: "Japanese", hair: "Dark brown", height: 160, bust: 78, waist: 57, hips: 83, shoe: 23, location: "Osaka", instagram: "saki.wtnb", followers: "17k", experience: ["Commercial", "Beauty"], conflicts: [], photo: "1548142813-c348350df52b" },
  { id: "m8", name: "Hana Yoshida", age: 28, gender: "Female", ethnicity: "Japanese", background: "Japanese", hair: "Black", height: 170, bust: 80, waist: 59, hips: 87, shoe: 24, location: "Tokyo", instagram: "hana.yoshida", followers: "41k", experience: ["Runway", "Fitness", "Sportswear"], conflicts: [], photo: "1532074205216-d0e1f4b87368" },
  { id: "m9", name: "Amara Okoye", age: 25, gender: "Female", ethnicity: "Black", background: "Nigerian-British", hair: "Black", height: 175, bust: 82, waist: 61, hips: 90, shoe: 25, location: "Tokyo", instagram: "amara.okoye", followers: "56k", experience: ["Runway", "Editorial"], conflicts: [], photo: "1531123897727-8f129e1688ce" },
  { id: "m10", name: "Priya Raman", age: 24, gender: "Female", ethnicity: "South Asian", background: "Indian", hair: "Black", height: 165, bust: 80, waist: 60, hips: 88, shoe: 23.5, location: "Tokyo", instagram: "priya.rmn", followers: "9.7k", experience: ["Commercial", "Beauty"], conflicts: [{ category: "Cosmetics", note: "Lipstick launch", month: "2026-06" }], photo: "1488426862026-3ee34a7d66df" },
  { id: "m11", name: "Arjun Mehta", age: 27, gender: "Male", ethnicity: "South Asian", background: "Indian", hair: "Black", height: 182, bust: 96, waist: 78, hips: 94, shoe: 27.5, location: "Tokyo", instagram: "arjun.mht", followers: "6.3k", experience: ["Fitness", "Commercial"], conflicts: [], photo: "1595152772835-219674b2a8a6" },
  { id: "m12", name: "Sofia Marques", age: 23, gender: "Female", ethnicity: "Latina/o", background: "Brazilian", hair: "Dark brown", height: 167, bust: 84, waist: 62, hips: 92, shoe: 24, location: "Tokyo", instagram: "sofi.marques", followers: "28k", experience: ["Commercial", "Lifestyle"], conflicts: [], photo: "1517365830460-955ce3ccd263" },
  { id: "m13", name: "Chloé Martin", age: 26, gender: "Female", ethnicity: "White", background: "French", hair: "Red", height: 171, bust: 80, waist: 60, hips: 88, shoe: 24.5, location: "Tokyo", instagram: "chloe.mrtn", followers: "14k", experience: ["Editorial", "Beauty"], conflicts: [], photo: "1526510747491-58f928ec870f" },
  { id: "m14", name: "Emma Lindqvist", age: 22, gender: "Female", ethnicity: "White", background: "Swedish", hair: "Blonde", height: 176, bust: 79, waist: 59, hips: 87, shoe: 25, location: "Tokyo", instagram: "emma.lindq", followers: "19k", experience: ["Runway", "Editorial"], conflicts: [], photo: "1546961329-78bef0414d7c" },
  { id: "m15", name: "Lucas Weber", age: 24, gender: "Male", ethnicity: "White", background: "German", hair: "Blonde", height: 184, bust: 95, waist: 77, hips: 93, shoe: 28, location: "Yokohama", instagram: "lucas.wbr", followers: "4.4k", experience: ["Sportswear", "Catalogue"], conflicts: [{ category: "Sportswear", note: "Football kit catalogue", month: "2026-08" }], photo: "1552374196-c4e7ffc6e126" },
  { id: "m16", name: "Mateo Rossi", age: 30, gender: "Male", ethnicity: "White", background: "Italian", hair: "Dark brown", height: 183, bust: 98, waist: 80, hips: 95, shoe: 27.5, location: "Tokyo", instagram: "mateo.rossi", followers: "33k", experience: ["Editorial", "TV CM"], conflicts: [{ category: "Automotive", note: "SUV TV spot", month: "2026-01" }], photo: "1506794778202-cad84cf45f1d" },
  { id: "m17", name: "Kai Reyes", age: 27, gender: "Male", ethnicity: "Mixed", background: "Filipino-Japanese", hair: "Black", height: 177, bust: 95, waist: 76, hips: 92, shoe: 27, location: "Tokyo", instagram: "kai.reyes", followers: "11k", experience: ["Fitness", "Sportswear", "Commercial"], conflicts: [{ category: "Sportswear", note: "Gym wear lookbook", month: "2025-06" }], photo: "1507003211169-0a1dd7228f2d" },
  { id: "m18", name: "Olivia Bennett", age: 41, gender: "Female", ethnicity: "White", background: "British", hair: "Blonde", height: 169, bust: 84, waist: 66, hips: 92, shoe: 24, location: "Tokyo", instagram: "olivia.bennett", followers: "7.8k", experience: ["Commercial", "TV CM", "Lifestyle"], conflicts: [{ category: "Telecom", note: "Mobile plan TV CM", month: "2026-05" }], photo: "1508214751196-bcfd4ca60f91" },
  { id: "m19", name: "Nadia Haddad", age: 25, gender: "Female", ethnicity: "Middle Eastern", background: "Lebanese", hair: "Black", height: 170, bust: 82, waist: 60, hips: 89, shoe: 24, location: "Tokyo", instagram: "nadia.hdd", followers: "24k", experience: ["Beauty", "Editorial"], conflicts: [], photo: "1542206395-9feb3edaa68d" },
  { id: "m20", name: "Isabel Cruz", age: 23, gender: "Female", ethnicity: "Latina/o", background: "Mexican", hair: "Dark brown", height: 164, bust: 83, waist: 61, hips: 90, shoe: 23.5, location: "Tokyo", instagram: "isa.cruz", followers: "15k", experience: ["Commercial", "Lifestyle"], conflicts: [], photo: "1616002411355-49593fd89721" },
  { id: "m21", name: "Grace Park", age: 26, gender: "Female", ethnicity: "East Asian", background: "Korean", hair: "Dark brown", height: 168, bust: 80, waist: 59, hips: 86, shoe: 24, location: "Tokyo", instagram: "grace.park", followers: "36k", experience: ["Beauty", "Runway", "Commercial"], conflicts: [], photo: "1531746020798-e6953c6e8e04" },
  { id: "m22", name: "Ethan Brooks", age: 31, gender: "Male", ethnicity: "White", background: "American", hair: "Brown", height: 185, bust: 99, waist: 82, hips: 96, shoe: 28.5, location: "Tokyo", instagram: "ethan.brks", followers: "2.9k", experience: ["Commercial", "Catalogue"], conflicts: [], photo: "1500648767791-00dcc994a43e" },
  { id: "m23", name: "Lily Hart", age: 20, gender: "Female", ethnicity: "White", background: "Irish", hair: "Red", height: 165, bust: 78, waist: 58, hips: 85, shoe: 23.5, location: "Tokyo", instagram: "lily.hart", followers: "6.1k", experience: ["Editorial", "Commercial"], conflicts: [], photo: "1438761681033-6461ffad8d80" },
  { id: "m24", name: "Noah Fischer", age: 22, gender: "Male", ethnicity: "White", background: "Austrian", hair: "Brown", height: 179, bust: 93, waist: 75, hips: 91, shoe: 27, location: "Osaka", instagram: "noah.fsch", followers: "3.6k", experience: ["Sportswear", "Lifestyle"], conflicts: [], photo: "1529068755536-a5ade0dcb4e8" },
]

// Deterministic PRNG so every reset produces the same demo.
function rng(seed: number) {
  return () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296)
}

const JOB_TITLES = ["Catalogue shoot", "E-commerce shoot", "Magazine editorial", "Web campaign", "Lookbook shoot", "Event appearance"]
const AUD_TITLES = ["TV CM audition", "Casting", "Go-see"]

export interface SeedState {
  models: Model[]
  bookings: Booking[]
  requests: JobRequest[]
  threads: Thread[]
  notices: Notice[]
  gcalConnected: boolean
  gcalEvents: { date: string; title: string }[]
}

/** Offsets used by the pre-filled "New request" brief (Oct 2 + 41 = 12 Nov). */
export const BRIEF_OFFSETS = { audition: 34, shoot: [41, 42, 43] }

export function buildSeed(): SeedState {
  const t = today()
  const d = (n: number) => addDays(t, n)
  const now = Date.now()
  const H = 3_600_000
  const r = rng(7)
  const protectedDays = new Set([BRIEF_OFFSETS.audition, ...BRIEF_OFFSETS.shoot, 3, 6, 7, 9, 2])

  const bookings: Booking[] = []
  let bid = 0
  const book = (modelId: string, n: number, kind: "job" | "audition", title: string, requestId?: string) =>
    bookings.push({ id: `b${++bid}`, modelId, date: d(n), kind, title, requestId })

  const models: Model[] = M.map((m) => ({ ...m, credits: m.credits ?? [], unavailable: [] as string[] }))
  for (const m of models) {
    if (m.id === ME_MODEL) continue
    const count = 3 + Math.floor(r() * 4)
    for (let i = 0; i < count; i++) {
      const n = 1 + Math.floor(r() * 50)
      if (protectedDays.has(n)) continue
      const roll = r()
      if (roll < 0.45) book(m.id, n, "job", JOB_TITLES[Math.floor(r() * JOB_TITLES.length)])
      else if (roll < 0.7) book(m.id, n, "audition", AUD_TITLES[Math.floor(r() * AUD_TITLES.length)])
      else m.unavailable.push(d(n), d(n + 1))
    }
  }
  // Named examples for the pre-filled brief: Rina booked 13 Nov, Hana audition 12 Nov.
  book("m4", 42, "job", "Drugstore web campaign")
  book("m8", 41, "audition", "Beverage TV CM audition")
  // Aiko's own calendar
  book("m1", 5, "job", "Café chain web campaign", "R-203")
  book("m1", 12, "audition", "Skincare TV CM casting")
  book("m1", 23, "job", "Travel magazine editorial")
  const aiko = models[0]
  aiko.unavailable = [d(9), d(18), d(19), d(20), d(30)]

  const req = (p: Partial<JobRequest> & Pick<JobRequest, "id" | "agency" | "title" | "dates" | "recipients" | "deadline">): JobRequest => ({
    clientType: "Sportswear brand", jobType: "shoot", fee: "¥100,000 / day", location: "Tokyo", createdAt: now - 20 * H,
    brief: "", replies: {}, decisions: {}, seenBy: [], ...p,
  })
  const all = (dates: ReqDate[], a: Answer) => Object.fromEntries(dates.map((x) => [x.date, a]))

  const r101Dates: ReqDate[] = [{ date: d(3), kind: "audition" }, { date: d(6), kind: "shoot" }, { date: d(7), kind: "shoot" }]
  const r102Dates: ReqDate[] = [{ date: d(10), kind: "shoot" }, { date: d(11), kind: "shoot" }]
  const r103Dates: ReqDate[] = [{ date: d(4), kind: "audition" }, { date: d(21), kind: "shoot" }, { date: d(22), kind: "shoot" }]

  const requests: JobRequest[] = [
    req({
      id: "R-101", agency: ME_AGENCY, title: "Spring running campaign", clientType: "Sportswear brand", fee: "¥120,000 / day + usage",
      location: "Studio in Shibuya, Tokyo", deadline: now + 3 * H, createdAt: now - 5 * H, dates: r101Dates,
      brief: "A sportswear brand needs runners for a spring key visual. Natural, athletic look. Light running on set.",
      recipients: ["m1", "m3", "m5", "m6", "m17", "m21", "m4", "m8"],
      replies: {
        m3: { answers: { [d(3)]: "first", [d(6)]: "first", [d(7)]: "first" }, at: now - 4 * H },
        m5: { answers: { [d(3)]: "first", [d(6)]: "second", [d(7)]: "first" }, at: now - 3.5 * H },
        m6: { answers: all(r101Dates, "ng"), at: now - 3 * H, note: "Out of town that week." },
        m17: { answers: { [d(3)]: "second", [d(6)]: "first", [d(7)]: "ng" }, at: now - 2 * H },
        m8: { answers: { [d(3)]: "first", [d(6)]: "first", [d(7)]: "second" }, at: now - 1 * H },
      },
      decisions: { m3: { [d(3)]: "confirmed" } },
      seenBy: ["m1"],
    }),
    req({
      id: "R-102", agency: ME_AGENCY, title: "Autumn lookbook", clientType: "Fashion retail", fee: "¥90,000 / day",
      location: "Daikanyama, Tokyo", deadline: now - 26 * H, createdAt: now - 72 * H, dates: r102Dates,
      brief: "Department store autumn lookbook. Knitwear and outerwear, 40 looks over two days.",
      recipients: ["m9", "m13", "m14", "m19", "m22", "m16"],
      replies: {
        m9: { answers: all(r102Dates, "first"), at: now - 60 * H },
        m13: { answers: { [d(10)]: "first", [d(11)]: "ng" }, at: now - 50 * H },
        m14: { answers: all(r102Dates, "second"), at: now - 40 * H },
        m19: { answers: all(r102Dates, "first"), at: now - 30 * H },
        m22: { answers: all(r102Dates, "ng"), at: now - 55 * H },
        m16: { answers: { [d(10)]: "second", [d(11)]: "first" }, at: now - 35 * H },
      },
      decisions: { m9: { [d(10)]: "confirmed", [d(11)]: "confirmed" }, m19: { [d(10)]: "confirmed", [d(11)]: "confirmed" }, m14: { [d(10)]: "released", [d(11)]: "released" } },
    }),
    req({
      id: "R-103", agency: ME_AGENCY, title: "Skincare TV CM", clientType: "Cosmetics brand", jobType: "audition", fee: "¥250,000 buyout",
      location: "Akasaka, Tokyo", deadline: now + 30 * H, createdAt: now - 18 * H, dates: r103Dates,
      brief: "Audition for a 15s/30s skincare TV CM. Close-up beauty shots; clear skin, minimal makeup.",
      recipients: ["m1", "m10", "m19", "m3", "m21", "m13", "m23"],
      replies: {
        m1: { answers: { [d(4)]: "first", [d(21)]: "first", [d(22)]: "second" }, at: now - 10 * H },
        m19: { answers: { [d(4)]: "first", [d(21)]: "second", [d(22)]: "second" }, at: now - 12 * H },
        m21: { answers: all(r103Dates, "first"), at: now - 8 * H },
        m23: { answers: { [d(4)]: "ng", [d(21)]: "first", [d(22)]: "first" }, at: now - 6 * H },
      },
      seenBy: ["m1"],
    }),
    // Requests to Aiko from other (fictional) agencies
    req({
      id: "R-201", agency: "Studio Kumo", title: "Beauty magazine editorial", clientType: "Magazine", fee: "¥60,000 / day",
      location: "Nakameguro, Tokyo", deadline: now + 26 * H, createdAt: now - 1 * H, dates: [{ date: d(9), kind: "shoot" }, { date: d(10), kind: "shoot" }],
      brief: "Six-page beauty story on autumn skin. Two looks per day, natural light studio.", recipients: ["m1"],
    }),
    req({
      id: "R-202", agency: "North Pier Models", title: "Sparkling water print ad", clientType: "Beverage brand", jobType: "audition", fee: "¥180,000 + usage",
      location: "Minato, Tokyo", deadline: now + 50 * H, createdAt: now - 6 * H, dates: [{ date: d(2), kind: "audition" }, { date: d(15), kind: "shoot" }],
      brief: "Casting for a summer-feel print ad for a beverage brand. Bright, fresh, smiling.", recipients: ["m1"],
    }),
    req({
      id: "R-203", agency: "Harbor & Co.", title: "Café chain web campaign", clientType: "Food & drink", fee: "¥80,000 / day",
      location: "Kichijoji, Tokyo", deadline: now - 96 * H, createdAt: now - 140 * H, dates: [{ date: d(5), kind: "shoot" }],
      brief: "Seasonal drinks web campaign. Café interior, two outfits.", recipients: ["m1"],
      replies: { m1: { answers: { [d(5)]: "first" }, at: now - 120 * H } }, decisions: { m1: { [d(5)]: "confirmed" } }, seenBy: ["m1"],
    }),
  ]
  // the confirmed R-101 audition creates a booking
  book("m3", 3, "audition", "Spring running campaign", "R-101")
  book("m9", 10, "job", "Autumn lookbook", "R-102"); book("m9", 11, "job", "Autumn lookbook", "R-102")
  book("m19", 10, "job", "Autumn lookbook", "R-102"); book("m19", 11, "job", "Autumn lookbook", "R-102")

  const threads: Thread[] = [
    { id: `${ME_AGENCY}:m1`, agency: ME_AGENCY, modelId: "m1", messages: [
      { from: "agency", text: "Hi Aiko, the running campaign request just went out. Client loved your last café shoot.", at: now - 5 * H },
      { from: "model", text: "Thank you! I'll check my dates tonight.", at: now - 4.6 * H },
      { from: "agency", text: "Great. Deadline is short on this one, the client decides tomorrow morning.", at: now - 4.5 * H },
    ] },
    { id: `${ME_AGENCY}:m3`, agency: ME_AGENCY, modelId: "m3", messages: [
      { from: "model", text: "Is the audition on the 1st day in the same studio?", at: now - 3 * H },
      { from: "agency", text: "Yes, same studio in Shibuya. Call time 10:00.", at: now - 2.8 * H },
    ] },
    { id: `${ME_AGENCY}:m5`, agency: ME_AGENCY, modelId: "m5", messages: [
      { from: "agency", text: "Can you bring your own running shoes for the fitting?", at: now - 2 * H },
    ] },
    { id: `${ME_AGENCY}:m21`, agency: ME_AGENCY, modelId: "m21", messages: [
      { from: "model", text: "Updated my polaroids on my profile this morning.", at: now - 26 * H },
    ] },
    { id: "Studio Kumo:m1", agency: "Studio Kumo", modelId: "m1", messages: [
      { from: "agency", text: "Hello Aiko, we sent you a beauty editorial request. Would love to have you.", at: now - 1 * H },
    ] },
    { id: "Harbor & Co.:m1", agency: "Harbor & Co.", modelId: "m1", messages: [
      { from: "agency", text: "Confirmed for the café shoot. Call sheet to follow.", at: now - 90 * H },
      { from: "model", text: "Wonderful, thank you!", at: now - 89 * H },
    ] },
  ]

  const notices: Notice[] = [
    { id: "n1", to: "model", kind: "request", text: "New request from Studio Kumo: Beauty magazine editorial", at: now - 1 * H, read: false, link: "/model/requests/R-201" },
    { id: "n2", to: "model", kind: "deadline", text: "Deadline in 3h: Spring running campaign (Tokyo Faces)", at: now - 0.2 * H, read: false, link: "/model/requests/R-101" },
    { id: "n3", to: "model", kind: "confirmed", text: `Confirmed: Café chain web campaign on ${fmt(d(5))}`, at: now - 90 * H, read: true, link: "/model/requests/R-203" },
    { id: "n4", to: "agency", kind: "reply", text: "Hana Yoshida answered Spring running campaign", at: now - 1 * H, read: false, link: "/agency/responses/R-101" },
    { id: "n5", to: "agency", kind: "reply", text: "Kai Reyes answered Spring running campaign", at: now - 2 * H, read: false, link: "/agency/responses/R-101" },
    { id: "n6", to: "agency", kind: "deadline", text: "Spring running campaign closes in 3h, 3 models waiting", at: now - 0.2 * H, read: false, link: "/agency/responses/R-101" },
  ]

  return {
    models, bookings, requests, threads, notices,
    gcalConnected: false,
    gcalEvents: [{ date: d(14), title: "Dentist (Google)" }, { date: d(27), title: "Friend's wedding (Google)" }],
  }
}

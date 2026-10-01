import type { ReactNode } from "react"
import { NavLink, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from "react-router-dom"
import {
  Bell, CalendarDays, CalendarCheck, Clock, Grid3x3, Inbox, LayoutGrid, MessagesSquare, Plus, RotateCcw, UserRound, Users, Undo2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ago } from "@/lib/date"
import { ME_AGENCY, ME_MODEL } from "@/data"
import { useNow, useStore, visibleReply, type Role } from "@/store"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Photo } from "@/components/bits"
import Overview from "@/pages/agency/Overview"
import NewRequest from "@/pages/agency/NewRequest"
import Responses from "@/pages/agency/Responses"
import RosterPage from "@/pages/agency/Roster"
import Schedule from "@/pages/agency/Schedule"
import Messages from "@/pages/Messages"
import ModelInbox from "@/pages/model/Inbox"
import RequestDetail from "@/pages/model/RequestDetail"
import MyCalendar from "@/pages/model/MyCalendar"
import Profile from "@/pages/model/Profile"

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/agency/overview" element={<Overview />} />
        <Route path="/agency/new" element={<NewRequest />} />
        <Route path="/agency/responses/:id?" element={<Responses />} />
        <Route path="/agency/roster" element={<RosterPage />} />
        <Route path="/agency/schedule" element={<Schedule />} />
        <Route path="/agency/messages/:peer?" element={<Messages role="agency" />} />
        <Route path="/model/inbox" element={<ModelInbox />} />
        <Route path="/model/requests/:id" element={<RequestDetail />} />
        <Route path="/model/calendar" element={<MyCalendar />} />
        <Route path="/model/profile" element={<Profile />} />
        <Route path="/model/messages/:peer?" element={<Messages role="model" />} />
        <Route path="*" element={<Navigate to="/agency/overview" replace />} />
      </Route>
    </Routes>
  )
}

function Shell() {
  const { pathname } = useLocation()
  const role: Role = pathname.startsWith("/model") ? "model" : "agency"
  return (
    <div className="relative z-[2] flex min-h-screen">
      <Sidebar role={role} />
      <div className="flex min-w-0 flex-1 flex-col pl-[264px]">
        <TopBar role={role} />
        <main className="mx-auto w-full max-w-[1480px] flex-1 px-8 pt-4 pb-16">
          <Outlet />
        </main>
      </div>
      <Toasts />
    </div>
  )
}

function Sidebar({ role }: { role: Role }) {
  const now = useNow(5000)
  const s = useStore()
  const waiting = s.requests
    .filter((r) => r.agency === ME_AGENCY && r.deadline > now)
    .reduce((n, r) => n + r.recipients.filter((m) => !visibleReply(r, m, now)).length, 0)
  const toAnswer = s.requests.filter((r) => r.recipients.includes(ME_MODEL) && !r.replies[ME_MODEL] && r.deadline > now).length
  const items: [string, string, ReactNode, number?][] =
    role === "agency"
      ? [
          ["/agency/overview", "Overview", <LayoutGrid />],
          ["/agency/new", "New request", <Plus />],
          ["/agency/responses", "Responses", <Grid3x3 />, waiting],
          ["/agency/roster", "Roster", <Users />],
          ["/agency/schedule", "Schedule", <CalendarDays />],
          ["/agency/messages", "Messages", <MessagesSquare />],
        ]
      : [
          ["/model/inbox", "Requests", <Inbox />, toAnswer],
          ["/model/calendar", "My calendar", <CalendarDays />],
          ["/model/profile", "Profile", <UserRound />],
          ["/model/messages", "Messages", <MessagesSquare />],
        ]
  const me = s.models.find((m) => m.id === ME_MODEL)!
  return (
    <aside className="fixed inset-y-3 left-3 z-20 flex w-[240px] flex-col">
      <div className="shell h-full">
        <div className="core flex h-full flex-col p-3">
          <div className="flex items-center gap-2 px-2 pt-1 pb-5">
            <b className="block size-5 rounded-full bg-[conic-gradient(from_200deg,var(--clay),var(--ink),var(--sage),var(--clay))]" />
            <span className="font-serif text-[26px] leading-none tracking-[-0.02em]">Roster</span>
            <span className="ml-auto rounded-full bg-ink/5 px-2 py-0.5 font-mono text-[9.5px] tracking-[0.14em] text-muted-foreground uppercase">{role}</span>
          </div>
          <nav className="flex flex-col gap-0.5">
            {items.map(([to, text, icon, count]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "t-soft flex h-10 items-center gap-3 rounded-full px-3.5 text-[13.5px] [&_svg]:size-[17px] [&_svg]:stroke-[1.6]",
                    isActive ? "bg-ink text-paper" : "text-ink-2 hover:bg-ink/5",
                  )
                }
              >
                {icon}
                {text}
                {!!count && (
                  <span className="ml-auto rounded-full bg-clay px-1.5 py-px font-mono text-[10.5px] text-paper tabular-nums">{count}</span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto rounded-[1.1rem] bg-cream p-3 ring-1 ring-ink/6 ring-inset">
            {role === "agency" ? (
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-ink font-serif text-[18px] text-paper">T</span>
                <div className="leading-tight">
                  <div className="text-[13px] font-medium">{ME_AGENCY}</div>
                  <div className="text-[11.5px] text-muted-foreground">Booker: Mika Endo</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Photo model={me} size={36} />
                <div className="leading-tight">
                  <div className="text-[13px] font-medium">{me.name}</div>
                  <div className="text-[11.5px] text-muted-foreground">Freelance · @{me.instagram}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}

function TopBar({ role }: { role: Role }) {
  const nav = useNavigate()
  const reset = useStore((s) => s.reset)
  return (
    <header className="sticky top-0 z-10 px-8 pt-3 pb-2">
      <div className="mx-auto flex max-w-[1416px] items-center gap-3 rounded-full bg-paper/75 p-1.5 shadow-[inset_0_0_0_1px_rgba(30,25,21,.07),0_20px_40px_-28px_rgba(70,45,25,.35)] backdrop-blur-xl">
        <span className="pl-3 font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground uppercase">Viewing as</span>
        <div className="relative inline-flex rounded-full bg-ink/5 p-1 ring-1 ring-ink/8 ring-inset" role="tablist" aria-label="Switch role">
          <span
            aria-hidden
            className={cn(
              "absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-ink transition-transform duration-700 ease-soft",
              role === "model" && "translate-x-full",
            )}
          />
          {(["agency", "model"] as const).map((r) => (
            <button
              key={r}
              role="tab"
              aria-selected={role === r}
              onClick={() => nav(r === "agency" ? "/agency/overview" : "/model/inbox")}
              className={cn("relative z-[1] w-[200px] rounded-full py-1.5 text-[13px] transition-colors duration-500", role === r ? "text-paper" : "text-ink-2")}
            >
              {r === "agency" ? <>Agency <span className="opacity-60">(Tokyo Faces)</span></> : <>Model <span className="opacity-60">(Aiko Tanaka)</span></>}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <Notifications role={role} />
          <button
            onClick={() => { reset(); nav(role === "agency" ? "/agency/overview" : "/model/inbox") }}
            className="t-soft inline-flex h-9 items-center gap-2 rounded-full px-4 text-[12.5px] text-ink-2 ring-1 ring-ink/10 ring-inset hover:bg-ink/5"
          >
            <RotateCcw className="size-3.5" /> Reset demo
          </button>
        </div>
      </div>
    </header>
  )
}

function Notifications({ role }: { role: Role }) {
  const now = useNow(3000)
  const nav = useNavigate()
  const notices = useStore((s) => s.notices).filter((n) => n.to === role && n.at <= now).sort((a, b) => b.at - a.at)
  const read = useStore((s) => s.readNotices)
  const unread = notices.filter((n) => !n.read).length
  const icon = { request: <Inbox />, deadline: <Clock />, confirmed: <CalendarCheck />, released: <Undo2 />, reply: <Grid3x3 />, nudge: <Bell /> }
  return (
    <Popover onOpenChange={(o) => { if (!o) read(role) }}>
      <PopoverTrigger
        aria-label={`Notifications, ${unread} unread`}
        className="t-soft relative grid size-9 place-items-center rounded-full ring-1 ring-ink/10 ring-inset hover:bg-ink/5"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-clay px-1 font-mono text-[9.5px] text-paper">{unread}</span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={10} className="w-[380px] rounded-2xl p-2 shadow-[0_30px_60px_-30px_rgba(70,45,25,.45)]">
        <div className="flex items-center justify-between px-2 pt-1 pb-1.5">
          <span className="font-serif text-[22px]">Notifications</span>
          <span className="font-mono text-[10.5px] text-muted-foreground">{unread} unread</span>
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {notices.length === 0 && <p className="px-2 py-6 text-center text-muted-foreground">Nothing yet.</p>}
          {notices.slice(0, 12).map((n) => (
            <button
              key={n.id}
              onClick={() => nav(n.link)}
              className="t-soft flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-ink/5"
            >
              <span className={cn("mt-0.5 grid size-7 shrink-0 place-items-center rounded-full [&_svg]:size-3.5", n.kind === "confirmed" ? "bg-ink text-paper" : n.kind === "deadline" || n.kind === "nudge" ? "bg-clay-soft text-clay-ink" : "bg-cream text-ink-2")}>
                {icon[n.kind]}
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn("block text-[13px] leading-snug", !n.read && "font-medium")}>{n.text}</span>
                <span className="font-mono text-[10.5px] text-muted-foreground">{ago(n.at, now)}</span>
              </span>
              {!n.read && <i className="mt-2 size-2 shrink-0 rounded-full bg-clay" aria-label="unread" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function Toasts() {
  const toasts = useStore((s) => s.toasts)
  return (
    <div className="pointer-events-none fixed right-6 bottom-6 z-50 flex flex-col items-end gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="animate-in fade-in slide-in-from-bottom-2 rounded-full bg-ink px-5 py-3 text-[13px] text-paper shadow-[0_20px_40px_-20px_rgba(30,25,21,.6)] duration-500">
          {t.text}
        </div>
      ))}
    </div>
  )
}

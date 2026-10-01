import { Link, useNavigate } from "react-router-dom"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ArrowRight, Plus } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Bezel, Countdown, Cta, PageHeader, Stat } from "@/components/bits"
import { ME_AGENCY } from "@/data"
import { addDays, ago, fmt, today } from "@/lib/date"
import { useNow, useStore, visibleReply } from "@/store"

const chartConfig = {
  within2h: { label: "Replied < 2h", color: "var(--clay)" },
  later: { label: "Replied later", color: "var(--sage)" },
} satisfies ChartConfig

export default function Overview() {
  const now = useNow(1000)
  const nav = useNavigate()
  const s = useStore()
  const mine = s.requests.filter((r) => r.agency === ME_AGENCY)
  const open = mine.filter((r) => r.deadline > now).sort((a, b) => a.deadline - b.deadline)
  const waiting = open.reduce((n, r) => n + r.recipients.filter((m) => !visibleReply(r, m, now)).length, 0)
  const endOfDay = new Date(); endOfDay.setHours(23, 59, 59, 999)
  const dueToday = open.filter((r) => r.deadline <= endOfDay.getTime()).length
  const t = today()
  const weekEnd = addDays(t, 6)
  const confirmed = s.bookings.filter((b) => b.requestId && mine.some((r) => r.id === b.requestId) && b.date >= t && b.date <= weekEnd).length

  // Live response rate across all of this agency's requests (sent → answered).
  const sent = mine.reduce((n, r) => n + r.recipients.length, 0)
  const answered = mine.reduce((n, r) => n + r.recipients.filter((m) => visibleReply(r, m, now)).length, 0)
  const liveRate = sent ? Math.round((answered / sent) * 100) : 0
  const weeks = [
    { w: "W33", within2h: 41, later: 27 }, { w: "W34", within2h: 46, later: 25 }, { w: "W35", within2h: 52, later: 24 },
    { w: "W36", within2h: 58, later: 21 }, { w: "W37", within2h: 61, later: 22 }, { w: "W38", within2h: 66, later: 19 },
    { w: "W39", within2h: 70, later: 17 }, { w: "Now", within2h: Math.round(liveRate * 0.8), later: liveRate - Math.round(liveRate * 0.8) },
  ]

  const activity = s.notices.filter((n) => n.to === "agency" && n.at <= now).sort((a, b) => b.at - a.at).slice(0, 6)

  return (
    <>
      <PageHeader
        eyebrow={`Tokyo Faces · ${new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}`}
        title={<>Good morning, <em className="italic">Mika</em></>}
        sub="Every open brief, who has answered, and what closes next."
        actions={<Cta onClick={() => nav("/agency/new")} icon={<Plus className="size-4" />}>New request</Cta>}
      />

      <div className="grid grid-cols-12 gap-4">
        <Stat className="col-span-3" label="Open requests" value={open.length} hint={`${mine.length} sent this month`} />
        <Stat className="col-span-3" label="Replies waiting" value={waiting} hint="Models yet to answer open requests" />
        <Stat className="col-span-3" label="Deadlines today" value={dueToday} hint={open[0] ? <>Next: {open[0].title}</> : "None"} />
        <Stat className="col-span-3" label="Confirmed next 7 days" value={confirmed} hint="Model-days locked in" />

        <Bezel className="col-span-7" inner="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="eyebrow">Response rate</div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="font-serif text-[40px] leading-none">{liveRate}%</span>
                <span className="text-[12.5px] text-muted-foreground">{answered} of {sent} models answered · was 68% by email</span>
              </div>
            </div>
            <div className="flex gap-4 text-[11.5px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-[3px] bg-clay" />Replied &lt; 2h</span>
              <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-[3px] bg-sage" />Replied later</span>
            </div>
          </div>
          <ChartContainer config={chartConfig} className="mt-4 h-[230px] w-full">
            <BarChart data={weeks} barCategoryGap={18}>
              <CartesianGrid vertical={false} strokeDasharray="3 4" />
              <XAxis dataKey="w" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
              <YAxis tickLine={false} axisLine={false} width={32} fontSize={11} unit="%" domain={[0, 100]} />
              <ChartTooltip cursor={{ fill: "rgba(30,25,21,.04)" }} content={<ChartTooltipContent />} />
              <Bar dataKey="within2h" stackId="a" fill="var(--color-within2h)" radius={[0, 0, 4, 4]} />
              <Bar dataKey="later" stackId="a" fill="var(--color-later)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </Bezel>

        <Bezel className="col-span-5" inner="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="eyebrow">Closing next</div>
            <Link to="/agency/responses" className="text-[12.5px] text-clay hover:underline">All responses</Link>
          </div>
          <ul className="divide-y divide-ink/8">
            {open.map((r) => {
              const got = r.recipients.filter((m) => visibleReply(r, m, now)).length
              return (
                <li key={r.id}>
                  <Link to={`/agency/responses/${r.id}`} className="t-soft group -mx-2 flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-ink/4">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-medium">{r.title}</div>
                      <div className="text-[12px] text-muted-foreground">{r.clientType} · {r.dates.map((d) => fmt(d.date)).join(", ")}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-cream ring-1 ring-ink/6 ring-inset">
                          <div className="h-full rounded-full bg-sage" style={{ width: `${(got / r.recipients.length) * 100}%` }} />
                        </div>
                        <span className="font-mono text-[10.5px] text-muted-foreground">{got}/{r.recipients.length} answered</span>
                      </div>
                    </div>
                    <Countdown deadline={r.deadline} now={now} />
                    <ArrowRight className="t-soft size-4 text-muted-foreground group-hover:translate-x-0.5" />
                  </Link>
                </li>
              )
            })}
            {open.length === 0 && <li className="py-6 text-center text-muted-foreground">No open requests.</li>}
          </ul>
        </Bezel>

        <Bezel className="col-span-12" inner="p-5">
          <div className="eyebrow mb-3">Recent activity</div>
          <div className="grid grid-cols-3 gap-x-6 gap-y-2">
            {activity.map((n) => (
              <Link key={n.id} to={n.link} className="t-soft flex items-baseline gap-3 rounded-lg px-2 py-1.5 hover:bg-ink/4">
                <span className="w-16 shrink-0 font-mono text-[10.5px] text-muted-foreground">{ago(n.at, now)}</span>
                <span className="truncate text-[13px]">{n.text}</span>
              </Link>
            ))}
          </div>
        </Bezel>
      </div>
    </>
  )
}

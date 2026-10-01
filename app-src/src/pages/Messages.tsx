import { useEffect, useRef, useState } from "react"
import { Link, Navigate, useParams } from "react-router-dom"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Bezel, PageHeader, Photo } from "@/components/bits"
import { ME_AGENCY, ME_MODEL } from "@/data"
import { ago } from "@/lib/date"
import { modelById, useNow, useStore, type Role } from "@/store"

export default function Messages({ role }: { role: Role }) {
  const { peer } = useParams()
  const now = useNow(30000)
  const s = useStore()
  const [text, setText] = useState("")
  const end = useRef<HTMLDivElement>(null)
  const base = role === "agency" ? "/agency/messages" : "/model/messages"

  const threads = s.threads
    .filter((t) => (role === "agency" ? t.agency === ME_AGENCY : t.modelId === ME_MODEL))
    .sort((a, b) => (b.messages.at(-1)?.at ?? 0) - (a.messages.at(-1)?.at ?? 0))
  const peerOf = (t: (typeof threads)[number]) => (role === "agency" ? t.modelId : t.agency)
  const active = peer ? threads.find((t) => peerOf(t) === peer) : undefined
  const agency = role === "agency" ? ME_AGENCY : peer ?? ""
  const modelId = role === "agency" ? peer ?? "" : ME_MODEL

  useEffect(() => { end.current?.scrollIntoView({ block: "end" }) }, [active?.messages.length, peer])
  if (!peer && threads[0]) return <Navigate to={`${base}/${encodeURIComponent(peerOf(threads[0]))}`} replace />

  const send = () => {
    if (!text.trim() || !peer) return
    s.sendMessage(agency, modelId, role, text.trim())
    setText("")
  }
  const title = role === "agency" ? (peer ? modelById(s, peer)?.name : "") : peer

  return (
    <>
      <PageHeader eyebrow="Messages" title={role === "agency" ? "Talk to your models" : "Talk to agencies"} />
      <Bezel inner="grid h-[calc(100vh-220px)] min-h-[520px] grid-cols-[320px_1fr] overflow-hidden">
        <ul className="overflow-y-auto border-r border-ink/8 p-2">
          {threads.map((t) => {
            const p = peerOf(t)
            const last = t.messages.at(-1)
            const m = modelById(s, t.modelId)
            return (
              <li key={t.id}>
                <Link
                  to={`${base}/${encodeURIComponent(p)}`}
                  className={cn("t-soft flex items-center gap-3 rounded-2xl p-2.5", p === peer ? "bg-cream ring-1 ring-ink/8 ring-inset" : "hover:bg-ink/4")}
                >
                  {role === "agency" ? <Photo model={m} size={38} /> : <span className="grid size-[38px] shrink-0 place-items-center rounded-full bg-ink font-serif text-[18px] text-paper">{t.agency[0]}</span>}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[13.5px] font-medium">{role === "agency" ? m.name : t.agency}</span>
                      {last && <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{ago(last.at, now)}</span>}
                    </span>
                    <span className="block truncate text-[12.5px] text-muted-foreground">{last ? `${last.from === role ? "You: " : ""}${last.text}` : "No messages yet"}</span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
        <div className="flex min-h-0 flex-col">
          {peer ? (
            <>
              <div className="flex items-center gap-3 border-b border-ink/8 px-5 py-3.5">
                {role === "agency" && modelById(s, peer) && <Photo model={modelById(s, peer)} size={32} />}
                <span className="font-serif text-[24px] leading-none">{title}</span>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto px-5 py-4">
                {(active?.messages ?? []).map((msg, i) => {
                  const mine = msg.from === role
                  return (
                    <div key={i} className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
                      <div className={cn("max-w-[64%] rounded-[1.1rem] px-3.5 py-2 text-[13.5px] leading-snug", mine ? "rounded-br-md bg-ink text-paper" : "rounded-bl-md bg-cream text-ink ring-1 ring-ink/6 ring-inset")}>
                        {msg.text}
                      </div>
                      <span className="mt-0.5 px-1 font-mono text-[9.5px] text-muted-foreground">{ago(msg.at, now)}</span>
                    </div>
                  )
                })}
                {!active && <p className="pt-10 text-center text-muted-foreground">Start the conversation.</p>}
                <div ref={end} />
              </div>
              <form onSubmit={(e) => { e.preventDefault(); send() }} className="flex items-center gap-2 border-t border-ink/8 p-3">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={`Message ${title}`}
                  aria-label="Message"
                  className="h-11 flex-1 rounded-full bg-cream px-5 text-[13.5px] ring-1 ring-ink/8 ring-inset outline-none focus:ring-ink/25"
                />
                <button type="submit" aria-label="Send" disabled={!text.trim()} className="t-soft grid size-11 place-items-center rounded-full bg-ink text-paper hover:bg-ink-2 active:scale-95 disabled:opacity-40">
                  <ArrowUp className="size-4" />
                </button>
              </form>
            </>
          ) : (
            <p className="m-auto text-muted-foreground">No conversations yet.</p>
          )}
        </div>
      </Bezel>
    </>
  )
}

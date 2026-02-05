"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@clerk/nextjs"
import { useProfile } from "@/hooks/react-query/useUser"
import { useRouter } from "next/navigation"

/* ================= TYPES ================= */

type ChatMessage = {
  role: "user" | "bot"
  content: string
}

type ParsedBlock =
  | { type: "date"; value: string }
  | {
    type: "booking"
    hall: string
    time: string
    status: string
    id: string
    past: boolean
  }

/* ================= ACTION-AWARE FALLBACK ================= */

function renderTextWithActions(
  text: string,
  onOpenBooking: (id: string) => void,
  onCreateBooking: (hallId: string, start: string, end: string) => void
) {
  const tokenRegex = /\[(OPEN_BOOKING|CREATE_BOOKING):([^\]]+)\]/g
  const parts: React.ReactNode[] = []

  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = tokenRegex.exec(text)) !== null) {
    // Push text before token
    if (match.index > lastIndex) {
      parts.push(
        <span key={lastIndex}>
          {text.slice(lastIndex, match.index)}
        </span>
      )
    }

    const type = match[1]
    const payload = match[2]

    if (type === "OPEN_BOOKING") {
      parts.push(
        <button
          key={payload}
          onClick={() => onOpenBooking(payload)}
          className="block mt-2 text-xs text-blue-600 hover:underline"
        >
          Open booking →
        </button>
      )
    }

    if (type === "CREATE_BOOKING") {
      const [hallId, start, end] = payload.split("|")

      if (hallId && start && end) {
        parts.push(
          <button
            key={`${hallId}-${start}`}
            onClick={() => onCreateBooking(hallId, start, end)}
            className="block mt-2 text-xs text-green-600 hover:underline"
          >
            Create booking →
          </button>
        )
      }
    }

    lastIndex = tokenRegex.lastIndex
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push(
      <span key="end">
        {text.slice(lastIndex)}
      </span>
    )
  }

  return <div className="whitespace-pre-line">{parts}</div>
}


/* ================= STRUCTURED PARSER ================= */

function parseBotMessage(content: string) {
  const lines = content.split("\n")
  const blocks: ParsedBlock[] = []
  let currentDate: string | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (line.startsWith("DATE:")) {
      currentDate = line.replace("DATE:", "")
      blocks.push({ type: "date", value: currentDate })
    }

    if (line === "BOOKING:") {
      const hall = lines[++i]?.split("=")[1] ?? ""
      const time = lines[++i]?.split("=")[1] ?? ""
      const status = lines[++i]?.split("=")[1] ?? ""
      const id = lines[++i]?.split("=")[1] ?? ""

      const isPast =
        currentDate !== null &&
        new Date(currentDate) <
        new Date(new Date().toDateString())

      blocks.push({
        type: "booking",
        hall,
        time,
        status,
        id,
        past: isPast,
      })
    }
  }

  return blocks
}

function hasStructuredBlocks(blocks: ParsedBlock[]) {
  return blocks.some(
    (b) => b.type === "date" || b.type === "booking"
  )
}

function statusColor(status: string) {
  switch (status) {
    case "approved":
      return "text-green-600"
    case "pending":
      return "text-yellow-600"
    case "rejected":
      return "text-red-600"
    default:
      return "text-gray-600"
  }
}

/* ================= COMPONENT ================= */

export default function FloatingAskBar() {
  const { userId } = useAuth()
  const router = useRouter
  const { data: profile } = useProfile(userId || "")

  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPast, setShowPast] = useState(false)

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      content:
        "Ask me about seminar hall availability, bookings, or pending approvals.",
    },
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  /* ================= SEND ================= */

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    setMessages((p) => [...p, { role: "user", content: input }])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          profileId: profile?.id,
        }),
      })

      const data = await res.json()
      setMessages((p) => [...p, { role: "bot", content: data.reply }])
    } catch {
      setMessages((p) => [
        ...p,
        { role: "bot", content: "Something went wrong." },
      ])
    } finally {
      setLoading(false)
    }
  }

  /* ================= UI ================= */

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 rounded-full bg-black p-4 text-white shadow-xl hover:scale-110 transition-all"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[460px] h-[640px] rounded-3xl border bg-white shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-black px-6 py-4 text-white">
            <div>
              <h3 className="font-semibold text-base">
                Seminar Assistant
              </h3>
              <p className="text-xs text-gray-400">
                Always here to help
              </p>
            </div>
            <button onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex",
                  msg.role === "user"
                    ? "justify-end"
                    : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "w-full rounded-xl px-4 py-3 text-sm",
                    msg.role === "user"
                      ? "bg-black text-white max-w-[75%]"
                      : "bg-white border"
                  )}
                >
                  {msg.role === "bot" ? (
                    (() => {
                      const blocks = parseBotMessage(msg.content)

                      if (!hasStructuredBlocks(blocks)) {
                        return renderTextWithActions(
                          msg.content,
                          (id) =>
                          (window.location.href =
                            `/dashboard/bookings/${id}`),
                          (hallId, start, end) => {
                            const params = new URLSearchParams({
                              hallId,
                              start,
                              end,
                            })
                            window.location.href =
                              `/dashboard/book`
                          }
                        )
                      }

                      return (
                        <div className="space-y-3">
                          {blocks.map((b, i) => {
                            if (b.type === "date") {
                              return (
                                <div
                                  key={i}
                                  className="font-semibold border-b pb-1"
                                >
                                  {new Date(b.value).toDateString()}
                                </div>
                              )
                            }

                            if (b.type === "booking") {
                              if (b.past && !showPast) return null

                              return (
                                <div
                                  key={i}
                                  className="w-full rounded-xl border px-4 py-3"
                                >
                                  <div className="font-medium">
                                    {b.hall}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {b.time}
                                  </div>
                                  <div
                                    className={cn(
                                      "text-xs font-medium mt-1",
                                      statusColor(b.status)
                                    )}
                                  >
                                    {b.status}
                                  </div>
                                  <button
                                    onClick={() =>
                                    (window.location.href =
                                      `/dashboard/bookings/${b.id}`)
                                    }
                                    className="mt-2 text-xs text-blue-600 hover:underline"
                                  >
                                    View details →
                                  </button>
                                </div>
                              )
                            }
                          })}

                          {blocks.some(
                            (b) => b.type === "booking" && b.past
                          ) && (
                              <button
                                onClick={() =>
                                  setShowPast(!showPast)
                                }
                                className="text-xs text-blue-600 hover:underline"
                              >
                                {showPast
                                  ? "Hide past bookings"
                                  : "Show past bookings"}
                              </button>
                            )}
                        </div>
                      )
                    })()
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking…
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t px-4 py-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                !e.shiftKey &&
                (e.preventDefault(), sendMessage())
              }
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
              placeholder="Ask a question…"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

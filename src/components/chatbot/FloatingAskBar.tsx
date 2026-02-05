"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { profile } from "console"
import { useAuth } from "@clerk/nextjs"
import { useProfile } from "@/hooks/react-query/useUser"

type ChatMessage = {
  role: "user" | "bot"
  content: string
}

export default function FloatingAskBar() {
  const { userId } = useAuth();

  const { data: profile } = useProfile(userId || "");
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      content: "Ask me about seminar hall availability, equipment, or hall details.",
    },
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (open) {
      setTimeout(scrollToBottom, 50)
    }
  }, [open])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content, profileId: profile?.id }),
      })

      const data = await res.json()

      setMessages((prev) => [...prev, { role: "bot", content: data.reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Something went wrong. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 rounded-full bg-black p-4 text-white shadow-xl hover:scale-110 transition-all"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div
          className="
            fixed bottom-6 right-6 z-50
            w-[420px] h-[620px]      /* 🔹 wider */
            rounded-2xl
            border border-gray-200
            bg-white
            shadow-2xl
            flex flex-col
            overflow-hidden
            animate-in fade-in zoom-in-95
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-linear-to-r from-black to-gray-900 px-6 py-4 text-white">
            <div>
              <h3 className="font-semibold text-base">Seminar Assistant</h3>
              <p className="text-xs text-gray-300">Always here to help</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition"
              aria-label="Close chat"
            >
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
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-xl px-4 py-2.5 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-black text-white rounded-br-none shadow"
                      : "bg-white text-gray-900 border rounded-bl-none shadow-sm"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t bg-white px-4 py-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                !e.shiftKey &&
                (e.preventDefault(), sendMessage())
              }
              placeholder="Ask a question..."
              className="
                flex-1 rounded-lg border
                px-3 py-2 text-sm
                outline-none
                focus:ring-2 focus:ring-black/20
                transition
              "
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="
                rounded-lg bg-black px-4 py-2
                text-white
                hover:bg-gray-900
                disabled:opacity-50
                transition
              "
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

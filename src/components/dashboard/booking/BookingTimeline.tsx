"use client"

import { Clock, CheckCircle } from "lucide-react"

export function BookingTimeline({
  logs,
  completed,
}: {
  logs: any[]
  completed: boolean
}) {
  return (
    <div className="space-y-6">
      {logs.map((log, index) => {
        const isLast = index === logs.length - 1
        const shouldBlink = !completed && isLast

        return (
          <div key={log.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-3 h-3 rounded-full ${
                  completed
                    ? "bg-emerald-500"
                    : shouldBlink
                    ? "bg-primary animate-pulse"
                    : "bg-primary"
                }`}
              />
              {index < logs.length - 1 && (
                <div className="w-px h-10 bg-border" />
              )}
            </div>

            <div className="flex-1">
              <div className="rounded-lg border p-4 bg-muted/40">
                <p className="text-sm font-semibold flex items-center gap-2">
                  {completed && isLast ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-primary" />
                  )}
                  {log.action}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

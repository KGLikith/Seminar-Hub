export type LogBase = {
  createdAt: Date
}

/* ---------------- NOTIFICATION / EMAIL ---------------- */

export type NotificationLog = LogBase & {
  channel: "email" | "in_app" | "sms"
  event: string
  to: string
  status: "sent" | "failed"
  error?: string
  reference?: {
    bookingId?: string
    maintenanceId?: string
  }
}

/* ---------------- USER ACTION ---------------- */

export type UserActionLog = LogBase & {
  actorId: string
  role: string
  action: string
  entity: {
    type: string
    id: string
  }
  meta?: Record<string, any>
}

/* ---------------- SYSTEM / ERROR ---------------- */

export type SystemLog = LogBase & {
  source: string
  severity: "info" | "warning" | "error"
  message: string
  stack?: string
  context?: Record<string, any>
}

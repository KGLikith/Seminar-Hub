import { logToMongo } from "@/lib/logs/logger"

export async function logEmailEvent(data: {
  event: string
  to: string
  subject: string
  status: "sent" | "failed"

  body: {
    html: string
    text?: string | null
  }

  payload: any

  reference?: {
    bookingId?: string
    maintenanceId?: string
  }

  provider?: {
    name: string
    messageId?: string
  }

  error?: {
    message: string
    stack?: string
  }
}) {
  await logToMongo("logs_notifications", {
    category: "notification",
    channel: "email",
    ...data,
  })
}

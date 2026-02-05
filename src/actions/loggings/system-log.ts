import { logToMongo } from "@/lib/logs/logger"

export async function logSystemError(data: {
  source: string
  message: string
  stack?: string
  context?: Record<string, any>
}) {
  await logToMongo("logs_system", {
    severity: "error",
    ...data,
  })
}

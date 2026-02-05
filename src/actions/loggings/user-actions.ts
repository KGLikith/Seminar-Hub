import { logToMongo } from "@/lib/logs/logger"

export async function logUserAction(data: {
  actorId: string
  role: string
  action: string
  entity: {
    type: string
    id: string
  }
  meta?: Record<string, any>
}) {
  await logToMongo("logs_user_actions", data)
}

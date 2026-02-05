import prisma from "@/lib/db"
import { ChatContext } from "./types"
import { resolveHallFromMessage } from "./hall"

export async function handleMaintenance(ctx: ChatContext) {
  const hall = await resolveHallFromMessage(ctx.message)
  if (!hall) {
    return "I couldn’t identify the hall for this maintenance request."
  }

  await prisma.maintenanceRequest.create({
    data: {
      hall_id: hall.id,
      tech_staff_id: ctx.profileId,
      target: "hall",
      request_type: "general_issue",
      priority: "medium",
      title: "Reported via chatbot",
      description: ctx.message,
    },
  })

  return "✅ Maintenance request has been logged and sent for approval."
}

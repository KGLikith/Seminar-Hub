import { detectIntent } from "./intent"
import { handleAvailability } from "./availability"
import { handleMaintenance } from "./maintenance"
import { ChatContext } from "./types"

export async function routeChatbotMessage(ctx: ChatContext) {
  const intent = detectIntent(ctx.message)

  switch (intent) {
    case "availability":
      return handleAvailability(ctx)

    case "maintenance":
      return handleMaintenance(ctx)

    default:
      return "I’m not sure how to help with that yet."
  }
}

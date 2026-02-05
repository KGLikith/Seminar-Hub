import { detectIntent } from "./intent"
import {
  handleAvailability,
  handleMyBookings,
  handleHodPendingBookings,
} from "./handlers"
import { ChatContext } from "./types"

export async function routeChatbotMessage(ctx: ChatContext) {
  const intent = detectIntent(ctx.message)

  switch (intent) {
    case "availability":
      return handleAvailability(ctx)

    case "my_bookings":
      return handleMyBookings(ctx)

    case "hod_pending_bookings":
      return handleHodPendingBookings(ctx)

    default:
      return "I can help with hall availability, your bookings, or pending approvals."
  }
}

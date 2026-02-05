import { Intent } from "./types"

export function detectIntent(message: string): Intent {
  const msg = message.toLowerCase()

  if (msg.includes("available") || msg.includes("free") || msg.includes("free after") || msg.includes("available after"))
    return "availability"

  if (msg.includes("my booking") || msg.includes("history"))
    return "my_bookings"

  if (msg.includes("pending") && msg.includes("approval"))
    return "hod_pending_bookings"

  return "unknown"
}

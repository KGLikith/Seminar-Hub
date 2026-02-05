export type Intent =
  | "availability"
  | "maintenance"
  | "booking"
  | "status"
  | "unknown"

export function detectIntent(message: string): Intent {
  const msg = message.toLowerCase()

  if (msg.includes("available") || msg.includes("free"))
    return "availability"

  if (
    msg.includes("not working") ||
    msg.includes("broken") ||
    msg.includes("issue") ||
    msg.includes("repair") ||
    msg.includes("install")
  )
    return "maintenance"

  if (msg.includes("book") || msg.includes("reserve"))
    return "booking"

  if (msg.includes("status") || msg.includes("update"))
    return "status"

  return "unknown"
}

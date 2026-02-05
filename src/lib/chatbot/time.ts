export function extractTimeWindow(message: string) {
  const now = new Date()

  let start = now
  let end = new Date(now.getTime() + 2 * 60 * 60 * 1000)

  if (message.toLowerCase().includes("tomorrow")) {
    start = new Date()
    start.setDate(start.getDate() + 1)
    start.setHours(9, 0, 0, 0)
    end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
  }

  return { start, end }
}

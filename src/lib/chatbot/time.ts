export function extractTimeWindow(message: string, now = new Date()) {
  const text = message.toLowerCase()

  let baseDate = new Date(now)

  /* ================= DATE ================= */

  if (text.includes("tomorrow")) {
    baseDate.setDate(baseDate.getDate() + 1)
    baseDate.setHours(0, 0, 0, 0)
  }

  /* ================= AVAILABLE NOW ================= */

  if (
    text.includes("now") ||
    text.includes("currently") ||
    text.includes("right now")
  ) {
    const start = new Date(now)
    const end = new Date(now.getTime() + 2 * 60 * 60 * 1000) // next 2 hours
    return { start, end }
  }

  /* ================= DEFAULT WINDOW ================= */

  let start = new Date(baseDate)
  let end = new Date(baseDate)

  // default: 9 AM – 11 AM
  start.setHours(9, 0, 0, 0)
  end.setHours(11, 0, 0, 0)

  /* ================= TIME PARSING ================= */

  const timeRegex =
    /\b(\d{1,2})(?::(\d{2}))?\s?(am|pm)?\b/g

  const matches = [...text.matchAll(timeRegex)]

  const parseTime = (m: RegExpMatchArray) => {
    let hour = Number(m[1])
    const minute = m[2] ? Number(m[2]) : 0
    const meridian = m[3]

    if (meridian) {
      if (meridian === "pm" && hour < 12) hour += 12
      if (meridian === "am" && hour === 12) hour = 0
    }

    return { hour, minute }
  }

  if (matches.length === 1) {
    const t = parseTime(matches[0])
    start.setHours(t.hour, t.minute, 0, 0)
    end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
  }

  if (matches.length >= 2) {
    const t1 = parseTime(matches[0])
    const t2 = parseTime(matches[1])

    start.setHours(t1.hour, t1.minute, 0, 0)
    end.setHours(t2.hour, t2.minute, 0, 0)

    if (end <= start) {
      end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
    }
  }

  return { start, end }
}

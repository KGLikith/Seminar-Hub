export type ParsedQuery = {
  intent:
    | "availability"
    | "hall_info"
    | "equipment"
    | "my_bookings"
    | "hod_pending_bookings"
    | "hod_pending_maintenance"
    | "unknown"
  hallName?: string
  date?: string
  time?: string
}

export function parseMessage(message: string): ParsedQuery {
  const text = message.toLowerCase()

  // Hall name: supports "main auditorium", "seminar hall 1", "ise seminar hall"
  const hallMatch = text.match(
    /(main auditorium|seminar hall\s?\d+|[a-z\s]+seminar hall|[a-z\s]+hall)/i
  )

  // Date: today / tomorrow / 12 jan / 12th jan
  const dateMatch =
    text.match(/\b(today|tomorrow)\b/i) ||
    text.match(/\b\d{1,2}(st|nd|rd|th)?\s?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i)

  // Time: 9 am, 11:30 am
  const timeMatch = text.match(/\b\d{1,2}(:\d{2})?\s?(am|pm)\b/i)

  if (/available|availability|free/.test(text)) {
    return {
      intent: "availability",
      hallName: hallMatch?.[0],
      date: dateMatch?.[0],
      time: timeMatch?.[0],
    }
  }

  if (/equipment|projector|mic|speaker/.test(text)) {
    return {
      intent: "equipment",
      hallName: hallMatch?.[0],
    }
  }

  if (/capacity|location|department|info/.test(text)) {
    return {
      intent: "hall_info",
      hallName: hallMatch?.[0],
    }
  }

  if (/my bookings|my booking/.test(text)) {
    return { intent: "my_bookings" }
  }

  if (/pending.*booking/.test(text)) {
    return { intent: "hod_pending_bookings" }
  }

  if (/pending.*maintenance/.test(text)) {
    return { intent: "hod_pending_maintenance" }
  }

  return { intent: "unknown" }
}

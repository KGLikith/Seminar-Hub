import prisma from "@/lib/db"
import { ChatContext } from "../types"
import { resolveHallFromMessage } from "../hall"
import { extractTimeWindow } from "../time"

export async function handleAvailability(ctx: ChatContext) {
  const hall = await resolveHallFromMessage(ctx.message)
  if (!hall) {
    return "I couldn’t identify the seminar hall you are referring to."
  }

  const { start, end } = extractTimeWindow(ctx.message)

  const conflicts = await prisma.booking.findMany({
    where: {
      hall_id: hall.id,
      status: "approved",
      start_time: { lt: end },
      end_time: { gt: start },
    },
    include: {
      teacher: { select: { name: true } },
    },
    orderBy: { start_time: "asc" },
  })

  /* ---------- NO CONFLICTS ---------- */

  if (conflicts.length === 0) {
    return `${hall.name} is available during the requested time.
[CREATE_BOOKING:${hall.id}|${start.toISOString()}|${end.toISOString()}]`
  }

  /* ---------- CHECK FREE WINDOW BEFORE FIRST CONFLICT ---------- */

  const first = conflicts[0]

  if (first.start_time > start) {
    return `${hall.name} is available until ${formatTime(first.start_time)}.
Booked by ${first.teacher?.name ?? "another user"} from ${formatTime(
      first.start_time
    )} to ${formatTime(first.end_time)}.
[CREATE_BOOKING:${hall.id}|${start.toISOString()}|${first.start_time.toISOString()}]`
  }

  /* ---------- CHECK FREE WINDOW AFTER LAST CONFLICT ---------- */

  const last = conflicts[conflicts.length - 1]

  if (last.end_time < end) {
    return `${hall.name} is booked until ${formatTime(last.end_time)}.
Booked by ${last.teacher?.name ?? "another user"} from ${formatTime(
      last.start_time
    )} to ${formatTime(last.end_time)}.
[CREATE_BOOKING:${hall.id}|${last.end_time.toISOString()}|${end.toISOString()}]`
  }

  /* ---------- FULLY BLOCKED ---------- */

  return `${hall.name} is not available during the requested time.
Booked from ${formatTime(first.start_time)} to ${formatTime(
    last.end_time
  )}.
[OPEN_BOOKING:${first.id}]`
}

/* ---------- helpers ---------- */

function formatTime(date: Date) {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
}

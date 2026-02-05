import prisma from "@/lib/db"
import { ChatContext } from "./types"
import { resolveHallFromMessage } from "./hall"
import { extractTimeWindow } from "./time"

export async function handleAvailability(ctx: ChatContext) {
  const hall = await resolveHallFromMessage(ctx.message)
  if (!hall) {
    return "I couldn’t identify the seminar hall you are referring to."
  }

  const { start, end } = extractTimeWindow(ctx.message)

  const overlappingBooking = await prisma.booking.findFirst({
    where: {
      hall_id: hall.id,
      status: { in: ["approved"] },
      start_time: { lt: end },
      end_time: { gt: start },
    },
  })

  /* ---------- ROLE-BASED RESPONSE ---------- */

  if (ctx.roles.includes("teacher")) {
    return overlappingBooking
      ? `${hall.name} is not available during the requested time.`
      : `${hall.name} is available during the requested time.`
  }

  if (ctx.roles.includes("tech_staff")) {
    return overlappingBooking
      ? `${hall.name} is booked, but you may still access it for maintenance.`
      : `${hall.name} is currently free and accessible.`
  }

  if (ctx.roles.includes("hod")) {
    return overlappingBooking
      ? `${hall.name} is booked. You may review or override the booking if necessary.`
      : `${hall.name} is available.`
  }

  return "You do not have permission to view this information."
}

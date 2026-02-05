import prisma from "@/lib/db"
import { ChatContext } from "../types"

export async function handleHodPendingBookings(ctx: ChatContext) {
  if (!ctx.roles.includes("hod")) {
    return "You are not authorized to view pending approvals."
  }

  const bookings = await prisma.booking.findMany({
    where: {
      status: "pending",
      teacher_id: ctx.profileId,
    },
    include: {
      hall: true,
      teacher: true,
    },
    orderBy: { created_at: "desc" },
  })

  if (bookings.length === 0) {
    return "There are no pending booking approvals."
  }

  const grouped = groupByDate(bookings)

  return Object.entries(grouped)
    .map(
      ([date, items]) =>
        `DATE:${date}\n` +
        items.map(formatHodBooking).join("\n")
    )
    .join("\n")
}

/* ---------- helpers ---------- */

function groupByDate(bookings: any[]) {
  return bookings.reduce<Record<string, any[]>>((acc, b) => {
    const date = b.booking_date.toISOString().split("T")[0]
    acc[date] ??= []
    acc[date].push(b)
    return acc
  }, {})
}

function formatHodBooking(b: any) {
  return `BOOKING:
HALL=${b.hall.name}
REQUESTED_BY=${b.teacher.name}
DATE=${b.booking_date.toLocaleDateString()}
TIME=${b.start_time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}–${b.end_time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}
STATUS=${b.status}
ID=${b.id}
`
}

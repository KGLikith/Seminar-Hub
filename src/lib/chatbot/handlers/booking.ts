import prisma from "@/lib/db"
import { ChatContext } from "../types"

export async function handleMyBookings(ctx: ChatContext) {
  if (!ctx.roles.includes("teacher")) {
    return "You are not authorized to view personal bookings."
  }

  const now = new Date()

  /* ---------- STEP 1: UPCOMING BOOKINGS ---------- */

  const upcoming = await prisma.booking.findMany({
    where: {
      teacher_id: ctx.profileId,
      status: { in: ["approved", "pending"] },
      start_time: { gt: now },
    },
    include: { hall: true },
    orderBy: { start_time: "asc" },
    take: 5,
  })

  if (upcoming.length > 0) {
    const grouped = groupByDate(upcoming)

    return Object.entries(grouped)
      .map(
        ([date, items]) =>
          `DATE:${date}\n` +
          items.map(formatBooking).join("\n")
      )
      .join("\n")
  }

  /* ---------- STEP 2: FALLBACK TO HISTORY ---------- */

  const history = await prisma.booking.findMany({
    where: {
      teacher_id: ctx.profileId,
      status: { in: ["cancelled", "completed", "rejected"] },
      end_time: { lt: now },
    },
    include: { hall: true },
    orderBy: { end_time: "desc" },
    take: 5,
  })

  if (history.length === 0) {
    return "No upcoming bookings and no booking history found."
  }

  const groupedHistory = groupByDate(history)

  return (
    "PAST_BOOKINGS\n" +
    Object.entries(groupedHistory)
      .map(
        ([date, items]) =>
          `DATE:${date}\n` +
          items.map(formatBooking).join("\n")
      )
      .join("\n")
  )
}

/* ================= HELPERS ================= */

function groupByDate(bookings: any[]) {
  return bookings.reduce<Record<string, any[]>>((acc, b) => {
    const date = b.booking_date.toISOString().split("T")[0]
    acc[date] ??= []
    acc[date].push(b)
    return acc
  }, {})
}

function formatBooking(b: any) {
  return `BOOKING:
HALL=${b.hall.name}
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

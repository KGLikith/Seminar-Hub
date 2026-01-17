import prisma from "@/lib/db"
import { Parser } from "json2csv"
import { NextResponse } from "next/server"

export async function GET(
  _: Request,
  { params }: { params: { hallId: string } }
) {
  const bookings = await prisma.booking.findMany({
    where: { hall_id: params.hallId },
    include: {
      teacher: { select: { name: true, email: true } },
    },
    orderBy: { booking_date: "desc" },
  })

  const rows = bookings.map(b => ({
    date: b.booking_date.toISOString().split("T")[0],
    start_time: b.start_time.toISOString(),
    end_time: b.end_time.toISOString(),
    teacher: b.teacher.name,
    email: b.teacher.email,
    status: b.status,
    purpose: b.purpose,
    participants: b.expected_participants ?? "-",
  }))

  const parser = new Parser()
  const csv = parser.parse(rows)

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=hall-booking-history.csv`,
    },
  })
}

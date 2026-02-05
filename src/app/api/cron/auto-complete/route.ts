import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function POST(req: Request) {
  const auth = req.headers.get("authorization")

  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        status: "approved",
        end_time: { lt: now },
      },
    })

    for (const booking of bookings) {
      await prisma.$transaction([
        prisma.booking.update({
          where: { id: booking.id },
          data: { status: "completed" },
        }),
        prisma.bookingLog.create({
          data: {
            booking_id: booking.id,
            action: "Auto Completed",
            previous_status: "approved",
            new_status: "completed",
            performed_by: booking.teacher_id,
          },
        }),
      ])
    }

    return NextResponse.json({
      success: true,
      completed: bookings.length,
    })
  } catch (error) {
    console.error("[AUTO-COMPLETE]", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

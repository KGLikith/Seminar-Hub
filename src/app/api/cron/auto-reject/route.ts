import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function POST(req: Request) {
  const auth = req.headers.get("authorization")

  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()

  try {
    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: "pending",
        start_time: { lt: now },
      },
    })

    for (const booking of expiredBookings) {
      await prisma.$transaction([
        prisma.booking.update({
          where: { id: booking.id },
          data: {
            status: "rejected",
            rejection_reason:
              "Automatically rejected because approval was not given before session start time",
          },
        }),
        prisma.bookingLog.create({
          data: {
            booking_id: booking.id,
            action: "Auto Rejected",
            previous_status: "pending",
            new_status: "rejected",
            performed_by: booking.teacher_id,
            notes: "Auto-rejected",
          },
        }),
      ])
    }

    return NextResponse.json({
      success: true,
      rejected: expiredBookings.length,
    })
  } catch (error) {
    console.error("[AUTO-REJECT]", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

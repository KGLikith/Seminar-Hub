import prisma from "@/lib/db"
import cron from "node-cron"

export const startAutoRejectCron = () => {
  cron.schedule("0 * * * *", async () => {
    const now = new Date()

    console.log("[CRON] Running auto-reject check at", now.toISOString())

    try {
      const expiredBookings = await prisma.booking.findMany({
        where: {
          status: "pending",
          start_time: {
            lt: now,
          },
        },
      })

      if (expiredBookings.length === 0) {
        console.log("[CRON] No expired bookings found")
        return
      }

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
              performed_by: booking.teacher_id, // system fallback
              notes: "Auto-rejected by system (local cron)",
            },
          }),
        ])
      }

      console.log(`[CRON] Auto-rejected ${expiredBookings.length} booking(s)`)
    } catch (err) {
      console.error("[CRON ERROR]", err)
    }
  })
}

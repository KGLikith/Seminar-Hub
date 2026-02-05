import prisma from "@/lib/db"
import cron from "node-cron"

/* ------------------------------------------------------------------ */
/*  GLOBAL SAFETY GUARDS (IMPORTANT IN DEV MODE / HOT RELOAD)          */
/* ------------------------------------------------------------------ */

declare global {
  // eslint-disable-next-line no-var
  var __autoRejectCronStarted: boolean | undefined
  // eslint-disable-next-line no-var
  var __autoCompleteCronStarted: boolean | undefined
}

/* ------------------------------------------------------------------ */
/*  AUTO REJECT CRON                                                   */
/*  pending → rejected (if start_time has passed)                      */
/* ------------------------------------------------------------------ */

export const startAutoRejectCron = () => {
  if (global.__autoRejectCronStarted) {
    console.log("[CRON] Auto-reject cron already running")
    return
  }

  global.__autoRejectCronStarted = true

  cron.schedule("*/5 * * * *", async () => {
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
              performed_by: booking.teacher_id, // system attribution
              notes: "Auto-rejected by system cron",
            },
          }),
        ])
      }

      console.log(
        `[CRON] Auto-rejected ${expiredBookings.length} booking(s)`
      )
    } catch (err) {
      console.error("[CRON ERROR - AUTO REJECT]", err)
    }
  })
}


export const startAutoCompleteCron = () => {
  if (global.__autoCompleteCronStarted) {
    console.log("[CRON] Auto-complete cron already running")
    return
  }

  global.__autoCompleteCronStarted = true

  cron.schedule("*/5 * * * *", async () => {
    const now = new Date()
    console.log("[CRON] Running auto-complete check at", now.toISOString())

    try {
      const completedBookings = await prisma.booking.findMany({
        where: {
          status: "approved",
          end_time: {
            lt: now,
          },
        },
      })

      if (completedBookings.length === 0) {
        console.log("[CRON] No bookings to auto-complete")
        return
      }

      for (const booking of completedBookings) {
        await prisma.$transaction([
          prisma.booking.update({
            where: { id: booking.id },
            data: {
              status: "completed",
            },
          }),
          prisma.bookingLog.create({
            data: {
              booking_id: booking.id,
              action: "Auto Completed",
              previous_status: "approved",
              new_status: "completed",
              performed_by: booking.teacher_id, // system attribution
              notes: "Auto-completed after session end time",
            },
          }),
        ])
      }

      console.log(
        `[CRON] Auto-completed ${completedBookings.length} booking(s)`
      )
    } catch (err) {
      console.error("[CRON ERROR - AUTO COMPLETE]", err)
    }
  })
}

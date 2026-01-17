"use server"

import { renderToBuffer } from "@react-pdf/renderer"
import prisma from "@/lib/db"
import BookingReportPDF from "@/reports/BookingSummary"

export async function generateBookingPDF(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      hall: true,
      teacher: true,
      hod: true,
      logs: { orderBy: { created_at: "asc" } },
      media: true,
    },
  })

  if (!booking) {
    throw new Error("Booking not found")
  }

  if (booking.status !== "completed") {
    throw new Error("Report allowed only for completed bookings")
  }

  const pdfBuffer = await renderToBuffer(
    BookingReportPDF({ booking })
  )

  return pdfBuffer
}

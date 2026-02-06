"use server"

import { renderToBuffer } from "@react-pdf/renderer"
import prisma from "@/lib/db"
import HallBookingReportPDF from "@/reports/HallBookingReports"

export async function generateHallBookingReportPDF(hallId: string) {
  const hall = await prisma.seminarHall.findUnique({
    where: { id: hallId },
    include: {
      department: true,
      bookings: {
        include: {
          teacher: { select: { name: true, email: true } },
        },
        orderBy: { booking_date: "desc" },
      },
    },
  })

  if (!hall) {
    throw new Error("Hall not found")
  }

  const pdfBuffer = await renderToBuffer(
    HallBookingReportPDF({ hall })
  )

  return pdfBuffer
}

"use server"

import { BookingStatus } from "@/generated/enums"
import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"

/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */

export type BookingFilters = {
  hallId?: string
  status?: BookingStatus[]
  teacherId?: string
  hodId?: string
  dateFrom?: Date
  dateTo?: Date
  limit?: number
}

/* ------------------------------------------------------------------ */
/* READ */
/* ------------------------------------------------------------------ */

export async function getBookings(filters?: BookingFilters) {
  const where: any = {}

  if (filters?.hallId) where.hall_id = filters.hallId
  if (filters?.teacherId) where.teacher_id = filters.teacherId
  if (filters?.hodId) where.hod_id = filters.hodId

  if (filters?.dateFrom || filters?.dateTo) {
    where.booking_date = {}
    if (filters.dateFrom) where.booking_date.gte = filters.dateFrom
    if (filters.dateTo) where.booking_date.lte = filters.dateTo
  }

  return prisma.booking.findMany({
    where: {
      ...where,
      status: filters?.status ? { in: filters.status } : undefined,
    },
    include: {
      hall: { include: { department: true } },
      teacher: true,
      hod: true,
      logs: { orderBy: { created_at: "asc" } },
      notifications: true,
    },
    take: filters?.limit,
    orderBy: [{ booking_date: "asc" }, { start_time: "asc" }],
  })
}

export async function getMyBookings(userId: string) {
  return prisma.booking.findMany({
    where: { teacher_id: userId },
    include: {
      hall: true,
      hod: true,
      logs: { orderBy: { created_at: "desc" } },
    },
    orderBy: { booking_date: "desc" },
  })
}

export async function getBookingById(id: string) {
  return prisma.booking.findUnique({
    where: { id },
    include: {
      hall: { include: { hallTechStaffs: true } },
      teacher: true,
      hod: true,
      logs: { orderBy: { created_at: "asc" } },
      media: { include: { uploader: true } },
    },
  })
}

/* ------------------------------------------------------------------ */
/* CREATE */
/* ------------------------------------------------------------------ */

export async function createBooking(data: {
  hallId: string
  teacherId: string
  bookingDate: Date
  startTime: Date
  endTime: Date
  purpose: string
  permissionLetterUrl: string
  expectedParticipants?: number
  specialRequirements?: string
}) {
  try {
    const booking = await prisma.booking.create({
      data: {
        hall_id: data.hallId,
        teacher_id: data.teacherId,
        booking_date: data.bookingDate,
        start_time: data.startTime,
        end_time: data.endTime,
        purpose: data.purpose,
        permission_letter_url: data.permissionLetterUrl,
        expected_participants: data.expectedParticipants,
        special_requirements: data.specialRequirements,
        status: BookingStatus.pending,
      },
    })

    await prisma.bookingLog.create({
      data: {
        booking_id: booking.id,
        action: "Booking Requested",
        new_status: BookingStatus.pending,
        performed_by: data.teacherId,
      },
    })

    const hod = await prisma.profile.findFirst({
      where: {
        department: { halls: { some: { id: data.hallId } } },
        roles: { some: { role: "hod" } },
      },
      select: { id: true },
    })

    if (hod) {
      await prisma.notification.create({
        data: {
          user_id: hod.id,
          title: "New Booking Request",
          message: "A new booking request is awaiting approval.",
          type: "booking_pending",
          related_booking_id: booking.id,
        },
      })
    }

    return { error: null }
  } catch {
    return { error: "Failed to create booking. Please try again." }
  }
}

export async function getPendingBookingsForHOD(hodDepartmentId: string) {
  return prisma.booking.findMany({
    where: {
      status: BookingStatus.pending,
      hall: { department_id: hodDepartmentId },
    },
    include: {
      hall: true,
      teacher: true,
      logs: true,
    },
    orderBy: { created_at: "asc" },
  })
}

export async function approveBooking(bookingId: string, hodId: string) {
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.approved,
      hod_id: hodId,
      approved_at: new Date(),
    },
  })

  await prisma.bookingLog.create({
    data: {
      booking_id: bookingId,
      action: "Booking Approved",
      previous_status: BookingStatus.pending,
      new_status: BookingStatus.approved,
      performed_by: hodId,
    },
  })

  await prisma.notification.create({
    data: {
      user_id: booking.teacher_id,
      title: "Booking Approved",
      message: `Your booking for ${booking.purpose} has been approved.`,
      type: "booking_approved",
      related_booking_id: bookingId,
    },
  })

  return booking
}

export async function rejectBooking(
  bookingId: string,
  hodId: string,
  reason: string,
) {
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.rejected,
      hod_id: hodId,
      rejection_reason: reason,
    },
  })

  await prisma.bookingLog.create({
    data: {
      booking_id: bookingId,
      action: "Booking Rejected",
      previous_status: BookingStatus.pending,
      new_status: BookingStatus.rejected,
      performed_by: hodId,
      notes: reason,
    },
  })

  await prisma.notification.create({
    data: {
      user_id: booking.teacher_id,
      title: "Booking Rejected",
      message: reason,
      type: "booking_rejected",
      related_booking_id: bookingId,
    },
  })

  return booking
}

export async function addBookingSummary(
  bookingId: string,
  summary: string,
  aiSummary?: any,
) {
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      session_summary: summary,
      ai_summary: aiSummary ?? null,
      status: BookingStatus.completed,
    },
  })

  return booking
}

export async function addBookingMedia(
  bookingId: string,
  url: string,
  uploaderId: string,
) {
  await prisma.bookingMedia.create({
    data: {
      booking_id: bookingId,
      url,
      uploaded_by: uploaderId,
    },
  })

  revalidatePath(`/dashboard/bookings/${bookingId}`)
}

export async function deleteBookingMedia(mediaId: string) {
  const media = await prisma.bookingMedia.delete({
    where: { id: mediaId },
  })

  return media
}


export async function cancelBooking(bookingId: string, userId: string) {
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.cancelled },
  })

  await prisma.bookingLog.create({
    data: {
      booking_id: bookingId,
      action: "Booking Cancelled",
      previous_status: booking.status,
      new_status: BookingStatus.cancelled,
      performed_by: userId,
    },
  })

  return { error: null }
}

export async function getBookingsForHallOnDate(hallId: string) {
  return prisma.booking.findMany({
    where: { hall_id: hallId },
    orderBy: { start_time: "asc" },
  })
}

export async function getBookingLogs(bookingId: string) {
  return prisma.bookingLog.findMany({
    where: { booking_id: bookingId },
    orderBy: { created_at: "asc" },
    include: {
      performer: true
    }
  })
}

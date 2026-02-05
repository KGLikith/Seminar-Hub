"use server"

import { BookingStatus } from "@/generated/enums"
import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { sendEmail, sendNotification } from "../notification"
import { sendNotificationEmail } from "../notification/send-email"

export type BookingFilters = {
  hallId?: string
  status?: BookingStatus[]
  teacherId?: string
  hodId?: string
  dateFrom?: Date
  dateTo?: Date
  limit?: number
}

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

  console.log(filters?.hallId, "hello")

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
      hall: { include: { hallTechStaffs: true, department: true } },
      teacher: true,
      hod: true,
      logs: { orderBy: { created_at: "asc" } },
      media: { include: { uploader: true } },
    },
  })
}

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
      include: {
        hall: true,
        teacher: true
      }
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
      select: { id: true, email: true, name: true },
    })

    if (hod) {
      await sendNotification({
        userId: hod.id,
        title: "New Booking Request",
        message: "A new booking request is awaiting approval.",
        type: "booking_pending",
        related_booking_id: booking.id,
      })

      sendNotificationEmail({
        type: "booking_pending",
        to: hod.email,
        hodName: hod.name,
        teacherName: booking.teacher.name ?? "Teacher",
        hallName: booking.hall.name,
        bookingDate: booking.booking_date.toISOString(),
        startTime: booking.start_time.toISOString(),
        endTime: booking.end_time.toISOString(),
        bookingId: booking.id,
        teacherEmail: booking.teacher.email
      }).catch(console.error)
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
  return prisma.$transaction(async (tx) => {

    /* ---------------- FETCH BOOKING ---------------- */
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: {
        teacher: true,
        hall: true,
        hod: true,
      },
    })

    if (!booking) throw new Error("Booking not found")

    if (booking.status !== BookingStatus.pending) {
      throw new Error("Only pending bookings can be approved")
    }

    /* ---------------- APPROVE THIS BOOKING ---------------- */
    const approvedBooking = await tx.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.approved,
        hod_id: hodId,
        approved_at: new Date(),
      },
    })

    await tx.bookingLog.create({
      data: {
        booking_id: booking.id,
        action: "Booking Approved",
        previous_status: BookingStatus.pending,
        new_status: BookingStatus.approved,
        performed_by: hodId,
      },
    })

    /* ---------------- FIND CONFLICTING BOOKINGS ---------------- */
    const conflictingBookings = await tx.booking.findMany({
      where: {
        hall_id: booking.hall_id,
        status: BookingStatus.pending,

        // OVERLAP CONDITION
        start_time: { lt: booking.end_time },
        end_time: { gt: booking.start_time },

        NOT: { id: booking.id },
      },
      include: {
        teacher: true,
      },
    })

    for (const conflict of conflictingBookings) {
      await tx.booking.update({
        where: { id: conflict.id },
        data: {
          status: BookingStatus.rejected,
          rejection_reason:
            "Automatically rejected due to another approved booking for the same time slot",
        },
      })

      await tx.bookingLog.create({
        data: {
          booking_id: conflict.id,
          action: "Booking Auto-Rejected (Conflict)",
          previous_status: BookingStatus.pending,
          new_status: BookingStatus.rejected,
          performed_by: hodId,
          notes: `Conflicted with approved booking ${booking.id}`,
        },
      })

      sendNotification({
        userId: conflict.teacher_id,
        title: "Booking Rejected",
        message:
          "Your booking was rejected because another booking was approved for the same time slot.",
        type: "booking_rejected",
        related_booking_id: conflict.id,
      })

      sendNotificationEmail({
        type: "booking_rejected",
        to: conflict.teacher.email,
        teacherName: conflict.teacher.name,
        hallName: booking.hall.name,
        bookingDate: booking.booking_date.toISOString(),
        startTime: booking.start_time.toISOString(),
        endTime: booking.end_time.toISOString(),
        reason:
          "Another booking was approved for the same time slot",
        rejectedBy: "System (Auto)",
        bookingId: conflict.id,
      }).catch(console.error)
    }

    sendNotification({
      userId: booking.teacher_id,
      title: "Booking Approved",
      message: `Your booking for ${booking.purpose} has been approved.`,
      type: "booking_approved",
      related_booking_id: booking.id,
    })

    sendNotificationEmail({
      type: "booking_approved",
      to: booking.teacher.email,
      teacherName: booking.teacher.name,
      hallName: booking.hall.name,
      purpose: booking.purpose,
      bookingDate: booking.booking_date.toISOString(),
      startTime: booking.start_time.toISOString(),
      endTime: booking.end_time.toISOString(),
      approvedBy: "HOD",
      bookingId: booking.id,
      hodEmail: booking.hod?.email,
    }).catch(console.error)

    return approvedBooking
  })
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
    include: {
      teacher: true,
      hall: true,
      hod: true
    }
  })

  prisma.bookingLog.create({
    data: {
      booking_id: bookingId,
      action: "Booking Rejected",
      previous_status: BookingStatus.pending,
      new_status: BookingStatus.rejected,
      performed_by: hodId,
      notes: reason,
    },
  })

  sendNotificationEmail({
    type: "booking_rejected",
    to: booking.teacher.email,
    teacherName: booking.teacher.name,
    hallName: booking.hall.name,
    bookingDate: booking.booking_date.toISOString(),
    startTime: booking.start_time.toISOString(),
    endTime: booking.end_time.toISOString(),
    rejectedBy: "HOD",
    reason,
    bookingId,
    hodEmail: booking.hod?.email
  }).catch(console.error)


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

export async function getBookingLogsByHall(hallId: string) {
  return prisma.bookingLog.findMany({
    where: {
      booking: {
        hall_id: hallId,
      },
    },
    include: {
      booking: {
        include: {
          teacher: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  })
}



"use server";
import { BookingStatus } from "@/generated/enums";
import prisma from "@/lib/db";

export type BookingFilters = {
  hallId?: string;
  status?: BookingStatus[];
  teacherId?: string;
  hodId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
};

export async function getBookings(filters?: BookingFilters) {
  const where: any = {};
  if (filters?.hallId) where.hall_id = filters.hallId;
  if (filters?.teacherId) where.teacher_id = filters.teacherId;
  if (filters?.hodId) where.hod_id = filters.hodId;
  if (filters?.dateFrom || filters?.dateTo) {
    where.booking_date = {};
    if (filters.dateFrom) where.booking_date.gte = filters.dateFrom;
    if (filters.dateTo) where.booking_date.lte = filters.dateTo;
  }

  return await prisma.booking.findMany({
    where: {
      ...where,
      status: filters?.status ? { in: filters.status } : undefined,
    },
    include: {
      hall: { include: { department: true } },
      teacher: true,
      hod: true,
      logs: true,
      notifications: true,
    },
    take: filters?.limit,
    orderBy: [{ booking_date: "asc" }, { start_time: "asc" }],
  });
}

export async function getMyBookings(userId: string) {
  return await prisma.booking.findMany({
    where: { teacher_id: userId },
    include: {
      hall: { include: { department: true } },
      hod: true,
      logs: { orderBy: { created_at: "desc" } },
      notifications: true,
    },
    orderBy: { booking_date: "desc" },
  });
}

export async function createBooking(data: {
  hallId: string;
  teacherId: string;
  bookingDate: Date;
  startTime: Date;
  endTime: Date;
  purpose: string;
  permissionLetterUrl: string;
  expectedParticipants?: number;
  specialRequirements?: string;
}) {
  try {
    await prisma.booking.create({
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
        status: "pending",
      },
      include: { hall: true },
    });
    return { error: null };
  } catch (error) {
    return { error: "Failed to create booking. Please try again." };
  }
}

export async function getPendingBookingsForHOD(hodDepartmentId: string) {
  return await prisma.booking.findMany({
    where: {
      status: "pending",
      hall: { department_id: hodDepartmentId },
    },
    include: {
      hall: { include: { department: true } },
      teacher: true,
      logs: true,
    },
    orderBy: { created_at: "asc" },
  });
}

export async function approveBooking(bookingId: string, hodId: string) {
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "approved",
      hod_id: hodId,
      approved_at: new Date(),
    },
  });

  await prisma.bookingLog.create({
    data: {
      booking_id: bookingId,
      action: "Booking Approved",
      previous_status: "pending",
      new_status: "approved",
      performed_by: hodId,
      notes: "Booking approved by HOD",
    },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      user_id: booking.teacher_id,
      title: "Booking Approved",
      message: `Your booking for ${booking.purpose} has been approved`,
      type: "booking_approved",
      related_booking_id: bookingId,
    },
  });

  return booking;
}

export async function rejectBooking(
  bookingId: string,
  hodId: string,
  reason: string
) {
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "rejected",
      hod_id: hodId,
      rejection_reason: reason,
    },
  });

  // Log the action
  await prisma.bookingLog.create({
    data: {
      booking_id: bookingId,
      action: "Booking Rejected",
      previous_status: "pending",
      new_status: "rejected",
      performed_by: hodId,
      notes: reason,
    },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      user_id: booking.teacher_id,
      title: "Booking Rejected",
      message: `Your booking for ${booking.purpose} has been rejected. Reason: ${reason}`,
      type: "booking_rejected",
      related_booking_id: bookingId,
    },
  });

  return booking;
}

export async function addBookingSummary(
  bookingId: string,
  summary: string,
  aiSummary?: any
) {
  return await prisma.booking.update({
    where: { id: bookingId },
    data: {
      session_summary: summary,
      ai_summary: aiSummary || null,
      status: "completed",
    },
  });
}

export const getBookingLogs = async (bookingId: string) => {
  return await prisma.bookingLog.findMany({
    where: { booking_id: bookingId },
    include: {
      performer: true,
      booking: true,
    },
    orderBy: { created_at: "desc" },
  });
};

export const cancelBooking = async (bookingId: string, userId: string) => {
  try {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "cancelled" },
    });

    await prisma.bookingLog.create({
      data: {
        booking_id: bookingId,
        action: "Booking Cancelled",
        previous_status: booking.status,
        new_status: "cancelled",
        performed_by: userId,
        notes: "Booking cancelled",
      },
    });
    return { error: null };
  } catch (error) {
    return { error: "Failed to cancel booking. Please try again." };
  }
};

export async function getBookingsForHallOnDate(
  hallId: string,
) {
  return await prisma.booking.findMany({
    where: {
      hall_id: hallId,
    },
    orderBy: { start_time: "asc" },
  });
}
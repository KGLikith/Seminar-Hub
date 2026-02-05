import {
  bookingApprovedEmail,
  bookingPendingEmail,
  bookingRejectedEmail,
  maintenanceApprovedEmail,
  maintenanceRejectedEmail,
} from "@/components/email/template"
import { sendEmail } from "."
import { NotificationEmailPayload } from "@/components/email/notification-emails"
import { logEmailEvent } from "../loggings/email-log"

export async function sendNotificationEmail(
  payload: NotificationEmailPayload
) {
  let subject = ""
  let html = ""
  let reference: { bookingId?: string; maintenanceId?: string } = {}

  try {
    switch (payload.type) {
      case "booking_pending":
        subject = "New Seminar Hall Booking Request"
        html = bookingPendingEmail(
          payload.hodName,
          payload.teacherName,
          payload.hallName,
          payload.bookingDate,
          payload.startTime,
          payload.endTime,
          payload.bookingId,
          payload.teacherEmail,
        )
        reference.bookingId = payload.bookingId
        break

      case "booking_approved":
        subject = "Your booking has been approved"
        html = bookingApprovedEmail(
          payload.teacherName,
          payload.hallName,
          payload.purpose,
          payload.bookingDate,
          payload.startTime,
          payload.endTime,
          payload.approvedBy,
          payload.bookingId,
          payload.hodEmail
        )
        reference.bookingId = payload.bookingId
        break

      case "booking_rejected":
        subject = "Your booking was rejected"
        html = bookingRejectedEmail(
          payload.teacherName,
          payload.hallName,
          payload.bookingDate,
          payload.startTime,
          payload.endTime,
          payload.reason,
          payload.rejectedBy,
          payload.bookingId,
          payload.hodEmail
        )
        reference.bookingId = payload.bookingId
        break

      case "maintenance_request_approved":
        subject = "Maintenance request approved"
        html = maintenanceApprovedEmail(
          payload.techName,
          payload.hallName,
          payload.target,
          payload.priority,
          payload.approvedBy,
          payload.hodEmail
        )
        break

      case "maintenance_request_rejected":
        subject = "Maintenance request rejected"
        html = maintenanceRejectedEmail(
          payload.techName,
          payload.hallName,
          payload.reason,
        )
        break

      default: {
        const _never: never = payload
        return _never
      }
    }

    await sendEmail({
      to: payload.to,
      subject,
      html,
    })

    await logEmailEvent({
      event: payload.type,
      to: payload.to,
      subject,
      status: "sent",

      body: {
        html,          
        text: null,
      },

      payload,      
      reference,
      provider: {
        name: "resend",
      },
    })
  } catch (error: any) {
    await logEmailEvent({
      event: payload.type,
      to: payload.to,
      subject,
      status: "failed",

      body: {
        html,          
        text: null,
      },

      payload,
      reference,
      error: {
        message: error?.message ?? "Unknown error",
        stack: error?.stack,
      },
    })

    throw error
  }
}

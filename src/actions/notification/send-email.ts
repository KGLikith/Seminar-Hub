import { bookingApprovedEmail, bookingPendingEmail, bookingRejectedEmail, maintenanceApprovedEmail, maintenanceRejectedEmail } from "@/components/email/template";
import { sendEmail } from ".";
import { NotificationEmailPayload } from "@/components/email/notification-emails";

export async function sendNotificationEmail(
    payload: NotificationEmailPayload
) {
    switch (payload.type) {
        case "booking_approved":
            return sendEmail({
                to: payload.to,
                subject: "Your booking has been approved",
                html: bookingApprovedEmail(
                    payload.teacherName,
                    payload.purpose,
                    payload.bookingId
                ),
            });

        case "booking_rejected":
            return sendEmail({
                to: payload.to,
                subject: "Your booking was rejected",
                html: bookingRejectedEmail(
                    payload.teacherName,
                    payload.reason,
                    payload.bookingId
                ),
            });

        case "maintenance_request_approved":
            return sendEmail({
                to: payload.to,
                subject: "Maintenance request approved",
                html: maintenanceApprovedEmail(
                    payload.techName,
                    payload.hallName
                ),
            });

        case "maintenance_request_rejected":
            return sendEmail({
                to: payload.to,
                subject: "Maintenance request rejected",
                html: maintenanceRejectedEmail(
                    payload.techName,
                    payload.hallName,
                    payload.reason
                ),
            });


        case "booking_pending":
            return sendEmail({
                to: payload.to,
                subject: "New Seminar Hall Booking Request",
                html: bookingPendingEmail(
                    payload.hodName,
                    payload.hallName,
                    payload.bookingDate,
                    payload.bookingId
                ),
            });
    }
}

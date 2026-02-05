export type NotificationEmailPayload =
    | {
        type: "booking_pending";
        to: string;
        hodName: string;
        hallName: string;
        bookingDate: string;
        bookingId: string;
    }
    | {
        type: "booking_approved";
        to: string;
        teacherName: string;
        purpose: string;
        bookingId: string;
    }
    | {
        type: "booking_rejected";
        to: string;
        teacherName: string;
        reason: string;
        bookingId: string;
    }
    | {
        type: "maintenance_request_approved";
        to: string;
        techName: string;
        hallName: string;
    }
    | {
        type: "maintenance_request_rejected";
        to: string;
        techName: string;
        hallName: string;
        reason: string;
    };

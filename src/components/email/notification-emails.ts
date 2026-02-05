export type NotificationEmailPayload =
  | {
      type: "booking_pending";
      to: string;
      hodName: string;
      teacherName: string;
      teacherEmail: string;
      hallName: string;
      bookingDate: string;
      startTime: string;
      endTime: string;
      bookingId: string;
    }
  | {
      type: "booking_approved";
      to: string;
      teacherName: string;
      hodEmail?: string;
      hallName: string;
      purpose: string;
      bookingDate: string;
      startTime: string;
      endTime: string;
      approvedBy: string;
      bookingId: string;
    }
  | {
      type: "booking_rejected";
      to: string;
      teacherName: string;
      hallName: string;
      hodEmail?: string;
      bookingDate: string;
      startTime: string;
      endTime: string;
      rejectedBy: string;
      reason: string;
      bookingId: string;
    }
  | {
      type: "maintenance_request_approved";
      to: string;
      techName: string;
      hodEmail?: string;
      hallName: string;
      target: string;
      priority: string;
      approvedBy: string;
    }
  | {
      type: "maintenance_request_rejected";
      to: string;
      hodEmail?: string
      techName: string;
      hallName: string;
      reason: string;
    };

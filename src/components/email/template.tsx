const baseLayout = (title: string, body: string) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6">
    <h2>${title}</h2>
    ${body}
    <p style="margin-top: 24px; font-size: 12px; color: #666">
      Seminar Booking System
    </p>
  </div>
`

const DASHBOARD = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`

export function bookingApprovedEmail(
  teacherName: string,
  purpose: string,
  bookingId: string
) {
  return baseLayout(
    "Booking Approved ✅",
    `
      <p>Hello ${teacherName},</p>
      <p>Your booking for <strong>${purpose}</strong> has been approved.</p>
      <a href="${DASHBOARD}/bookings/${bookingId}">View Booking</a>
    `
  )
}

export function bookingRejectedEmail(
  teacherName: string,
  reason: string,
  bookingId: string
) {
  return baseLayout(
    "Booking Rejected ❌",
    `
      <p>Hello ${teacherName},</p>
      <p>Your booking was rejected.</p>
      <blockquote>${reason}</blockquote>
      <a href="${DASHBOARD}/bookings/${bookingId}">View Booking</a>
    `
  )
}

export function bookingPendingEmail(
  hodName: string,
  hallName: string,
  bookingDate: string,
  bookingId: string
) {
  return baseLayout(
    "New Booking Request ⏳",
    `
      <p>Hello ${hodName},</p>
      <p>
        A new booking request for <strong>${hallName}</strong>
        on <strong>${bookingDate}</strong> requires your approval.
      </p>
      <a
        href="${DASHBOARD}/bookings/${bookingId}"
        style="display:inline-block;padding:10px 16px;background:#16a34a;color:#fff;border-radius:6px;text-decoration:none"
      >
        Review Booking
      </a>
    `
  )
}

export function maintenanceApprovedEmail(
  techName: string,
  hallName: string
) {
  return baseLayout(
    "Maintenance Approved 🔧",
    `
      <p>Hello ${techName},</p>
      <p>Your maintenance request for <strong>${hallName}</strong> was approved.</p>
      <a href="${DASHBOARD}">Go to Dashboard</a>
    `
  )
}

export function maintenanceRejectedEmail(
  techName: string,
  hallName: string,
  reason: string
) {
  return baseLayout(
    "Maintenance Rejected ❌",
    `
      <p>Hello ${techName},</p>
      <p>Your maintenance request for <strong>${hallName}</strong> was rejected.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <a href="${DASHBOARD}">Go to Dashboard</a>
    `
  )
}

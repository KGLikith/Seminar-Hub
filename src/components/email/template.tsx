import { formatDate, formatTime } from "./utils"

const baseLayout = (title: string, body: string, status: "success" | "warning" | "info" = "info") => {
  const statusColors = {
    success: "#16a34a",
    warning: "#ea580c",
    info: "#0284c7",
  }
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
          .header { background: linear-gradient(135deg, #1f2937 0%, #374151 100%); padding: 32px 24px; text-align: center; }
          .header h1 { margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; }
          .content { padding: 32px 24px; }
          .status-badge { display: inline-block; background: ${statusColors[status]}; color: #ffffff; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 12px; margin: 16px 0; }
          .section { margin: 24px 0; }
          .section p { margin: 12px 0; color: #374151; line-height: 1.6; font-size: 14px; }
          .section strong { color: #1f2937; font-weight: 600; }
          .cta-button { display: inline-block; background: ${statusColors[status]}; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 16px 0; border: none; cursor: pointer; }
          .cta-button:hover { opacity: 0.9; }
          .secondary-button { display: inline-block; background: #e5e7eb; color: #374151; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 13px; margin: 8px 8px 8px 0; border: 1px solid #d1d5db; }
          .secondary-button:hover { background: #d1d5db; }
          .divider { border-top: 1px solid #e5e7eb; margin: 24px 0; }
          .footer { background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
          .footer p { margin: 6px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
          </div>
          <div class="content">
            ${body}
          </div>
          <div class="footer">
            <p>Seminar Hall Management System</p>
            <p style="color: #9ca3af; font-size: 11px;">© ${new Date().getFullYear()} All rights reserved</p>
          </div>
        </div>
      </body>
    </html>
  `
}

const DASHBOARD = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`

export function bookingApprovedEmail(
  teacherName: string,
  hallName: string,
  purpose: string,
  bookingDate: Date | string,
  startTime: Date | string,
  endTime: Date | string,
  approvedBy: string,
  bookingId: string,
  hodEmail?: string
) {
  return baseLayout(
    "Booking Approved",
    `
      <div class="section">
        <p>Hello <strong>${teacherName}</strong>,</p>
        <p>Your seminar hall booking has been approved.</p>
        <div class="status-badge">✓ Approved</div>
      </div>

      <div class="section">
        <p><strong>Booking Details</strong></p>
        <p style="margin-left: 12px; color: #6b7280;">
          Hall: <strong>${hallName}</strong><br/>
          Purpose: ${purpose}<br/>
          Date: ${formatDate(bookingDate)}<br/>
          Time: ${formatTime(startTime)} – ${formatTime(endTime)}<br/>
          Approved By: ${approvedBy}(${hodEmail})<br/>
          Booking ID: ${bookingId}
        </p>
      </div>

      <div class="section">
        <a href="${DASHBOARD}/teacher/bookings/${bookingId}" class="cta-button">
          View Booking
        </a>
      </div>
    `,
    "success"
  )
}

export function bookingRejectedEmail(
  teacherName: string,
  hallName: string,
  bookingDate: Date | string,
  startTime: Date | string,
  endTime: Date | string,
  reason: string,
  rejectedBy: string,
  bookingId: string,
  hodEmail?: string
) {
  return baseLayout(
    "Booking Rejected",
    `
      <div class="section">
        <p>Hello <strong>${teacherName}</strong>,</p>
        <p>Your booking request could not be approved.</p>
        <div class="status-badge" style="background:#dc2626;">✗ Rejected</div>
      </div>

      <div class="section">
        <p><strong>Booking Details</strong></p>
        <p style="margin-left: 12px; color: #6b7280;">
          Hall: <strong>${hallName}</strong><br/>
          Date: ${formatDate(bookingDate)}<br/>
          Time: ${formatTime(startTime)} – ${formatTime(endTime)}<br/>
          Rejected By: ${rejectedBy}(${hodEmail})<br/>
          Booking ID: ${bookingId}
        </p>
      </div>

      <div class="section">
        <p><strong>Reason</strong></p>
        <p style="background:#fef2f2; padding:12px; border-left:4px solid #dc2626;">
          ${reason}
        </p>
      </div>

      <div class="section">
        <a href="${DASHBOARD}/teacher/bookings/${bookingId}" class="secondary-button">
          Review Booking
        </a>
      </div>
    `,
    "warning"
  )
}


export function bookingPendingEmail(
  hodName: string,
  teacherName: string,
  hallName: string,
  bookingDate: Date | string,
  startTime: Date | string,
  endTime: Date | string,
  bookingId: string,
  teacherEmail: string
) {
  return baseLayout(
    "Booking Approval Required",
    `
      <div class="section">
        <p>Hello <strong>${hodName}</strong>,</p>
        <p>A booking request requires your review.</p>
      </div>

      <div class="section">
        <p><strong>Request Summary</strong></p>
        <p style="margin-left: 12px; color: #6b7280;">
          Requested By: ${teacherName}(${teacherEmail})<br/>
          Hall: <strong>${hallName}</strong><br/>
          Date: ${formatDate(bookingDate)}<br/>
          Time: ${formatTime(startTime)} – ${formatTime(endTime)}<br/>
          Booking ID: ${bookingId}
        </p>
      </div>

      <div class="section">
        <a href="${DASHBOARD}/bookings/${bookingId}" class="cta-button">
          Review Request
        </a>
      </div>
    `,
    "info"
  )
}


export function maintenanceApprovedEmail(
  techName: string,
  hallName: string,
  target: string,
  priority: string,
  approvedBy: string,
  hodEmail?: string
) {
  return baseLayout(
    "Maintenance Request Approved",
    `
      <div class="section">
        <p>Hello <strong>${techName}</strong>,</p>
        <p>Your maintenance request has been approved.</p>
        <div class="status-badge">✓ Approved</div>
      </div>

      <div class="section">
        <p><strong>Details</strong></p>
        <p style="margin-left: 12px; color: #6b7280;">
          Hall: ${hallName}<br/>
          Target: ${target}<br/>
          Priority: ${priority}<br/>
          Approved By: ${approvedBy} (${hodEmail})
        </p>
      </div>

      <div class="section">
        <a href="${DASHBOARD}" class="cta-button">Go to Dashboard</a>
      </div>
    `,
    "success"
  )
}


export function maintenanceRejectedEmail(
  techName: string,
  hallName: string,
  reason: string,
) {
  return baseLayout(
    "Maintenance Request Status",
    `
      <div class="section">
        <p>Hello <strong>${techName}</strong>,</p>
        <p>Your maintenance request for <strong>${hallName}</strong> could not be approved.</p>
        <div class="status-badge" style="background: #dc2626;">✗ Not Approved</div>
      </div>
      <div class="section">
        <p><strong>Reason:</strong></p>
        <p style="background: #fef2f2; padding: 12px; border-left: 4px solid #dc2626; color: #991b1b; border-radius: 4px;">${reason}</p>
      </div>
      <div class="section">
        <a href="${DASHBOARD}" class="secondary-button">View Dashboard</a>
      </div>
    `,
    "warning"
  )
}

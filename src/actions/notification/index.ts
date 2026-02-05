'use server'
import { resend } from "@/client/resend";
import prisma from "@/lib/db";

export async function getNotifications(userId: string, unreadOnly = true) {
  const notication = await prisma.notification.findMany({
    where: {
      user_id: userId,
      ...(unreadOnly && { read: false }),
    },
    include: { relatedBooking: true },
    orderBy: { created_at: "desc" },
  });

  return notication
}

export async function markNotificationAsRead(notificationId: string) {
  return await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  return await prisma.notification.updateMany({
    where: {
      user_id: userId
    },
    data: {
      read: true
    }
  })
}

export async function sendNotification(input: {
  userId: string
  title: string
  message: string
  type: string
  related_booking_id?: string
}) {
  return await prisma.notification.create({
    data: {
      user_id: input.userId,
      title: input.title,
      message: input.message,
      type: input.type,
      related_booking_id: input.related_booking_id
    },
  })
}

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing");
  }

  return resend.emails.send({
    from: "Seminar Hub <no-reply@seminar.likith.me>", 
    to,
    subject,
    html,
  });
}



'use server'
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

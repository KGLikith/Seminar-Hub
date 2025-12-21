'use server'
import prisma from "@/lib/db";

export async function getNotifications(userId: string, unreadOnly = false) {
  const notication =  await prisma.notification.findMany({
    where: {
      user_id: userId,
      ...(unreadOnly && { read: false }),
    },
    include: { relatedBooking: true },
    orderBy: { created_at: "desc" },
  });

  console.log(notication);

  return notication
}

export async function markNotificationAsRead(notificationId: string) {
  return await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}

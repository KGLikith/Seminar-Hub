'use client';

import { useAuth } from "@clerk/nextjs";
import { useNotifications } from "@/hooks/react-query/useNotifications";
import { useProfile } from "@/hooks/react-query/useUser";

export default function NotificationBell() {
  const { userId: clerkId } = useAuth();
  const { data: profile, isLoading, refetch } = useProfile(clerkId ?? undefined);

  const { data: notifications = [], isLoading: notificationLoading } = useNotifications(profile?.user_id as string, true);

  const unreadCount = notifications.length;

  console.log("notifiaations", notifications, unreadCount)

  if(notificationLoading) return null;

  return (
    <div className="relative">
      <button className="relative p-2 hover:bg-neutral-100 rounded-lg transition-colors">
        <svg
          className="w-6 h-6 text-neutral-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount && unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}

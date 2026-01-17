"use client"

import { Bell, CheckCircle2, AlertCircle, Clock } from "lucide-react"
import { useAuth } from "@clerk/nextjs"
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from "@/hooks/react-query/useNotifications"
import { useProfile } from "@/hooks/react-query/useUser"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  created_at: string
  relatedBooking?: { id: string; status: string }
}

export default function NotificationsPage() {
  const { userId: clerkId } = useAuth()
  const { data: profile, isLoading: profileLoading, refetch } = useProfile(clerkId ?? undefined)

  const { data: notifications = [], isLoading } = useNotifications(profile?.id as string)

  const markAsReadMutation = useMarkNotificationAsRead()

  const markAllMutation = useMarkAllNotificationsAsRead()


  const unreadCount = notifications.filter((n: any) => !n.read).length

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking_approved":
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />
      case "booking_rejected":
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case "booking_request":
        return <Clock className="w-5 h-5 text-amber-600" />
      default:
        return <Bell className="w-5 h-5 text-blue-600" />
    }
  }

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "booking_approved":
        return "border-l-4 border-emerald-500 bg-emerald-50"
      case "booking_rejected":
        return "border-l-4 border-red-500 bg-red-50"
      case "booking_request":
        return "border-l-4 border-amber-500 bg-amber-50"
      default:
        return "border-l-4 border-blue-500 bg-blue-50"
    }
  }

  const handleMarkAllAsRead = () => {
    if (!profile?.id) return
    markAllMutation.mutate(profile.id)
  }

  if (isLoading || profileLoading) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer-loading h-24 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>

          <h1 className="heading-2 mb-3">Notifications</h1>
          <p className="text-lg text-slate-600">
            You have <span className="font-bold text-blue-600">{unreadCount}</span> unread notification
            {unreadCount !== 1 ? "s" : ""}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markAllMutation.isPending}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification: any, idx: number) => (
            <div
              key={notification.id}
              className={`card-modern p-6 cursor-pointer transition-all duration-300 ${getTypeStyles(
                notification.type,
              )} ${notification.read ? "opacity-75" : "opacity-100"}`}
              style={{ animationDelay: `${idx * 50}ms` }}
              onClick={() => !notification.read && handleMarkAsRead(notification.id)}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">{getNotificationIcon(notification.type)}</div>

                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 mb-1">{notification.title}</h3>
                  <p className="text-slate-700 text-sm mb-2">{notification.message}</p>
                  <p className="text-slate-500 text-xs">{new Date(notification.created_at).toLocaleString()}</p>
                </div>

                {!notification.read && <div className="w-3 h-3 bg-blue-600 rounded-full mt-2" />}
              </div>
            </div>
          ))
        ) : (
          <div className="card-modern p-12 text-center">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getNotifications, markNotificationAsRead } from "@/actions/notification"

export const useNotifications = (userId: string | undefined, unreadOnly = false) => {
  return useQuery({
    queryKey: ["notifications", userId, unreadOnly],
    queryFn: () => (userId ? getNotifications(userId, unreadOnly) : null),
    enabled: !!userId,
  })
}

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (notificationId: string) => markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}

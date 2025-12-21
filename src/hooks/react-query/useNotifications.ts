import { useQuery, useMutation, useQueryClient, notifyManager } from "@tanstack/react-query"
import { getNotifications, markNotificationAsRead } from "@/actions/notification"

export const useNotifications = (userId: string | undefined, unreadOnly = false) => {
  console.log("hello what s up", userId, unreadOnly)
  return useQuery({
    queryKey: ["notifications", userId, unreadOnly],
    queryFn: () => {
      if(!userId) return [];

      const notication : any = useNotifications(userId, unreadOnly);

      return notication;
    },
    enabled: !!userId,
    refetchInterval: 30_000
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

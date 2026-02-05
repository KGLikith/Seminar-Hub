import { useQuery, useMutation, useQueryClient, notifyManager } from "@tanstack/react-query"
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "@/actions/notification"

export const useNotifications = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => {
      if(!profileId) return [];

      const notication : any = getNotifications(profileId);

      return notication;
    },
    enabled: !!profileId,
    refetchInterval: 30_000
  })
}

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (notificationId: string) => await markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}


export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => await markAllNotificationsAsRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}
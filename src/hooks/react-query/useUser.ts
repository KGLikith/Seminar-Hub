import { useQuery } from "@tanstack/react-query"
import { getProfile, getUserRole } from "@/actions/user"

export const useProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => (userId ? getProfile(userId) : null),
    enabled: !!userId,
  })
}

export const useUserRole = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["userRole", userId],
    queryFn: () => (userId ? getUserRole(userId) : null),
    enabled: !!userId,
  })
}

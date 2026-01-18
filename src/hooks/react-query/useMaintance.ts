import {  getMaintenanceRequests, getMaintenanceRequestsForHall } from "@/actions/booking/maintenance";
import { useQuery } from "@tanstack/react-query";

export const useGetMaintenanceRequests = (userId: string) => {
  return useQuery({
    queryKey: ["maintenance-requests", userId],
    queryFn: () => getMaintenanceRequests(userId),
    enabled: !!userId,
  });
};

export const useGetMaintenanceRequestsForHall = (hallId: string) => {
  return useQuery({
    queryKey: ["maintenance-requests-for-hall", hallId],
    queryFn: () => getMaintenanceRequestsForHall(hallId),
    enabled: !!hallId,
  });
}


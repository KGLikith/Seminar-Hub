import {  getMaintenanceRequests } from "@/actions/booking/maintenance";
import { useQuery } from "@tanstack/react-query";

export const useGetMaintenanceRequests = (userId: string) => {
  return useQuery({
    queryKey: ["maintenanceRequests", userId],
    queryFn: () => getMaintenanceRequests(userId),
    enabled: !!userId,
  });
};


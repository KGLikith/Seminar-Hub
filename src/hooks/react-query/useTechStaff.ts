import { getTechStaffAssignments, getTechStaffForHall } from "@/actions/user/tech_staff";
import { useQuery } from "@tanstack/react-query";

export const useGetTechStaffForHall = (
  userId: string | undefined,
  hallId: string | undefined
) => {
  return useQuery({
    queryKey: ["techStaffForHall", userId, hallId],
    queryFn: () =>
      userId && hallId ? getTechStaffForHall(userId, hallId) : null,
    enabled: !!userId && !!hallId,
  });
};


export const useGetTechStaffAssignments = (departmentId: string | undefined) => {
  return useQuery({
    queryKey: ["techStaffAssignments", departmentId],
    queryFn: () => departmentId ? getTechStaffAssignments(departmentId) : [],
    enabled: !!departmentId,
  });
}
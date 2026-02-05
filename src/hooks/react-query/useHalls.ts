import { useQuery } from "@tanstack/react-query"
import { getHalls, getHallById, getHallsByProfileId, getAnalytics, getHallsForDepartment, getAnalyticsForHOD, getHallAnalyticsForHOD } from "@/actions/halls"
import { DepartmentName } from "@/generated/enums"
import { getHallImages } from "@/actions/halls/image"

export const useHalls = () => {
  return useQuery({
    queryKey: ["halls"],
    queryFn: async () =>await getHalls(),
  })
}

export const useHall = (id: string) => {
  return useQuery({
    queryKey: ["hall", id],
    queryFn: () => (id ? getHallById(id) : null),
    enabled: !!id,
  })
}

export const useHallFromTechProfileId = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ["hallsByProfile", profileId],
    queryFn: () => (profileId ? getHallsByProfileId(profileId) : null),
    enabled: !!profileId,
  })
}

export const useAnalytics = () => {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: () => getAnalytics(),
  });
};

export const useAnalyticsForHOD = (department_id?: string) => {
  return useQuery({
    queryKey: ["analytics", department_id],
    queryFn: () => getAnalyticsForHOD(department_id!),
    enabled: !!department_id,
  })
}

export const useHallAnalytics = (
  hallId?: string,
  departmentId?: string
) => {
  return useQuery({
    queryKey: ["hall-analytics", hallId],
    queryFn: () => getHallAnalyticsForHOD(hallId!, departmentId!),
    enabled: !!hallId && !!departmentId,
  })
}

export const useDepartmentHalls = (departmentId: string | undefined) => {
  return useQuery({
    queryKey: ["departmentHalls", departmentId],
    queryFn: () => (departmentId ? getHallsForDepartment(departmentId) : []),
    enabled: !!departmentId,
  })
}

export const useHallImages = (hallId: string) =>
  useQuery({
    queryKey: ["hall-images", hallId],
    queryFn: () => getHallImages(hallId),
    enabled: !!hallId,
  });
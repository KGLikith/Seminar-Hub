import { useQuery } from "@tanstack/react-query"
import { getHalls, getHallById, getHallsByProfileId, getAnalytics, getHallsForDepartment } from "@/actions/halls"
import { DepartmentName } from "@/generated/enums"
import { getHallImages } from "@/actions/halls/image"

export const useHalls = () => {
  return useQuery({
    queryKey: ["halls"],
    queryFn: () => getHalls(),
  })
}

export const useHall = (id: string | undefined) => {
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
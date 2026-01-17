import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getEquipmentByHall, updateEquipmentCondition, getComponentsByHall, updateComponentStatus, getEquipmentLogsForHall, getComponentMaintenanceLogsForHall } from "@/actions/equipments"

export const useEquipmentByHall = (hallId: string | undefined) => {
  return useQuery({
    queryKey: ["equipment", hallId],
    queryFn: () => (hallId ? getEquipmentByHall(hallId) : null),
    enabled: !!hallId,
  })
}

// export const useUpdateEquipmentCondition = () => {
//   const queryClient = useQueryClient()
//   return useMutation({
//     mutationFn: ({
//       equipmentId,
//       newCondition,
//       techStaffId,
//       notes,
//     }: {
//       equipmentId: string
//       newCondition: any
//       techStaffId: string
//       notes?: string
//     }) => updateEquipmentCondition(
//       equipmentId, newCondition, techStaffId, notes),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["equipment"] })
//     },
//   })
// }


export const useComponentsByHall = (hallId: string | undefined) => {
  return useQuery({
    queryKey: ["components", hallId],
    queryFn: () => (hallId ? getComponentsByHall(hallId) : null),
    enabled: !!hallId,
  })
}

export const useUpdateComponentStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      componentId,
      newStatus,
      techStaffId,
      notes,
    }: {
      componentId: string
      newStatus: any
      techStaffId: string
      notes?: string
    }) => updateComponentStatus(componentId, newStatus, techStaffId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["components"] })
    },
  })
}

export const useGetEquipmentLogs = (hallId: string) => {
  return useQuery({
    queryKey: ["equipmentLogs", hallId],
    queryFn: () => (hallId ? getEquipmentLogsForHall(hallId) : null),
    enabled: !!hallId,
  })
}

export const useGetComponentMaintenanceLogs = (hallId: string) => {
  return useQuery({
    queryKey: ["maintenanceLogs", hallId],
    queryFn: () => getComponentMaintenanceLogsForHall(hallId),
    enabled: !!hallId,
    });
};

'use server'
import { ComponentStatus, EquipmentCondition } from "@/generated/enums"
import prisma from "@/lib/db"

export async function getEquipmentByHall(hallId: string) {
  return await prisma.equipment.findMany({
    where: { hall_id: hallId },
    include: {
      updated_by: true,
      logs: { orderBy: { created_at: "desc" }, take: 5 },
    },
  })
}

export async function updateEquipmentCondition(
  equipmentId: string,
  newCondition: EquipmentCondition,
  techStaffId: string,
  notes?: string,
) {
  const equipment = await prisma.equipment.findUnique({
    where: { id: equipmentId },
  })

  if (!equipment) throw new Error("Equipment not found")

  // Log the change
  await prisma.equipmentLog.create({
    data: {
      equipment_id: equipmentId,
      previous_condition: equipment.condition,
      new_condition: newCondition,
      notes,
      updated_by: techStaffId,
    },
  })

  return await prisma.equipment.update({
    where: { id: equipmentId },
    data: {
      condition: newCondition,
      last_updated_by: techStaffId,
      last_updated_at: new Date(),
    },
  })
}

export async function getComponentsByHall(hallId: string) {
  return await prisma.hallComponent.findMany({
    where: { hall_id: hallId },
    include: {
      maintenance_logs: { orderBy: { created_at: "desc" }, take: 5 },
    },
  })
}

export async function updateComponentStatus(
  componentId: string,
  newStatus: ComponentStatus,
  techStaffId: string,
  notes?: string,
) {
  const component = await prisma.hallComponent.findUnique({
    where: { id: componentId },
  })

  if (!component) throw new Error("Component not found")

  // Log the change
  await prisma.componentMaintenanceLog.create({
    data: {
      component_id: componentId,
      action: `Status updated to ${newStatus}`,
      previous_status: component.status,
      new_status: newStatus,
      notes,
      performed_by: techStaffId,
    },
  })

  return await prisma.hallComponent.update({
    where: { id: componentId },
    data: {
      status: newStatus,
      last_maintenance: new Date(),
    },
  })
}
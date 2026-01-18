"use server"

import {
  ComponentStatus,
  ComponentType,
  EquipmentCondition,
  EquipmentType,
  MaintenanceAction,
} from "@/generated/enums"
import prisma from "@/lib/db"

export interface CreateComponentInput {
  hallId: string
  formData: {
    name: string
    type: ComponentType
    status: ComponentStatus
    location?: string | null
    installation_date?: Date | null
    notes?: string | null
  }
}

export interface UpdateComponentInput {
  componentId: string
  userId: string
  formData: {
    name: string
    type: ComponentType
    status: ComponentStatus
    location?: string | null
    installation_date?: Date | null
    notes?: string | null
  }
}


export async function getEquipmentByHall(hallId: string) {
  return prisma.equipment.findMany({
    where: { hall_id: hallId },
    include: {
      updated_by: true,
      logs: {
        orderBy: { created_at: "desc" },
        take: 10,
      },
    },
  })
}

export async function updateEquipmentCondition(form: {
  equipmentId: string
  newCondition: EquipmentCondition
  techStaffId: string
  name: string
  type: EquipmentType
  serialNumber?: string
  notes?: string
}) {
  try {
    const equipment = await prisma.equipment.findUnique({
      where: { id: form.equipmentId },
    })

    if (!equipment) return { error: "Equipment not found" }

    await prisma.$transaction([
      prisma.equipmentLog.create({
        data: {
          equipment_id: form.equipmentId,
          action: MaintenanceAction.repaired,
          condition_after: form.newCondition,
          notes: form.notes,
          updated_by: form.techStaffId,
        },
      }),

      prisma.equipment.update({
        where: { id: form.equipmentId },
        data: {
          name: form.name,
          type: form.type,
          condition: form.newCondition,
          serial_number: form.serialNumber,
          last_updated_by: form.techStaffId,
          last_updated_at: new Date(),
        },
      }),
    ])

    return { error: null }
  } catch (err) {
    console.error("❌ updateEquipmentCondition:", err)
    return { error: "Failed to update equipment" }
  }
}

export async function addEquipmentToHall(form: {
  hallId: string
  name: string
  type: EquipmentType
  serialNumber?: string
  condition: EquipmentCondition
  techStaffId: string
}) {
  try {
    const equipment = await prisma.equipment.create({
      data: {
        hall_id: form.hallId,
        name: form.name,
        type: form.type,
        serial_number: form.serialNumber,
        condition: form.condition,
        last_updated_by: form.techStaffId,
        last_updated_at: new Date(),
      },
    })

    await prisma.equipmentLog.create({
      data: {
        equipment_id: equipment.id,
        action: MaintenanceAction.created,
        condition_after: form.condition,
        updated_by: form.techStaffId,
      },
    })

    return { error: null }
  } catch (err) {
    console.error("❌ addEquipmentToHall:", err)
    return { error: "Failed to add equipment" }
  }
}


export async function getComponentsByHall(hallId: string) {
  return prisma.hallComponent.findMany({
    where: { hall_id: hallId },
    include: {
      logs: {
        orderBy: { created_at: "desc" },
        take: 10,
      },
    },
  })
}

export async function updateComponentStatus(
  componentId: string,
  newStatus: ComponentStatus,
  techStaffId: string,
  notes?: string
) {
  const component = await prisma.hallComponent.findUnique({
    where: { id: componentId },
  })

  if (!component) throw new Error("Component not found")

  await prisma.$transaction([
    prisma.componentMaintenanceLog.create({
      data: {
        component_id: componentId,
        action: MaintenanceAction.repaired,
        status_after: newStatus,
        notes,
        performed_by: techStaffId,
      },
    }),

    prisma.hallComponent.update({
      where: { id: componentId },
      data: {
        status: newStatus,
        last_maintenance: new Date(),
      },
    }),
  ])

  return { success: true }
}

export async function createHallComponent(input: CreateComponentInput) {
  try {
    const component = await prisma.hallComponent.create({
      data: {
        hall_id: input.hallId,
        name: input.formData.name,
        type: input.formData.type,
        status: input.formData.status,
        location: input.formData.location ?? null,
        installation_date: input.formData.installation_date ?? null,
        notes: input.formData.notes ?? null,
      },
    })

    await prisma.componentMaintenanceLog.create({
      data: {
        component_id: component.id,
        action: MaintenanceAction.created,
        status_after: input.formData.status,
        performed_by: input.hallId, // replaced later if needed
      },
    })

    return { success: true }
  } catch (err) {
    console.error("❌ createHallComponent:", err)
    return { error: "Failed to create component" }
  }
}

export async function updateHallComponent(input: UpdateComponentInput) {
  try {
    const existing = await prisma.hallComponent.findUnique({
      where: { id: input.componentId },
      select: { status: true },
    })

    if (!existing) return { error: "Component not found" }

    await prisma.hallComponent.update({
      where: { id: input.componentId },
      data: {
        name: input.formData.name,
        type: input.formData.type,
        status: input.formData.status,
        location: input.formData.location ?? null,
        installation_date: input.formData.installation_date ?? null,
        notes: input.formData.notes ?? null,
      },
    })

    if (existing.status !== input.formData.status) {
      await prisma.componentMaintenanceLog.create({
        data: {
          component_id: input.componentId,
          action: MaintenanceAction.repaired,
          status_after: input.formData.status,
          notes: input.formData.notes,
          performed_by: input.userId,
        },
      })
    }

    return { success: true }
  } catch (err) {
    console.error("❌ updateHallComponent:", err)
    return { error: "Failed to update component" }
  }
}


export async function getEquipmentLogsForHall(hallId: string) {
  return prisma.equipmentLog.findMany({
    where: {
      equipment: { hall_id: hallId },
    },
    include: { equipment: true },
    orderBy: { created_at: "desc" },
    take: 50,
  })
}

export async function getComponentMaintenanceLogsForHall(hallId: string) {
  return prisma.componentMaintenanceLog.findMany({
    where: {
      component: { hall_id: hallId },
    },
    include: { component: true },
    orderBy: { created_at: "desc" },
    take: 50,
  })
}

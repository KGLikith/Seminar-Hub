"use server";
import {
  ComponentStatus,
  ComponentType,
  EquipmentCondition,
  EquipmentType,
} from "@/generated/enums";
import prisma from "@/lib/db";

export interface CreateComponentInput {
  hallId: string;
  formData: {
    name: string;
    type: ComponentType
    status: ComponentStatus
    location?: string | null;
    installation_date?: Date | null;
    notes?: string | null;
  };
}

export interface UpdateComponentInput {
  componentId: string;
  userId: string; 
  formData: {
    name: string;
    type: ComponentType;
    status: ComponentStatus;
    location?: string | null;
    installation_date?: Date | null;
    notes?: string | null;
  };
}

export async function getEquipmentByHall(hallId: string) {
  return await prisma.equipment.findMany({
    where: { hall_id: hallId },
    include: {
      updated_by: true,
      logs: { orderBy: { created_at: "desc" }, take: 5 },
    },
  });
}

export async function updateEquipmentCondition(form: {
  equipmentId: string;
  newCondition: EquipmentCondition;
  techStaffId: string;
  name: string;
  type: EquipmentType;
  serialNumber?: string;
  notes?: string;
}) {
  try {
    const { equipmentId, newCondition, techStaffId, notes, name, type } = form;
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
    });

    if (!equipment) return {
      error: "Equipment not found",
    }

    await prisma.equipmentLog.create({
      data: {
        equipment_id: equipmentId,
        previous_condition: equipment.condition,
        new_condition: newCondition,
        notes,
        updated_by: techStaffId,
      },
    });

    await prisma.equipment.update({
      where: { id: equipmentId },
      data: {
        name: name,
        type: type,
        condition: newCondition,
        last_updated_by: techStaffId,
        last_updated_at: new Date(),
      },
    });

    return { error: null };
  } catch (err) {
    console.log("Error updating equipment condition:", err);
    return { error: "Failed to update equipment condition" };
  }
}

export async function addEquipmentToHall(form: {
  hallId: string;
  name: string;
  type: EquipmentType;
  serialNumber?: string;
  condition: EquipmentCondition;
  techStaffId: string;
}) {
  try{
    const { hallId, name, type, serialNumber, condition, techStaffId } = form;
    await prisma.equipment.create({
      data: {
        hall_id: hallId,
        name,
        type,
        serial_number: serialNumber,
        condition,
        last_updated_by: techStaffId,
        last_updated_at: new Date(),
      },
    });
    return { error: null}
  }catch(err){
    return { error: "Failed to add equipment" };
  }

}

export async function getComponentsByHall(hallId: string) {
  return await prisma.hallComponent.findMany({
    where: { hall_id: hallId },
    include: {
      logs: { orderBy: { created_at: "desc" }, take: 5 },
    },
  });
}

export async function updateComponentStatus(
  componentId: string,
  newStatus: ComponentStatus,
  techStaffId: string,
  notes?: string
) {
  const component = await prisma.hallComponent.findUnique({
    where: { id: componentId },
  });

  if (!component) throw new Error("Component not found");

  await prisma.componentMaintenanceLog.create({
    data: {
      component_id: componentId,
      action: `Status updated to ${newStatus}`,
      previous_status: component.status,
      new_status: newStatus,
      notes,
      performed_by: techStaffId,
    },
  });

  return await prisma.hallComponent.update({
    where: { id: componentId },
    data: {
      status: newStatus,
      last_maintenance: new Date(),
    },
  });
}

export async function createHallComponent(input: CreateComponentInput) {
  const { hallId, formData } = input;

  try {
    await prisma.hallComponent.create({
      data: {
        name: formData.name,
        type: formData.type as any,
        status: formData.status as any,
        location: formData.location || null,
        installation_date: formData.installation_date
          ? new Date(formData.installation_date)
          : null,
        notes: formData.notes || null,
        hall_id: hallId,
      },
    });

    return { success: true, message: "Component created successfully" };
  } catch (err) {
    console.error("❌ Create component error:", err);
    return { error: "Failed to create component" };
  }
}

export async function updateHallComponent(input: UpdateComponentInput) {
  const { componentId, userId, formData } = input;

  try {
    const existing = await prisma.hallComponent.findUnique({
      where: { id: componentId },
      select: { status: true },
    });

    if (!existing) {
      return { error: "Component not found" };
    }

    await prisma.hallComponent.update({
      where: { id: componentId },
      data: {
        name: formData.name,
        type: formData.type as any,
        status: formData.status as any,
        location: formData.location || null,
        installation_date: formData.installation_date
          ? new Date(formData.installation_date)
          : null,
        notes: formData.notes || null,
      },
    });

    if (existing.status !== formData.status) {
      await prisma.componentMaintenanceLog.create({
        data: {
          component_id: componentId,
          action: "Status Updated",
          previous_status: existing.status as any,
          new_status: formData.status as any,
          notes: formData.notes || null,
          performed_by: userId,
        },
      });
    }

    return { success: true, message: "Component updated successfully" };
  } catch (err) {
    console.error("❌ Update component error:", err);
    return { error: "Failed to update component" };
  }
}

export const getEquipmentLogsForHall = async (hallId: string) => {
  return await prisma.equipmentLog.findMany({
    where: {
      equipment: { hall_id: hallId },
    },
    include: { equipment: true },
    orderBy: { created_at: "desc" },
    take: 50,
  });
}

export const getComponentMaintenanceLogsForHall = async (hallId: string) => {
  return await prisma.componentMaintenanceLog.findMany({
    where: {
      component: { hall_id: hallId },
    },
    include: { component: true },
    orderBy: { created_at: "desc" },
    take: 50,
  });
}
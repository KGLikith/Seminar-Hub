"use server";
import { MaintenancePriority, MaintenanceRequestStatus, MaintenanceRequestType } from "@/generated/enums";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendNotification } from "../notification";

export interface createMaintanaceRequestInput {
  hallId: string;
  techStaffId: string;
  requestType: MaintenanceRequestType;
  componentId?: string;
  equipmentId?: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceRequestStatus;
}

export async function getTechStaffForHall(userId: string, id: string) {
  try {
    const data = await prisma.hallTechStaff.findFirst({
      where: {
        hall_id: id,
        tech_staff_id: userId,
      },
    });
    return !!data;
  } catch (error) {
    console.error("Error checking tech staff assignment:", error);
    return false;
  }
}

export async function getTechStaffAssignments(departmentId: string) {
  const data = await prisma.hallTechStaff.findMany({
    where: {
      hall: {
        department: {
          id: departmentId,
        },
      },
    },
    select: {
      tech_staff_id: true,
      hall_id: true,
    },
  });
  return data;
}

export async function assignHallToStaff(techStaffId: string, hallId: string) {
  try {
    await prisma.hallTechStaff.deleteMany({
      where: { tech_staff_id: techStaffId },
    });

    await prisma.hallTechStaff.create({
      data: {
        tech_staff_id: techStaffId,
        hall_id: hallId,
      },
    });

    revalidatePath("/dashboard/hod/department-management");

    return {
      success: true,
      message: "Tech staff assigned successfully",
    };
  } catch (error) {
    console.error("Error assigning hall:", error);
    return {
      success: false,
      message: "Failed to assign hall",
    };
  }
}

export async function createMaintanaceRequest(data: createMaintanaceRequestInput) {
  try {
    await prisma.maintenanceRequest.create({
      data: {
        hall_id: data.hallId,
        tech_staff_id: data.techStaffId,
        request_type: data.requestType,
        component_id: data.componentId || null,
        equipment_id: data.equipmentId || null,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
      },
    });
    revalidatePath("/dashboard/tech-staff/maintenance-requests");
    return { success: true };
  } catch (error) {
    console.error("Error creating maintenance request:", error);
    return { error: "Failed to create maintenance request" };
  }
}

export async function getAssignedHall(userId: string) {
  try {
    const data = await prisma.hallTechStaff.findMany({
      where: {
        tech_staff_id: userId,
      },
      select: {
        hall_id: true,
        hall: {
          select: {
            name: true
          }
        }
      },
    });

    return data;
  } catch (error) {
    console.error("Error fetching assigned hall:", error);
    return null;
  }
}

export async function createMaintenanceRequest(input: {
  hallId: string
  techStaffId: string
  requestType: MaintenanceRequestType
  priority: MaintenancePriority
  title: string
  description: string

  equipmentId?: string | null
  componentId?: string | null

  newEquipmentType?: string | null
  newComponentType?: string | null
}) {
  try {
    if (input.requestType === "new_installation") {
      if (input.equipmentId || input.componentId) {
        return { error: "New installation cannot reference existing assets" }
      }
    } else {
      if (!input.equipmentId && !input.componentId) {
        return { error: "Select equipment or component" }
      }
    }

    const request = await prisma.maintenanceRequest.create({
      data: {
        hall_id: input.hallId,
        tech_staff_id: input.techStaffId,
        request_type: input.requestType,
        priority: input.priority,
        title: input.title,
        description: input.description,

        equipment_id: input.equipmentId ?? null,
        component_id: input.componentId ?? null,
      },
      include: {
        hall: {
          include: {
            department: {
              include: { hod_profile: true },
            },
          },
        },
        techStaff: true,
      },
    })

    const hod = request.hall.department.hod_profile
    if (hod) {
      await sendNotification({
        userId: hod.id,
        title: "New Maintenance Request",
        message: `Maintenance request raised for ${request.hall.name} by ${request.techStaff.name}`,
        type: "maintenance_request_created",
      })
    }

    return { success: true }
  } catch (err) {
    console.error("❌ createMaintenanceRequest:", err)
    return { error: "Failed to create maintenance request" }
  }
}

export async function getMaintenanceRequestsByTechStaff(techStaffId: string) {
  return prisma.maintenanceRequest.findMany({
    where: { tech_staff_id: techStaffId, status: "pending" },
    include: {
      hall: true,
      equipment: true,
      component: true,
    },
    orderBy: { created_at: "desc" },
  })
}

export async function getApprovedRequestsByTechStaff(techStaffId: string) {
  return prisma.maintenanceRequest.findMany({
    where: { tech_staff_id: techStaffId, status: "approved" },
    include: {
      hall: true,
      equipment: true,
      component: true,
    },
    orderBy: { created_at: "desc" },
  })
}
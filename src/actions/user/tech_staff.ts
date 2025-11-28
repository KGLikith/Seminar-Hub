"use server";
import { MaintenanceRequestStatus } from "@/generated/enums";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface createMaintanaceRequestInput {
  hallId: string;
  techStaffId: string;
  requestType: string;
  componentId?: string;
  equipmentId?: string;
  title: string;
  description: string;
  priority: string;
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
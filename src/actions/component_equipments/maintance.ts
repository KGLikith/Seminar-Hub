'use server'

import {
  MaintenanceAction,
  EquipmentCondition,
  ComponentStatus,
  EquipmentType,
  ComponentType,
  MaintenanceRequestStatus,
} from "@/generated/enums"
import prisma from "@/lib/db"
import { sendNotification } from "../notification"

export async function approveMaintenance(requestId: string, hodId: string) {
  const request = await prisma.maintenanceRequest.update({
    where: { id: requestId },
    data: {
      status: "approved",
      hod_id: hodId,
      approved_at: new Date(),
    },
    include: {
      hall: true,
      techStaff: true,
    },
  })

  await sendNotification({
    userId: request.techStaff.id,
    title: "Maintenance Request Approved",
    message: `Your maintenance request for ${request.hall.name} has been approved.`,
    type: "maintenance_request_approved",
  })

  return { success: true }
}

export async function rejectMaintenance(
  requestId: string,
  hodId: string,
  reason: string
) {
  const request = await prisma.maintenanceRequest.update({
    where: { id: requestId },
    data: {
      status: "rejected",
      hod_id: hodId,
      rejection_reason: reason,
    },
    include: {
      hall: true,
      techStaff: true,
    },
  })

  await sendNotification({
    userId: request.techStaff.id,
    title: "Maintenance Request Rejected",
    message: `Your request for ${request.hall.name} was rejected. Reason: ${reason}`,
    type: "maintenance_request_rejected",
  })

  return { success: true }
}

export async function closeMaintenanceRequest(input: {
  requestId: string
  techStaffId: string
  finalStatus: "completed" | "stopped"
  notes?: string
}) {
  return prisma.$transaction(async (tx) => {
    const request = await tx.maintenanceRequest.findUnique({
      where: { id: input.requestId },
      include: {
        equipment: true,
        component: true,
      },
    })

    if (!request) return { error: "Maintenance request not found" }

    if (request.tech_staff_id !== input.techStaffId) {
      return { error: "Unauthorized" }
    }

    if (request.status !== "approved") {
      return { error: "Only approved requests can be closed" }
    }

    /* ===================== APPLY EFFECT ===================== */

    if (input.finalStatus === "completed") {
      /* ---------- EQUIPMENT ---------- */
      if (request.equipment_id && request.equipment) {
        await tx.equipment.update({
          where: { id: request.equipment_id },
          data: {
            condition: EquipmentCondition.active,
            last_updated_by: input.techStaffId,
            last_updated_at: new Date(),
          },
        })

        await tx.equipmentLog.create({
          data: {
            equipment_id: request.equipment_id,
            action: MaintenanceAction.completed,
            condition_after: EquipmentCondition.active,
            notes: input.notes,
            updated_by: input.techStaffId,
          },
        })
      }

      /* ---------- COMPONENT ---------- */
      if (request.component_id && request.component) {
        await tx.hallComponent.update({
          where: { id: request.component_id },
          data: {
            status: ComponentStatus.operational,
            last_maintenance: new Date(),
          },
        })

        await tx.componentMaintenanceLog.create({
          data: {
            component_id: request.component_id,
            action: MaintenanceAction.completed,
            status_after: ComponentStatus.operational,
            notes: input.notes,
            performed_by: input.techStaffId,
          },
        })
      }
    }

    await tx.maintenanceRequest.update({
      where: { id: request.id },
      data: {
        status:
          input.finalStatus === "completed"
            ? MaintenanceRequestStatus.completed
            : MaintenanceRequestStatus.rejected,
        rejection_reason:
          input.finalStatus === "stopped" ? input.notes : null,
        updated_at: new Date(),
      },
    })

    return { success: true }
  })
}
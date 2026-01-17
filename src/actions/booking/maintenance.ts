'use server'
import { MaintenanceRequestStatus } from "@/generated/enums";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateMaintenanceRequestStatus(
  requestId: string,
  status: MaintenanceRequestStatus,
  hodId: string,
  rejectionReason?: string
) {
  try {
    const data = await prisma.maintenanceRequest.update({
      where: { id: requestId },
      data: {
        status,
        hod_id: hodId,
        rejection_reason: rejectionReason || null,
        approved_at:
          status === MaintenanceRequestStatus.approved ? new Date() : null,
      },
    });

    await prisma.notification.create({
      data: {
        user_id: data.tech_staff_id,
        title:
          status === MaintenanceRequestStatus.approved
            ? "Maintenance Request Approved"
            : status === MaintenanceRequestStatus.rejected
            ? "Maintenance Request Rejected"
            : "Maintenance Request Updated",
        message:
          status === MaintenanceRequestStatus.approved
            ? "Your maintenance request has been approved by the HOD."
            : status === MaintenanceRequestStatus.rejected
            ? `Your maintenance request was rejected. Reason: ${rejectionReason ?? "Not specified"}`
            : "Your maintenance request status has been updated.",
        type: "maintenance_update",
      },
    })
    
    revalidatePath("/dashboard/hod/maintanance-approval");
    return { data, error: null };
  } catch (error) {
    console.error("Error updating maintenance request status:", error);
    return { data: null, error };
  }
}

export async function getMaintenanceRequests(userId: string) {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { department_id: true },
    });

    if (!profile?.department_id) {
      return { requests: [] };
    }

    const halls = await prisma.seminarHall.findMany({
      where: { department_id: profile.department_id },
      select: { id: true },
    });

    const hallIds = halls.map((h) => h.id);

    if (hallIds.length === 0) {
      return { requests: [] };
    }

    const requests = await prisma.maintenanceRequest.findMany({
      where: {
        hall_id: { in: hallIds },
      },
      orderBy: { created_at: "desc" },
      include: {
        hall: {
          select: { name: true },
        },
        techStaff: {
          select: { name: true, email: true },
        },
        component: {
          select: { name: true },
        },
        equipment: {
          select: { name: true },
        },
      },
    });

    const enriched = requests.map((req) => ({
      ...req,
      seminar_halls: req.hall ?? { name: "Unknown" },
      profiles: req.techStaff ?? { name: "Unknown", email: "" },
      hall_components: req.component ?? null,
      equipment: req.equipment ?? null,
    }));

    return enriched;
}


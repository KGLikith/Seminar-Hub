"use server"

import prisma from "@/lib/db"
import { DepartmentName } from "@/schemas/department"

export async function checkDepartmentHod(department: DepartmentName) {
  const dept = await prisma.department.findUnique({
    where: { name: department },
    select: { hod_id: true },
  })

  console.log("Department HOD check for:", department, "HOD ID:", dept?.hod_id)

  if (dept?.hod_id) {
    return {
      ok: false,
      message: "This department already has a HOD",
    }
  }

  return { ok: true }
}

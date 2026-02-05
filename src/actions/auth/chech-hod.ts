"use server"

import prisma from "@/lib/db"

export async function checkDepartmentHod(department: string) {
  const dept = await prisma.department.findUnique({
    where: { name: department },
    select: { hod_id: true },
  })

  if (dept?.hod_id) {
    return {
      ok: false,
      message: "This department already has a HOD",
    }
  }

  return { ok: true }
}

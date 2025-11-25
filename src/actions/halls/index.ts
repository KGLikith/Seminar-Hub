'use server'
import { HallStatus } from "@/generated/enums"
import prisma from "@/lib/db"

export async function getHalls() {
  return await prisma.seminarHall.findMany({
    include: {
      department: true,
      equipment: true,
      components: true,
    },
    orderBy: { name: "asc" },
  })
}

export async function getHallById(id: string) {
  return await prisma.seminarHall.findUnique({
    where: { id },
    include: {
      department: true,
      equipment: true,
      components: true,
      bookings: {
        where: { status: "approved" },
        orderBy: { booking_date: "asc" },
      },
      tech_staff: {
        include: { tech_staff: true },
      },
    },
  })
}

export async function updateHallStatus(hallId: string, status: HallStatus) {
  return await prisma.seminarHall.update({
    where: { id: hallId },
    data: { status },
  })
}

import prisma from "@/lib/db"

export async function resolveHallByName(message: string) {
  return prisma.seminarHall.findFirst({
    where: {
      name: {
        contains: message,
        mode: "insensitive",
      },
    },
  })
}

export async function resolveEquipment(hallId: string, type: any) {
  return prisma.equipment.findFirst({
    where: { hall_id: hallId, type },
  })
}

export async function resolveComponent(hallId: string, type: any) {
  return prisma.hallComponent.findFirst({
    where: { hall_id: hallId, type },
  })
}

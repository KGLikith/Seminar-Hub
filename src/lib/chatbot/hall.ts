import prisma from "@/lib/db"

export async function resolveHallFromMessage(message: string) {
  const halls = await prisma.seminarHall.findMany({
    select: { id: true, name: true },
  })

  const msg = message.toLowerCase()

  return (
    halls.find((h) => msg.includes(h.name.toLowerCase())) ?? null
  )
}

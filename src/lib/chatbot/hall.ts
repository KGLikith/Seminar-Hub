import prisma from "@/lib/db"

export async function resolveHallFromMessage(message: string) {
  const halls = await prisma.seminarHall.findMany({
    select: { id: true, name: true },
  })

  const msg = message.toLowerCase()

  let bestMatch: { id: string; name: string } | null = null
  let bestScore = 0

  for (const hall of halls) {
    const tokens = hall.name.toLowerCase().split(/\s+/)

    let score = 0
    for (const token of tokens) {
      if (msg.includes(token)) score++
    }

    if (score > bestScore) {
      bestScore = score
      bestMatch = hall
    }
  }

  return bestScore > 0 ? bestMatch : null
}

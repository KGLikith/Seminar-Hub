import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { routeChatbotMessage } from "@/lib/chatbot/router"

export async function POST(req: Request) {
  const { message, profileId } = await req.json()

  const roles = await prisma.userRoleAssignment.findMany({
    where: { profile_id: profileId },
    select: { role: true },
  })

  const ctx = {
    message,
    profileId,
    roles: roles.map(r => r.role),
    now: new Date(),
  }

  const reply = await routeChatbotMessage(ctx)

  return NextResponse.json({ reply })
}

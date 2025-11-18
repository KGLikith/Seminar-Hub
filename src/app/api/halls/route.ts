import { prisma } from "@/lib/db";
import { getCurrentUserProfile } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const halls = await prisma.seminarHall.findMany({
      include: {
        equipment: { select: { id: true, name: true, condition: true } },
        tech_staff: { select: { tech_staff: { select: { name: true, phone: true } } } },
      },
    });

    return NextResponse.json(halls);
  } catch (error) {
    console.error("Error fetching halls:", error);
    return NextResponse.json(
      { error: "Failed to fetch halls" },
      { status: 500 }
    );
  }
}

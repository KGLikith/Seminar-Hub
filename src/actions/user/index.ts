"use server";
import prisma from "@/lib/db";

export async function getUserRole(userId: string) {
  const roles = await prisma.userRoleAssignment.findMany({
    where: { profile_id: userId },
  });
  return roles.length > 0 ? roles[0].role : null;
}

export async function getProfile(clerkId: string) {
  const user = await prisma.profile.findFirst({
    where: {
      user: { clerkId: clerkId },
    },
    include: {
      department: true,
      roles: true,
    },
  });
  return user;
}

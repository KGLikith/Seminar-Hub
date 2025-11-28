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
      department: {
        include: {
          hod_profile: true,
        },
      },
      roles: true,
    },
  });
  return user;
}

export async function updateProfile(
  profileId: string,
  updates: {
    name?: string;
    phone?: string;
  }
) {
  try {
    await prisma.profile.update({
      where: { id: profileId },
      data: {
        ...updates,
      },
    });

    return { error: null };
  } catch (err) {
    console.log("Error updating profile:", err);
    return { error: "Failed to update profile" };
  }
}

export async function fetchProfilesByDepartment(departmentId: string) {
  const profiles = await prisma.profile.findMany({
    where: {
      department_id: departmentId,
      roles: {
        some: {
          role: { in: ["teacher", "tech_staff"] },
        },
      },
    },
    include: {
      roles: true,
    },
  });
  return profiles;
}

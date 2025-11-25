"use server";

import { UserRole } from "@/generated/enums";
import db from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const onCompleteUserRegistration = async (
  fullname: string,
  clerkId: string,
  email: string,
  type: UserRole,
  department: string
) => {
  try {
    const user = await currentUser();
    const registered = await db.user.create({
      data: {
        email,
        clerkId,
        image_url: user?.imageUrl,
        profile: {
          create: {
            clerkId,
            email,
            name: fullname.trim(),
            roles: {
              create: {
                role: type,
              },
            },
            department: {
              connectOrCreate: {
                where: { name: department },
                create: { name: department },
              },
            },
          },
        },
      },
    });

    if (registered) {
      return { status: 200, user: registered };
    }
  } catch (error) {
    console.log(error);
    return { status: 400 };
  }
};

export const onLoginUser = async () => {
  // const user = await currentUser();
  // if (!user) redirect("/auth/sign-in");
  // else {
  //   try {
  //     const authenticated = await db.user.findUnique({
  //       where: {
  //         clerkId: user.id,
  //       },
  //       include: {
  //       },
  //     });
  //     if (authenticated) {
  //       return {
  //         status: 200,
  //         user: authenticated,
  //         ProfileCompleted:
  //           authenticated.Donor ||
  //           authenticated.Organisation ||
  //           authenticated.Volunteer,
  //       };
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     return { status: 400 };
  //   }
  // }
};

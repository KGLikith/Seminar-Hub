import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const Layout = async ({ children }: Props) => {
  const user = await currentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="h-screen flex w-full justify-center bg-neutral-900">
      <div className="w-[600px] ld:w-full flex flex-col items-start p-6">

        <h1 className="font-extrabold text-2xl text-teal-400">
          Seminar Hub
        </h1>

        {children}
      </div>

      <div className="hidden lg:flex flex-1 w-full max-h-full bg-teal-50 max-w-4000px overflow-hidden relative flex-col pt-10 pl-24 gap-3">

        <h2 className="text-teal-800 md:text-4xl font-bold">
          Streamline Your Seminar Hall Scheduling
        </h2>

        <p className="text-teal-700 md:text-sm mb-10">
          Book seminar halls effortlessly. Manage equipment, check availability,
          and coordinate with tech staff — all in one platform.
        </p>

        <div className="flex justify-center items-center w-full h-full">
          <Image
            src="/seminar_hall.png"
            alt="Seminar hall display"
            loading="lazy"
            sizes="30"
            className="absolute shrink-0 w-[70%] h-[70%] top-40 object-cover rounded-xl"
            width={0}
            height={0}
          />
        </div>
      </div>
    </div>
  );
};

export default Layout;

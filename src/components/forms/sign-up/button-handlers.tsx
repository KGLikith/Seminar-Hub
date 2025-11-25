"use client";
import { Button } from "@/components/ui/button";
import { useAuthContextHook } from "@/context/use-auth-context";
import { useSignUpForm } from "@/hooks/sign-up/use-sign-up";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { useFormContext } from "react-hook-form";

// type Props = {};

const ButtonHandler = () => {
  const { setCurrentStep, currentStep } = useAuthContextHook();
  const { getValues, trigger } = useFormContext();
  const { onGenerateOTP } = useSignUpForm();
  const [loading, setLoading] = useState(false)

  if (currentStep === 3) {
    return (
      <div className="w-full flex flex-col gap-3 items-center text-green-700">
        <Button
          type="submit"
          className="w-full bg-white text-black hover:bg-gray-300 cursor-pointer"
        >
          Create an account
        </Button>
        <p className="text-gray-500 ">
          Already have an account?
          <Link href="/auth/sign-in" className="font-bold text-gray-400">
            Sign In
          </Link>
        </p>
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <div className="w-full flex flex-col gap-3 items-center text-green-700">
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black hover:bg-gray-300 cursor-pointer"
          {...{
            onClick: async () => {
              setLoading(true)
              const isValid = await trigger([
                "email",
                "password",
                "confirmPassword",
              ]);
              if (isValid)
                onGenerateOTP(
                  getValues("email"),
                  getValues("password"),
                  setCurrentStep
                );
              setLoading(false)
            },
          }}
        >
          {
            loading ? <>
              <Loader2 />
              Generating OTP
            </> : "Continue"
          }
        </Button>
        <p className="text-gray-500">
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="font-bold text-gray-400">
            Sign In
          </Link>
        </p>
        {/* <p className="flex justify-between items-center gap-2">
          Go boack to the previous step
          <Button
            type="button"
            variant={"ghost"}
            className=" text-gray-400 w-fit p-0 text-start font-bold  hover:bg-transparent hover:text-white"
            onClick={() => setCurrentStep((prev: number) => prev - 1)}
          >
            Back
          </Button>
        </p> */}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3 items-center text-green-700">
      <Button
        type="submit"
        className="w-full bg-white text-black hover:bg-gray-300 cursor-pointer"
        onClick={() => setCurrentStep((prev: number) => prev + 1)}
      >
        Continue
      </Button>
      <p className="text-gray-500">
        Already have an account?{" "}
        <Link href="/auth/sign-in" className="font-bold text-gray-400">
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default ButtonHandler;

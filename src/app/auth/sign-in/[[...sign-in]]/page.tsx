import SignInFormProvider from "@/components/forms/sign-in/form-provider";
import LoginForm from "@/components/forms/sign-in/login-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const SignInPage = () => {
  return (
    <div className="flex-1 py-36 md:px-16 w-full">
      <div className="flex flex-col h-full gap-3">
        <SignInFormProvider>
          <div className="flex flex-col gap-3">
            <LoginForm />
            <div className="w-full flex flex-col gap-3 items-center">
              <Button
                type="submit"
                className="w-full bg-white hover:bg-gray-200 text-black"
              >
                Submit
              </Button>
              <p className="text-gray-500">
                Forgot Password?{" "}
                <Link
                  href="/auth/forget-password"
                  className="font-bold text-gray-400"
                >
                  Click here
                </Link>
              </p>
              <p className="text-gray-500">
                Don’t have an account?{" "}
                <Link href="/auth/sign-up" className="font-bold text-gray-400">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </SignInFormProvider>
      </div>
    </div>
  );
};

export default SignInPage;

"use client";
import {
  UserRegistrationProps,
  UserRegistrationSchema,
} from "@/schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { onCompleteUserRegistration } from "@/actions/auth";
import { z } from "zod";
import { toast } from "sonner";
import { UserRole } from "@/generated/enums";

export const useSignUpForm = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { signUp, isLoaded, setActive } = useSignUp();
  const router = useRouter();
  const methods = useForm<z.infer<typeof UserRegistrationSchema>>({
    resolver: zodResolver(UserRegistrationSchema),
    defaultValues: {
      type: UserRole.teacher,
      department: "Computer Science",
      fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const onGenerateOTP = async (
    email: string,
    password: string,
    onNext: React.Dispatch<React.SetStateAction<number>>
  ) => {
    if (!isLoaded) return;
    try {
      setLoading(true);
      if (!signUp.createdUserId) {
        await signUp.create({
          emailAddress: email,
          password: password,
        });
      }
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setLoading(false);

      onNext((prev) => prev + 1);
    } catch (error: any) {
      setLoading(false);
      const msg = error?.errors?.[0]?.longMessage || "Something went wrong";
      toast.error(msg);
    }
  };

  const onHandleSubmit = methods.handleSubmit(
    async (values: UserRegistrationProps) => {
      if (!isLoaded) return;
      setLoading(true);
      try {
        const completeSignUp = await signUp.attemptEmailAddressVerification({
          code: values.otp as string,
        });

        if (completeSignUp.status !== "complete") {
          return { message: "Something went wrong!" };
        }

        if (completeSignUp.status == "complete") {
          if (!signUp.createdUserId) return;
          const registered = await onCompleteUserRegistration(
            values.fullname,
            signUp.createdUserId,
            values.email,
            values.type,
            values.department
          );

          if (registered?.status == 200 && registered.user) {
            await setActive({
              session: completeSignUp.createdSessionId,
            });

            router.push("/dashboard");
          }
          if (registered?.status == 400) {
            toast.error("Something went wrong!");
          }
        }
      } catch (error: any) {
        console.log(error);
        toast.error("Something went wrong!");
      } finally {
        setLoading(false);
      }
    }
  );
  return {
    methods,
    onHandleSubmit,
    onGenerateOTP,
    loading,
  };
};

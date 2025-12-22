"use client";
// import { useToast } from '@/components/ui/use-toast'
import { UserLoginProps, UserLoginSchema } from "@/schemas/auth.schema";
import { useSignIn } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const useSignInForm = () => {
  const { isLoaded, setActive, signIn } = useSignIn();
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const methods = useForm<UserLoginProps>({
    resolver: zodResolver(UserLoginSchema),
    mode: "onChange",
  });
  const onHandleSubmit = methods.handleSubmit(
    async (values: UserLoginProps) => {
      console.log("hello", values)
      if (!isLoaded) return;
      try {
        setLoading(true);
        const authenticated = await signIn.create({
          identifier: values.email,
          password: values.password,
        });

        console.log(JSON.stringify(authenticated, null, 2));

        if (authenticated.status === "complete") {
          console.log("hello inside")
          await setActive({ session: authenticated.createdSessionId });
          toast.success("Welcome back!");
          router.push("/dashboard");
        }else{
          // console.log("helo what s up")
        }
        
      } catch (error: any) {
        setLoading(false);
        const code = error?.errors?.[0]?.code;

        if (!code) {
          console.log(error)
          toast.error("Something went wrong");
          return;
        }

        if (code === "form_password_incorrect") {
          toast.error("Password incorrect");
        } else if (code === "form_identifier_not_found") {
          toast.error("Email not registered");
        } else {
          toast.error(code);
        }
      }
    }
  );

  return {
    methods,
    onHandleSubmit,
    loading,
  };
};

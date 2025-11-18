"use client";
import React, { useState } from "react";
import { useAuth, useSignIn } from "@clerk/nextjs";
import type { NextPage } from "next";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/_components/loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// const formschema = z.object({
//   email: z
//     .string()
//     .email({ message: "Invalid email" })
//     .min(1, { message: "Email is required" })
//     .max(255, { message: "Email is too long" }),
//   password: z
//     .string()
//     .min(8, { message: "Password must be at least 8 characters long" }),
//   code: z.string().length(6, { message: "Code must be 6 characters long" }),
// });

const ForgotPasswordPage: NextPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  // const [secondFactor, setSecondFactor] = useState(false);
  const [error, setError] = useState("");

  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();
  const { isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();

  // const form = useForm({
  //   resolver: zodResolver(formschema),
  //   defaultValues: {
  //     email: "",
  //     password: "",
  //     code: "",
  //   },
  // });

  if (!isLoaded) {
    return null;
  }
  if (isSignedIn) {
    router.push("/dashboard");
  }
  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError("Email is required");
      return;
    }
    setLoading(true);
    await signIn
      ?.create({
        strategy: "reset_password_email_code",
        identifier: email,
      })
      .then(() => {
        setSuccessfulCreation(true);
        setError("");
      })
      .catch((err) => {
        console.log("error", err.errors[0].longMessage);
        toast({
          variant: "destructive",
          duration: 2000,
          description: err.errors[0].longMessage,
        });
        // setError(err.errors[0].longMessage);
      });
    setLoading(false);
  }

  async function reset(e: React.FormEvent) {
    e.preventDefault();
    console.log(code, password);
    if (!code) {
      setError("Code is required");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }
    setLoading(true);
    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });
      if (!result?.createdSessionId || !result) return;
      // Check if 2FA is required
      if (result.status === "needs_second_factor") {
        // setSecondFactor(true);
        setError("");
      } else if (result.status === "complete") {
        setActive?.({ session: result.createdSessionId });
        setError("");
        router.push("/dashboard");
      } else {
        console.log(result);
      }
    } catch (err: any) {
      console.log("error", err.errors[0].longMessage);
      setPassword("");
      setCode("");
      toast({
        description: err.errors[0].longMessage,
      });
      // setError(err.errors[0].longMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex-1 py-36 md:px-16 w-full">
        <div className="flex flex-col h-full gap-3">
          <div className="flex flex-col gap-3">
            <h2 className="text-gray-400 md:text-4xl font-bold">
              Forgot Password?
            </h2>
            <p className="text-gray-500 md:text-sm">
              You will receive a mail to reset code
            </p>
            <form
              onSubmit={!successfulCreation ? create : reset}
              className="h-full"
            >
              <div className="flex flex-col justify-between gap-3 h-full">
                <Loader loading={loading}>
                  {!successfulCreation && (
                    <>
                      <Label
                        className="flex flex-col gap-2 text-white "
                        htmlFor={`email`}
                      >
                        <Input
                          id={`email`}
                          type="email"
                          className="bg-black"
                          onChange={(e) => {
                            setError("");
                            setEmail(e.target.value);
                          }}
                          placeholder={"Enter your email"}
                        />
                      </Label>
                      {error && (
                        <div className="text-red-500 text-sm">{error}</div>
                      )}
                      <div className="w-full flex flex-col gap-3 items-center">
                        <Button
                          type="submit"
                          className="w-full bg-white hover:bg-gray-200 text-black"
                        >
                          Send Password Reset Code
                        </Button>
                      </div>
                    </>
                  )}
                  {successfulCreation && (
                    <>
                      <Label
                        className="flex flex-col gap-2 text-white "
                        htmlFor={`text`}
                      >
                        <Input
                          onChange={(e) => {
                            setError("");
                            setCode(e.target.value);
                          }}
                          id={`text`}
                          className="bg-black"
                          placeholder={
                            "Enter the password reset code that was sent to your email"
                          }
                        />
                      </Label>
                      <Label
                        className="flex flex-col gap-2 text-white "
                        htmlFor={`password`}
                      >
                        <Input
                          onChange={(e) => {
                            setError("");
                            setPassword(e.target.value);
                          }}
                          min={8}
                          id={`password`}
                          type="password"
                          className="bg-black"
                          placeholder={"Enter your password"}
                        />
                      </Label>
                      {error && (
                        <div className="text-red-500 text-sm">{error}</div>
                      )}
                      <div className="w-full flex flex-col gap-3 items-center">
                        <Button
                          type="submit"
                          className="w-full bg-white hover:bg-gray-200 text-black"
                        >
                          Reset Password
                        </Button>
                      </div>
                    </>
                  )}
                </Loader>
                <p className="text-gray-500">
                  Know the password?{" "}
                  <Link
                    href="/auth/sign-in"
                    className="font-bold text-gray-400"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
    // <div

    //   style={{
    //     margin: "auto",
    //     maxWidth: "500px",
    //   }}
    // >
    //   <h1>Forgot Password?</h1>
    //   <form
    //     style={{
    //       display: "flex",
    //       flexDirection: "column",
    //       gap: "1em",
    //     }}
    //     onSubmit={!successfulCreation ? create : reset}
    //   >
    //     {!successfulCreation && (
    //       <>
    //         <label htmlFor="email">Provide your email address</label>
    //         <input
    //           type="email"
    //           placeholder="e.g john@doe.com"
    //           value={email}
    //           onChange={(e) => setEmail(e.target.value)}
    //         />

    //         <button>Send password reset code</button>
    //         {error && <p>{error}</p>}
    //       </>
    //     )}

    //     {successfulCreation && (
    //       <>
    //         <label htmlFor="password">Enter your new password</label>
    //         <input
    //           type="password"
    //           value={password}
    //           onChange={(e) => setPassword(e.target.value)}
    //         />

    //         <label htmlFor="password">
    //           Enter the password reset code that was sent to your email
    //         </label>
    //         <input
    //           type="text"
    //           value={code}
    //           onChange={(e) => setCode(e.target.value)}
    //         />

    //         <button>Reset</button>
    //         {error && <p>{error}</p>}
    //       </>
    //     )}

    //     {secondFactor && (
    //       <p>2FA is required, but this UI does not handle that</p>
    //     )}
    //   </form>
    // </div>
  );
};

export default ForgotPasswordPage;

"use client";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserType } from "@/constants/forms";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import React from "react";
import { FieldValues, UseFormRegister } from "react-hook-form";

type Props = {
  value: UserType;
  title: string;
  text?: string;
  register: UseFormRegister<FieldValues>;
  userType: UserType;
  setUserType: React.Dispatch<React.SetStateAction<UserType>>;
};

const UserTypeCard = ({
  register,
  setUserType,
  text,
  title,
  userType,
  value,
}: Props) => {
  return (
    <Label htmlFor={value} className="block">
      <Card
        className={cn(
          "cursor-pointer border-2 rounded-xl transition-all bg-black hover:bg-neutral-900",
          "p-4",
          userType === value && "border-teal-300"
        )}
      >
        <CardContent className="flex justify-between items-center p-0">
          <div className="flex items-center gap-4">
            <Card
              className={cn(
                "flex justify-center items-center p-3 border-2 rounded-lg bg-black",
                userType === value && "border-teal-300"
              )}
            >
              <User
                size={30}
                className={cn(
                  userType === value ? "text-teal-300" : "text-gray-400"
                )}
              />
            </Card>

            <div className="flex flex-col">
              <CardDescription className="text-teal-300 text-lg font-semibold tracking-wide mb-1">
                {value}
              </CardDescription>
              <CardDescription className="text-gray-300 text-sm">
                {title}
              </CardDescription>
              {text && (
                <CardDescription className="text-gray-500 text-xs">
                  {text}
                </CardDescription>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <div
              className={cn(
                "w-4 h-4 rounded-full border transition-all",
                userType === value
                  ? "bg-green-500 border-green-500"
                  : "bg-transparent border-gray-600"
              )}
            >
              <Input
                {...register("type", {
                  onChange: (event) =>
                    setUserType(event.target.value as UserType),
                })}
                value={value}
                id={value}
                className="hidden"
                type="radio"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Label>
  );
};

export default UserTypeCard;

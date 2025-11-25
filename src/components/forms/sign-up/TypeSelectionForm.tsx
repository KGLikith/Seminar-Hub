import React from "react";
import { FieldValues, UseFormRegister } from "react-hook-form";
import UserTypeCard from "./user-type-card";
import { UserRole } from "@/generated/enums";

type Props = {
  register: UseFormRegister<FieldValues>;
  userType: UserRole;
  setUserType: React.Dispatch<
    React.SetStateAction<UserRole>
  >;
};

const TypeSelectionForm = ({ register, setUserType, userType }: Props) => {
  return (
    <>
      <h2 className="text-gray-400 md:text-4xl font-bold">Create an account</h2>

      <p className="text-gray-500 md:text-sm">
        Select your user type to continue. Please select the appropriate type.
      </p>

      <UserTypeCard
        register={register}
        setUserType={setUserType}
        userType={userType}
        value={UserRole.teacher}
        title="To book the seminar halls"
      />

      <UserTypeCard
        register={register}
        setUserType={setUserType}
        userType={userType}
        value={UserRole.hod}
        title="To manage department bookings"
      />

      <UserTypeCard
        register={register}
        setUserType={setUserType}
        userType={userType}
        value={UserRole.tech_staff}
        title="To manage technical support"
      />

      <div className="mt-0">
        <p className="text-gray-400 mb-2 font-medium">Select Your Department</p>

        <select
          {...register("department")}
          className="
            w-full p-3 rounded-lg bg-black border border-neutral-700 
            text-gray-300 focus:border-teal-300 focus:outline-none
          "
          defaultValue="Computer Science"
        >
          <option value="" disabled className="bg-black text-gray-400">
            -- Choose Department --
          </option>
          <option value="Computer Science" className="bg-black">
            Computer Science
          </option>
          <option value="Electronics" className="bg-black">
            Electronics
          </option>
          <option value="Mechanical" className="bg-black">
            Mechanical
          </option>
        </select>
      </div>
    </>
  );
};

export default TypeSelectionForm;

import React from "react";
import { FieldValues, UseFormRegister } from "react-hook-form";
import UserTypeCard from "./user-type-card";
import { UserType } from "@/constants/forms";

type Props = {
  register: UseFormRegister<FieldValues>;
  userType: UserType;
  setUserType: React.Dispatch<
    React.SetStateAction<UserType>
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
        value="Teacher"
        title="To book the seminar halls"
      />
      <UserTypeCard
        register={register}
        setUserType={setUserType}
        userType={userType}
        value="HOD"
        title="To manage department bookings"
      />
      <UserTypeCard
        register={register}
        setUserType={setUserType}
        userType={userType}
        value="Tech Staff"
        title="To manage technical support"
      />
    </>
  );
};

export default TypeSelectionForm;

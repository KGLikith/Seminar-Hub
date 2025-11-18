import React from "react";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import FormGenerator from "../form-generator";
import { USER_REGISTRATION_FORM } from "@/constants/forms";

type Props = {
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors<FieldValues>;
  isSubmitted: boolean; 
  showError: boolean;
};

function AccountDetailsForm({ errors, register, isSubmitted, showError }: Props) {
  return (
    <>
      <h2 className="text-gray-400 md:text-4xl font-bold">Account details</h2>
      <p className="text-gray-500 md:text-sm">Enter your email and password</p>

      {USER_REGISTRATION_FORM.map((field) => (
        <FormGenerator
          key={field.id}
          {...field}
          errors={errors}
          register={register}
          name={field.name}
          isSubmitted={isSubmitted && showError} 
        />
      ))}
    </>
  );
}

export default AccountDetailsForm;

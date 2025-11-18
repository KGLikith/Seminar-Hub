import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorMessage } from "@hookform/error-message";
import React from "react";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  type: "text" | "email" | "password" | "number";
  inputType: "select" | "input" | "textarea";
  options?: { value: string; label: string; id: string }[];
  label?: string;
  placeholder: string;
  register: UseFormRegister<any>;
  name: string;
  errors: FieldErrors<FieldValues>;
  lines?: number;
  form?: string;
  defaultValue?: string;
  isSubmitted: boolean; // 👈 NEW
};

const FormGenerator = ({
  errors,
  inputType,
  name,
  placeholder,
  defaultValue,
  register,
  type,
  form,
  label,
  lines,
  options,
  isSubmitted,
}: Props) => {
  const showError = isSubmitted && errors[name]; 

  switch (inputType) {
    case "input":
    default:
      return (
        <Label
          className="flex flex-col gap-2 text-white"
          htmlFor={`input-${label}`}
        >
          {label && label}
          <Input
            id={`input-${label}`}
            className="bg-black"
            type={type}
            placeholder={placeholder}
            form={form}
            defaultValue={defaultValue}
            {...register(name)}
          />

          {showError && (
            <ErrorMessage
              errors={errors}
              name={name}
              render={({ message }) => (
                <p className="text-red-400 mt-1">{message}</p>
              )}
            />
          )}
        </Label>
      );

    case "select":
      return (
        <Label className="flex flex-col gap-2" htmlFor={`select-${label}`}>
          {label && label}
          <select
            form={form}
            id={`select-${label}`}
            {...register(name)}
            className="bg-black text-white border rounded-md p-2"
          >
            {options?.map((option) => (
              <option value={option.value} key={option.id}>
                {option.label}
              </option>
            ))}
          </select>

          {showError && (
            <ErrorMessage
              errors={errors}
              name={name}
              render={({ message }) => (
                <p className="text-red-400 mt-1">{message}</p>
              )}
            />
          )}
        </Label>
      );

    case "textarea":
      return (
        <Label className="flex flex-col gap-2" htmlFor={`textarea-${label}`}>
          {label && label}
          <Textarea
            form={form}
            id={`textarea-${label}`}
            placeholder={placeholder}
            rows={lines}
            defaultValue={defaultValue}
            {...register(name)}
          />

          {showError && (
            <ErrorMessage
              errors={errors}
              name={name}
              render={({ message }) => (
                <p className="text-red-400 mt-1">{message}</p>
              )}
            />
          )}
        </Label>
      );
  }
};

export default FormGenerator;

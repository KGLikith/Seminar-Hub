"use client"

import React from "react"
import { FieldValues, UseFormRegister } from "react-hook-form"
import UserTypeCard from "./user-type-card"
import { UserRole, DepartmentName } from "@/generated/enums"

type Props = {
  register: UseFormRegister<FieldValues>
  userType: UserRole
  setUserType: React.Dispatch<React.SetStateAction<UserRole>>
}

/* ---------- DEPARTMENT LABEL MAP ---------- */
const DEPARTMENT_LABELS: Record<DepartmentName, string> = {
  [DepartmentName.Computer_Science]: "Computer Science",
  [DepartmentName.Electrical_Engineering]: "Electrical Engineering",
  [DepartmentName.Mechanical_Engineering]: "Mechanical Engineering",
  [DepartmentName.Civil_Engineering]: "Civil Engineering",
  [DepartmentName.Chemistry]: "Chemistry",
  [DepartmentName.Physics]: "Physics",
  [DepartmentName.IEM]: "Industrial Engineering & Management",
}

const TypeSelectionForm = ({ register, setUserType, userType }: Props) => {
  return (
    <>
      <h2 className="text-gray-400 md:text-4xl font-bold">
        Create an account
      </h2>

      <p className="text-gray-500 md:text-sm">
        Select your user type to continue. Please select the appropriate type.
      </p>

      {/* ---------- USER TYPE SELECTION ---------- */}
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
        value={UserRole.teacher}
        title="To book the seminar halls"
      />

      <UserTypeCard
        register={register}
        setUserType={setUserType}
        userType={userType}
        value={UserRole.tech_staff}
        title="To provide technical support"
      />

      <div className="mt-2">
        <p className="text-gray-400 mb-2 font-medium">
          Select Your Department
        </p>

        <select
          {...register("department", { required: true })}
          className="
            w-full p-3 rounded-lg bg-black border border-neutral-700
            text-gray-300 focus:border-teal-300 focus:outline-none
          "
          defaultValue=""
        >
          <option value="" disabled className="bg-black text-gray-400">
            -- Choose Department --
          </option>

          {Object.values(DepartmentName)
            .map((dept) => (
              <option
                key={dept}
                value={dept}
                className="bg-black"
              >
                {DEPARTMENT_LABELS[dept as DepartmentName]}
              </option>
            ))}
        </select>
      </div>
    </>
  )
}

export default TypeSelectionForm

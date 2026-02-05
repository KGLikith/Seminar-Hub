'use client'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import FormGenerator from '../form-generator'
import { USER_LOGIN_FORM } from '@/constants/forms'


const LoginForm = () => {
  const {
    register,
    formState: { errors, touchedFields },
  } = useFormContext()
  return (
    <>
      <h2 className="text-gray-400 md:text-4xl font-bold">Login</h2>
      <p className="text-gray-500 md:text-sm">
        You will receive a one time password
      </p>
      {USER_LOGIN_FORM.map((field) => (
        <FormGenerator
          key={field.id}
          {...field}
          errors={errors}
          register={register}
          name={field.name}
          isSubmitted={false}
          touchedFields={touchedFields}
        />
      ))}
    </>
  )
}

export default LoginForm

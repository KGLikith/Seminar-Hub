'use client'
import { useAuthContextHook } from '@/context/use-auth-context'
import React, { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import TypeSelectionForm from './TypeSelectionForm'
import dynamic from 'next/dynamic'
import { Spinner } from '@/components/_components/spinner'
import { UserRole } from '@/generated/enums'

const DetailForm = dynamic(() => import('./account-detail-form'), {
  ssr: false,
  loading: () => <Spinner />,
})

const OTPForm = dynamic(() => import('./otp-form'), {
  ssr: false,
  loading: () => <Spinner />,
})

const RegistrationFormStep = () => {
  const {
    register,
    formState: { errors, isSubmitted, submitCount, touchedFields },
    setValue,
  } = useFormContext()
  const { currentStep } = useAuthContextHook()
  const [onOTP, setOnOTP] = useState<string>('')
  const [onUserType, setOnUserType] = useState<UserRole>(UserRole.teacher)

  useEffect(() => {
    setValue("otp", onOTP);
  }, [onOTP, setValue]);

  useEffect(() => {
    setValue("type", onUserType);
  })

  switch (currentStep) {
    case 1:
      return (
        <TypeSelectionForm
          register={register}
          userType={onUserType}
          setUserType={setOnUserType}
        />
      )
    case 2:
      return (
        <DetailForm
          isSubmitted={isSubmitted}
          errors={errors}
          register={register}
          showError={submitCount > 0}
          touchedFields={touchedFields}
        />
      )
    case 3:
      return (
        <OTPForm
          onOTP={onOTP}
          setOTP={setOnOTP}
        />
      )
  }

  return <div>RegistrationFormStep</div>
}

export default RegistrationFormStep

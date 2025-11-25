import ButtonHandler from '@/components/forms/sign-up/button-handlers'
import SignUpFormProvider from '@/components/forms/sign-up/form-provider'
import HighLightBar from '@/components/forms/sign-up/highlight-bar'
import RegistrationFormStep from '@/components/forms/sign-up/registration-step'

import React from 'react'

const SignUp = () => {
  return (
    <div className="flex-1 w-full md:px-16 py-2 min-h-0 overflow-hidden">
      <div className="flex flex-col gap-4 h-full min-h-0">

        <SignUpFormProvider>
          <div className="flex flex-col gap-4 min-h-0">
            <RegistrationFormStep />
            <ButtonHandler />
          </div>

          {/* Highlight bar sits at bottom, no overflow */}
          <HighLightBar />
        </SignUpFormProvider>

      </div>
    </div>
  );
};


export default SignUp

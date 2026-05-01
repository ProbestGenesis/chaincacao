"use client"

import Illu from "@/assets/loginIlllu.jpg"
import logo from "@/assets/smartKakaoLogo.png"
import { MultiStepSignupForm } from "@/components/multi-step-signup-form"
import Image from "next/image"

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <Image src={logo} alt="Logo" className="size-6" />
            Chaincacao
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <MultiStepSignupForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src={Illu}
          alt="Image d'inscription"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}

import React, { SetStateAction, useMemo, useState } from "react";
import {
  View,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import RegisterStepper from "./RegisterStepper";
import FirstStep from "./RegisterSteps/FirstStep";
import SecondStep from "./RegisterSteps/SecondStep";
import ThirdStep from "./RegisterSteps/ThirdStep";
import RegisterIllustration from "./RegisterIllustration";
import { assets } from "@/assets/images/assets";
import Stepper from "../ui/Stepper";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type RegisterFormProps = {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  confirm: string;

  setFullName: React.Dispatch<SetStateAction<string>>;
  setEmail: React.Dispatch<SetStateAction<string>>;
  setPhone: React.Dispatch<SetStateAction<string>>;
  setPassword: React.Dispatch<SetStateAction<string>>;
  setConfirm: React.Dispatch<SetStateAction<string>>;

  onSubmit?: () => void;
};

export default function RegisterPage({
  fullName,
  email,
  phone = "",
  password,
  confirm,
  setFullName,
  setEmail,
  setPhone,
  setPassword,
  setConfirm,
  onSubmit,
}: RegisterFormProps) {
  const [step, setStep] = useState<number>(0);
  const [errors, setErrors] = useState<Record<number, string> | null>(null);

  const handlePressNext = () => setStep((s) => s + 1);
  const handlePressBack = () => setStep((s) => Math.max(0, s - 1));

  const illustration = useMemo(() => {
    switch (step) {
      case 0:
        return assets.registerStepOne;
      case 1:
        return assets.registerStepTwo;
      case 2:
        return assets.registerStepThird;
    }
  }, [step]);

  const canSubmit = useMemo(() => {
    return (
      fullName.trim().length >= 3 &&
      email.trim().length >= 3 &&
      (phone.trim().length === 0 ||
        /^(\+261|0)(3[0-9]|20)\d{7}$/.test(phone.trim())) &&
      password.length >= 6 &&
      password === confirm
    );
  }, [fullName, email, phone, password, confirm]);

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-customwhite"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <View className="flex-1 justify-between mt-10">
        {/* Contenu scrollable */}
        <KeyboardAwareScrollView
          enableOnAndroid
          extraScrollHeight={20}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <RegisterIllustration source={illustration as ImageSourcePropType} />
          <Stepper steps={["a", "b", "c"]} step={step as 0 | 1 | 2} />

          <View className="flex-1 justify-center items-center px-5">
            {step === 0 && (
              <FirstStep
                fullName={fullName}
                setFullName={setFullName}
                errors={errors}
                setErrors={setErrors}
              />
            )}
            {step === 1 && (
              <SecondStep
                email={email}
                phone={phone}
                setEmail={setEmail}
                setPhone={setPhone}
                errors={errors}
                setErrors={setErrors}
              />
            )}
            {step === 2 && (
              <ThirdStep
                password={password}
                confirm={confirm}
                setPassword={setPassword}
                setConfirm={setConfirm}
                errors={errors}
                setErrors={setErrors}
              />
            )}
          </View>
        </KeyboardAwareScrollView>

        {/* Footer fixe mais dans le flux normal */}
        <View className="px-5 pb-6 bg-customwhite">
          <RegisterStepper
            step={step}
            disableNext={errors !== undefined && errors !== null}
            onPressBack={handlePressBack}
            onPressNext={handlePressNext}
            isFirstStep={step === 0}
            isLastStep={step === 2}
            canSubmit={canSubmit}
            onLastStep={
              onSubmit
                ? onSubmit
                : () => {
                    console.log(fullName, email, password);
                  }
            }
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

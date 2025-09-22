import React, { SetStateAction, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  ImageSourcePropType,
} from "react-native";
import RegisterStepper from "./RegisterStepper";
import FirstStep from "./RegisterSteps/FirstStep";
import SecondStep from "./RegisterSteps/SecondStep";
import ThirdStep from "./RegisterSteps/ThirdStep";
import RegisterIllustration from "./RegisterIllustration";
import { assets } from "@/assets/images/assets";

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

  return (
    <KeyboardAvoidingView
      className=" bg-customwhite flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 w-full px-5">
        {/* HEADER */}
        <Text className="text-3xl font-quicksand-semibold text-center mt-10">
          Creer un compte
        </Text>

        {/* ILLUSTRATION */}
        <RegisterIllustration source={illustration as ImageSourcePropType} />

        {/* STEP CONTENT */}
        <View className="flex-1 justify-center items-center">
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

        {/* STEPPER */}
        <View className="mb-6">
          <RegisterStepper
            step={step}
            disableNext={errors !== undefined && errors !== null}
            onPressBack={handlePressBack}
            onPressNext={handlePressNext}
            isFirstStep={step === 0}
            isLastStep={step === 2}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

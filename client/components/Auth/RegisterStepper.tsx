import { View, Pressable } from "react-native";
import React from "react";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react-native";
import { useToast } from "../ui/Toast";

type RegisterStepperProps = {
  step: number;
  onPressNext: () => void;
  onPressBack: () => void;
  isFirstStep?: boolean;
  disableNext: boolean;
  isLastStep?: boolean;
};
const RegisterStepper = ({
  step,
  onPressNext,
  onPressBack,
  isFirstStep,
  isLastStep,
  disableNext,
}: RegisterStepperProps) => {
  const toast = useToast();
  return (
    <View className="w-full flex-row items-center justify-between mb-10">
      <Pressable
        style={{ backgroundColor: isFirstStep ? "#d1d5db" : "#3b82f6" }}
        onPress={() => onPressBack()}
        disabled={isFirstStep}
        className={`px-4 py-2 rounded-full font-quicksand-semibold text-white flex flex-row justify-between items-center gap-3 `}
      >
        <ArrowBigLeft size={20} color={"white"} />
        Precedent
      </Pressable>

      <Pressable
        onPress={() => {
          if (!disableNext && !isLastStep) {
            onPressNext();
          }
          if (disableNext) {
            toast.showToast("Veuillez vérifier vos informations", "error");
          }
        }}
        style={{ backgroundColor: isLastStep ? "#d1d5db" : "#3b82f6" }}
        disabled={isLastStep}
        className={`px-4 py-2 rounded-full font-quicksand-semibold text-white flex flex-row justify-between items-center gap-3`}
      >
        Suivant <ArrowBigRight size={20} color={"white"} />
      </Pressable>
    </View>
  );
};

export default RegisterStepper;

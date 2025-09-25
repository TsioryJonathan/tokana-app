import { View, Pressable, Text } from "react-native";
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
  onLastStep: () => void;
  canSubmit: boolean;
};
const RegisterStepper = ({
  step,
  onPressNext,
  onPressBack,
  isFirstStep,
  isLastStep,
  disableNext,
  onLastStep,
  canSubmit,
}: RegisterStepperProps) => {
  const toast = useToast();
  return (
    <View className="w-full flex-row items-center justify-between ">
      <Pressable
        style={{ backgroundColor: isFirstStep ? "#d1d5db" : "#5FAE7C" }}
        onPress={() => onPressBack()}
        disabled={isFirstStep}
        className={`px-4 py-3 min-w-[150px] rounded-xl font-quicksand-semibold text-white flex flex-row justify-between items-center `}
      >
        <ArrowBigLeft size={20} color={"white"} />
        <Text className="font-quicksand-semibold text-xl text-white">
          Precedent
        </Text>
      </Pressable>

      {!isLastStep && (
        <Pressable
          onPress={() => {
            if (!disableNext && !isLastStep) {
              onPressNext();
            }
            if (disableNext) {
              toast.showToast("Veuillez vérifier vos informations", "error");
            }
          }}
          style={{ backgroundColor: isLastStep ? "#d1d5db" : "#5FAE7C" }}
          disabled={isLastStep}
          className={`px-4 py-3 min-w-[150px] rounded-xl  flex flex-row justify-between items-center`}
        >
          <Text className="font-quicksand-semibold text-xl text-white">
            Suivant
          </Text>
          <ArrowBigRight size={20} color={"white"} />
        </Pressable>
      )}

      {isLastStep && (
        <Pressable
          onPress={() => {
            if (canSubmit) {
              onLastStep();
            } else {
              toast.showToast(
                "Veuillez vérifier que toutes les informations sont correctes",
                "error"
              );
            }
          }}
          style={{ backgroundColor: canSubmit ? "#5FAE7C" : "#d1d5db" }}
          disabled={!canSubmit}
          className={`px-4 py-3 min-w-[150px] rounded-xl  flex flex-row justify-between items-center`}
        >
          <Text className="font-quicksand-semibold text-xl text-white">
            S&apos;inscrire
          </Text>
          <ArrowBigRight size={20} color={"white"} />
        </Pressable>
      )}
    </View>
  );
};

export default RegisterStepper;

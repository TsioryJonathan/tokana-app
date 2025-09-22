import { View, Text } from "react-native";
import React from "react";
import CustomInput from "@/components/ui/CustomInput";
import { Lock, Mail } from "lucide-react-native";

type ThirdStepProps = {
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
  confirm: string;
  setConfirm: React.Dispatch<React.SetStateAction<string>>;
  errors: Record<number, string> | null;
  setErrors: React.Dispatch<
    React.SetStateAction<Record<number, string> | null>
  >;
};
const ThirdStep = ({
  password,
  setPassword,
  confirm,
  setConfirm,
  errors,
  setErrors,
}: ThirdStepProps) => {
  return (
    <View className="w-full flex-1 mt-10 flex flex-col justify-start gap-3 ">
      <Text
        className="text-start text-slate-600 font-quicksand-semibold"
        style={{ fontSize: 16 }}
      >
        Indiquez votre nom complet pour commencer.
      </Text>

      <View className="w-full flex flex-col gap-3">
        <CustomInput
          icon={Lock}
          value={password}
          setValue={setPassword}
          placeholder="Votre mot de passe"
          secureTextEntry
        />

        <CustomInput
          icon={Lock}
          value={confirm}
          setValue={setConfirm}
          placeholder="Confirmez votre mot de passe"
          secureTextEntry
        />
      </View>
    </View>
  );
};

export default ThirdStep;

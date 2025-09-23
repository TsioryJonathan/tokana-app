import { View, Text } from "react-native";
import React, { useEffect } from "react";
import CustomInput from "@/components/ui/CustomInput";
import { User } from "lucide-react-native";
import { useToast } from "@/components/ui/Toast";
import Label from "@/components/ui/Label";
type FirstStepProps = {
  fullName: string;
  setFullName: React.Dispatch<React.SetStateAction<string>>;
  errors: Record<number, string> | null;
  setErrors: React.Dispatch<
    React.SetStateAction<Record<number, string> | null>
  >;
};

const FirstStep = ({ fullName, setFullName, setErrors }: FirstStepProps) => {
  const toast = useToast();
  const validate = (text: string) => {
    if (!text || text.trim().length < 3) {
      setErrors({ 1: "Le nom complet doit contenir au moins 3 caractères." });
      toast.showToast(
        "Le nom complet doit contenir au moins 3 caractères.",
        "error"
      );
    }
  };
  useEffect(() => {
    if (fullName && fullName.trim().length >= 3) {
      setErrors(null);
    } else if (!fullName && fullName.trim().length === 0) {
      setErrors({ 1: "Le nom complet doit contenir au moins 3 caractères." });
    }
  }, [fullName, setErrors]);
  return (
    <View className="w-full flex-1 mt-10 flex flex-col justify-start gap-3 ">
      <label
        className="text-start text-slate-600 font-quicksand-bold"
        style={{ fontSize: 24 }}
      >
        Nom complet{" "}
      </label>

      <CustomInput
        icon={User}
        value={fullName}
        setValue={setFullName}
        placeholder="Entrer votre nom complet"
        onBlur={() => {
          validate(fullName);
        }}
      />
    </View>
  );
};

export default FirstStep;

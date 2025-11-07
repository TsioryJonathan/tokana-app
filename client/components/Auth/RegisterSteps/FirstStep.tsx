import { View, Text, KeyboardAvoidingView } from "react-native";
import React, { useEffect } from "react";
import CustomInput from "../../ui/CustomInput";
import { User } from "lucide-react-native";
import { useToast } from "../../ui/Toast";
import Label from "../../ui/Label";
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
      setErrors({ 1: "Nom invalide" });
      toast.showToast("Nom invalide", "error");
    }
  };
  useEffect(() => {
    if (fullName && fullName.trim().length >= 3) {
      setErrors(null);
    } else if (!fullName && fullName.trim().length === 0) {
      setErrors({ 1: "Nom invalide" });
    }
  }, [fullName, setErrors]);
  return (
    <KeyboardAvoidingView className="w-full flex-1 mt-10 flex flex-col justify-start gap-3 ">
      <Text
        className="text-start text-slate-600 font-quicksand-bold"
        style={{ fontSize: 24 }}
      >
        Nom complet{" "}
      </Text>

      <CustomInput
        icon={User}
        value={fullName}
        setValue={setFullName}
        placeholder="Entrer votre nom complet"
        onBlur={() => {
          validate(fullName);
        }}
      />
    </KeyboardAvoidingView>
  );
};

export default FirstStep;

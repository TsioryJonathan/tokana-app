import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import CustomInput from "../../ui/CustomInput";
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
  const [strengthError, setStrengthError] = useState<string | null>(null);

  const [confirmError, setConfirmError] = useState<string | null>(null);

  useEffect(() => {
    const passwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

    const strengthPassword = (pwd: string) => {
      if (pwd && !passwdRegex.test(pwd)) {
        setStrengthError(
          "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial."
        );
      } else {
        setStrengthError(null);
      }
    };
    strengthPassword(password);
  }, [password, setPassword]);

  useEffect(() => {
    const confirmPassword = (pwd: string, confirm: string) => {
      if (confirm && confirm.length > 0 && pwd !== confirm) {
        setConfirmError("Les mots de passe ne correspondent pas.");
      } else {
        setConfirmError(null);
      }
    };
    confirmPassword(password, confirm);
  }, [confirm, password, setConfirm]);
  return (
    <View className="w-full flex-1 mt-10 flex flex-col justify-start gap-3 ">
      <Text
        className="text-start text-slate-600 font-quicksand-semibold"
        style={{ fontSize: 16 }}
      >
        Mot de passe{" "}
      </Text>

      <View className="w-full flex flex-col gap-3 ">
        <CustomInput
          icon={Lock}
          value={password}
          setValue={setPassword}
          placeholder="Votre mot de passe"
          secureTextEntry={true}
        />

        {strengthError && (
          <Text className="text-red-500 font-quicksand-regular text-start">
            {strengthError}
          </Text>
        )}

        <CustomInput
          icon={Lock}
          value={confirm}
          setValue={setConfirm}
          placeholder="Confirmez votre mot de passe"
          secureTextEntry
        />

        {confirmError && (
          <Text className="text-red-500 font-quicksand-regular text-start">
            {confirmError}
          </Text>
        )}
      </View>
    </View>
  );
};

export default ThirdStep;

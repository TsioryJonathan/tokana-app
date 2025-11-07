import { View, Text } from "react-native";
import React, { useEffect } from "react";
import CustomInput from "../../ui/CustomInput";
import { Mail, Phone } from "lucide-react-native";
import { useToast } from "../../ui/Toast";

type SecondStepProps = {
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  phone: string;
  setPhone: React.Dispatch<React.SetStateAction<string>>;
  errors: Record<number, string> | null;
  setErrors: React.Dispatch<
    React.SetStateAction<Record<number, string> | null>
  >;
};
const SecondStep = ({
  email,
  setEmail,
  phone,
  setPhone,
  errors,
  setErrors,
}: SecondStepProps) => {
  const toast = useToast();

  useEffect(() => {
    const emailTrim = email?.trim() ?? "";
    const phoneTrim = phone?.trim() ?? "";
    const emailValid = emailTrim.length === 0 || (emailTrim.length >= 3 && emailTrim.includes("@"));
    const phoneRegex = /^(\+261|0)(3[0-9]|20)\d{7}$/;
    const phoneValid = phoneTrim.length === 0 || phoneRegex.test(phoneTrim);

    const hasAtLeastOne = emailTrim.length > 0 || phoneTrim.length > 0;
    const nextErrors: Record<number, string> = {};

    if (!hasAtLeastOne) {
      nextErrors[1] = "Saisissez au moins un email ou un numéro.";
    }
    if (emailTrim.length > 0 && !emailValid) {
      nextErrors[1] = "Email invalide";
    }
    if (phoneTrim.length > 0 && !phoneValid) {
      nextErrors[2] = "Numéro de téléphone invalide";
    }

    if (Object.keys(nextErrors).length === 0) {
      setErrors(null);
    } else {
      setErrors(nextErrors);
    }
  }, [email, phone, setErrors]);
  return (
    <View className="w-full flex-1 mt-10 flex flex-col justify-start gap-3 ">
      <Text
        className="text-start text-slate-600 font-quicksand-semibold"
        style={{ fontSize: 16 }}
      >
        Entrer vos informations de contact
      </Text>

      <View className="w-full flex flex-col gap-3">
        <CustomInput
          icon={Mail}
          value={email}
          setValue={setEmail}
          placeholder="Votre email"
          keyboardType="email-address"
        />

        <CustomInput
          icon={Phone}
          value={phone}
          setValue={setPhone}
          placeholder="Votre numéro"
          keyboardType="phone-pad"
        />
      </View>
    </View>
  );
};

export default SecondStep;

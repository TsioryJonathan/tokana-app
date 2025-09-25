import { View, Text } from "react-native";
import React, { useEffect } from "react";
import CustomInput from "@/components/ui/CustomInput";
import { Mail, Phone } from "lucide-react-native";
import { useToast } from "@/components/ui/Toast";

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
  const validateEmail = (email: string) => {
    if (!email || email.trim().length < 3 || !email.includes("@")) {
      setErrors({ 1: "Email Invalide" });
      toast.showToast("L'email est invalide", "error");
    }
  };

  const validatePhone = (phone: string) => {
    /* Madagascar Phone number */
    const phoneRegex = /^(\+261|0)(3[0-9]|20)\d{7}$/;
    if (!phone || !phoneRegex.test(phone)) {
      setErrors({ 2: "Numéro de téléphone invalide" });
      toast.showToast("Le numéro de téléphone est invalide", "error");
    }
  };
  useEffect(() => {
    if (email && email.trim().length >= 3) {
      setErrors(null);
    } else if (!email && email.trim().length === 0) {
      setErrors({ 1: "Le nom complet doit contenir au moins 3 caractères." });
    }
  }, [email, setErrors]);

  useEffect(() => {
    if (phone) {
      const phoneRegex = /^(\+261|0)(3[0-9]|20)\d{7}$/;
      if (phoneRegex.test(phone)) {
        setErrors(null);
      }
    } else if (!phone && phone.trim().length === 0) {
      setErrors({ 2: "Le numéro de téléphone est requis." });
    }
  }, [phone, setErrors]);
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
          onBlur={() => {
            validateEmail(email);
          }}
        />

        <CustomInput
          icon={Phone}
          value={phone}
          setValue={setPhone}
          placeholder="Votre numéro"
          keyboardType="phone-pad"
          onBlur={() => {
            validatePhone(phone);
          }}
        />
      </View>
    </View>
  );
};

export default SecondStep;

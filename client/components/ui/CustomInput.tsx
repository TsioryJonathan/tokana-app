import React, { useState } from "react";
import { View, TextInput, Pressable } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { Eye, EyeOff } from "lucide-react-native";

type CustomInputProps = {
  icon?: LucideIcon;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  onBlur?: () => void;
  className?: string;
};

const CustomInput = ({
  icon,
  value,
  setValue,
  placeholder,
  onBlur,
  keyboardType = "default",
  className,
  secureTextEntry = false,
}: CustomInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View
      className={`flex-row items-center w-full rounded-lg px-3 py-2 bg-white font-quicksand ${className}`}
    >
      {/* Icône principale (ex: User, Mail, Phone) */}
      {icon &&
        React.createElement(icon, {
          size: 20,
          color: "#9ca3af",
          style: { marginRight: 8 },
        })}

      {/* Champ texte */}
      <TextInput
        className="flex-1 text-lg text-gray-800 font-quicksand"
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        keyboardType={keyboardType}
        underlineColorAndroid="transparent"
        accessibilityLabel={placeholder}
        onBlur={onBlur}
        secureTextEntry={secureTextEntry && !showPassword} // toggle entre caché / visible
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Icône toggle password */}
      {secureTextEntry && (
        <Pressable onPress={() => setShowPassword((prev) => !prev)}>
          {showPassword ? (
            <Eye size={20} color="#9ca3af" />
          ) : (
            <EyeOff size={20} color="#9ca3af" />
          )}
        </Pressable>
      )}
    </View>
  );
};

export default CustomInput;

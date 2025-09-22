import React from "react";
import { View, TextInput } from "react-native";
import type { LucideIcon } from "lucide-react-native";
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
}: CustomInputProps) => {
  return (
    <View
      className={` flex-row items-center  outline-none w-full rounded-lg px-3 py-3 bg-white ${className}`}
    >
      {icon &&
        React.createElement(icon, {
          size: 20,
          color: "#9ca3af",
          className: "mr-2",
        })}
      <TextInput
        className="flex-1 text-base text-gray-800 outline-none "
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        keyboardType={keyboardType}
        underlineColorAndroid="transparent"
        accessibilityLabel={placeholder}
        onBlur={onBlur}
      />
    </View>
  );
};

export default CustomInput;

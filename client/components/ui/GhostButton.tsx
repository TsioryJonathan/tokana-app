import React from "react";
import { Text, TouchableOpacity } from "react-native";

function GhostButton({
  children,
  onPress,
  accessibilityLabel,
  className,
  textClassName,
}: {
  children: React.ReactNode;
  onPress: () => void;
  accessibilityLabel?: string;
  textClassName?: string;
  className?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={
        "w-full items-center justify-center rounded-2xl py-4 border border-accent " +
        className
      }
    >
      <Text className={`text-secondary font-semibold ${textClassName}`}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

export default GhostButton;

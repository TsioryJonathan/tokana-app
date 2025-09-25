import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

function PrimaryButton({
  children,
  onPress,
  disabled,
  loading,
  testID,
  accessibilityLabel,
  textClassName,
  className,
}: {
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
  accessibilityLabel?: string;
  textClassName?: string;
  className?: string;
}) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      className={`w-full items-center justify-center rounded-xl py-4 ${
        isDisabled ? "bg-accent" : "bg-primary"
      } ${className}`}
      style={{ width: "100%" }}
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Text className={` font-semibold text-white ${textClassName}`}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default PrimaryButton;

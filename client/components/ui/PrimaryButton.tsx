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
      className={`w-full items-center justify-center rounded-2xl py-4 ${
        isDisabled ? "bg-accent" : "bg-primary"
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Text className={`text-black font-semibold ${textClassName}`}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default PrimaryButton;

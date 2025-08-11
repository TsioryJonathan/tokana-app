import { Text, TouchableOpacity } from "react-native";

function GhostButton({
  children,
  onPress,
  accessibilityLabel,
}: {
  children: React.ReactNode;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className="w-full items-center justify-center rounded-2xl py-4 border border-accent"
    >
      <Text className="text-secondary font-semibold">{children}</Text>
    </TouchableOpacity>
  );
}

export default GhostButton;

import { Text } from "react-native";

function Label({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <Text
      nativeID={htmlFor}
      className="text-base font-quicksand-bold text-secondary mb-2"
      accessibilityRole="text"
    >
      {children}
    </Text>
  );
}
export default Label;

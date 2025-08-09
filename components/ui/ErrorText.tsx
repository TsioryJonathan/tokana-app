import { Text } from "react-native";

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return <Text className="text-red-600 mt-1">{message}</Text>;
}

export default ErrorText

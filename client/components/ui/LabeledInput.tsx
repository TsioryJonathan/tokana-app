import { Text, TextInput, View } from "react-native";

const LabeledInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  multiline = false,
  right,
}: {
  label: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (t: string) => void;
  keyboardType?: any;
  multiline?: boolean;
  right?: React.ReactNode;
}) => (
  <View className="mb-3">
    <Text className="mb-1 text-[12px] text-slate-600">{label}</Text>
    <View className="flex-row items-center bg-white rounded-xl border border-slate-200 px-3">
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={onChangeText}
        className="flex-1 py-3 text-[14px] text-slate-900 outline-none"
        keyboardType={keyboardType}
        multiline={multiline}
      />
      {right}
    </View>
  </View>
);
export default LabeledInput;

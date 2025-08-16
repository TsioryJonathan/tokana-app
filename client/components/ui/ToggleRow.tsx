import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

const ToggleRow = ({
  icon,
  label,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) => (
  <TouchableOpacity
    onPress={() => onChange(!value)}
    activeOpacity={0.8}
    className={`flex-row items-center justify-between px-3 py-3 rounded-xl border ${
      value ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200"
    }`}
  >
    <View className="flex-row items-center">
      <View className="mr-2">{icon}</View>
      <Text className="text-[13px] font-quicksand-semibold text-slate-800">
        {label}
      </Text>
    </View>
    <Ionicons
      name={value ? "checkbox" : "square-outline"}
      size={20}
      color={value ? "#059669" : "#64748B"}
    />
  </TouchableOpacity>
);

export default ToggleRow;

import { Text, View } from "react-native";

const SectionHeader = ({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) => (
  <View className="flex-row items-center mb-2">
    <View className="mr-2">{icon}</View>
    <Text className="text-[13px] font-quicksand-bold text-slate-900">
      {title}
    </Text>
  </View>
);

export default SectionHeader;

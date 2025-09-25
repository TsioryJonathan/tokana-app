import { View, Text } from "react-native";
import React from "react";
import { Link, RelativePathString } from "expo-router";

export type NavigateToProps = {
  text: string;
  href: RelativePathString;
};
const NavigateTo = ({ text, href }: NavigateToProps) => {
  return (
    <View className="flex flex-row gap-2 w-full justify-center">
      <Text className="text-gray-500">{text.split("?")[0]} ?</Text>
      <Link href={href} className="text-blue-500">
        {text.split("?")[1].trim()}
      </Link>
    </View>
  );
};

export default NavigateTo;

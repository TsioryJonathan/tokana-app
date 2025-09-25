import { Image, ImageSourcePropType, View } from "react-native";
import React from "react";

const RegisterIllustration = ({ source }: { source: ImageSourcePropType }) => {
  return (
    <View className="w-full items-center justify-center    bg-green-200/30">
      <Image
        source={source}
        style={{ width: "100%", aspectRatio: 1, height: 350 }}
        resizeMode="contain"
      />
    </View>
  );
};

export default RegisterIllustration;

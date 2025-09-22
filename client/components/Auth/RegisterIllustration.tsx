import { Image, ImageSourcePropType, View } from "react-native";
import React from "react";

const RegisterIllustration = ({ source }: { source: ImageSourcePropType }) => {
  return (
    <View className="w-full flex items-center justify-center">
      <Image
        source={source}
        style={{ width: 200, height: 200 }}
        resizeMethod="resize"
      />
    </View>
  );
};

export default RegisterIllustration;

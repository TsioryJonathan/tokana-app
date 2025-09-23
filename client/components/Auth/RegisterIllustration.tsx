import { ImageBackground, ImageSourcePropType, View } from "react-native";
import React, { ReactNode } from "react";

const RegisterIllustration = ({
  source,
  children,
}: {
  source: ImageSourcePropType;
  children: ReactNode;
}) => {
  return (
    <View className="w-full items-center justify-center">
      <ImageBackground
        source={source}
        style={{ width: "100%", aspectRatio: 1, height: 400 }}
        resizeMode="contain"
        className="bg-green-200/30"
        imageStyle={{ borderRadius: 16 }}
      >
        {children}
      </ImageBackground>
    </View>
  );
};

export default RegisterIllustration;

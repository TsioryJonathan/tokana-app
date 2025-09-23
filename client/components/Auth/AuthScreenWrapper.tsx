import { View } from "react-native";
import React, { useMemo } from "react";
import { RelativePathString } from "expo-router";
import NavigateTo from "./NavigateTo";

type AuthScreenWrapperProps = {
  currentScreen: "register" | "login";
  children: React.ReactNode;
};

const AuthScreenWrapper = ({
  currentScreen,
  children,
}: AuthScreenWrapperProps) => {
  const navigateToProps = useMemo(
    () =>
      currentScreen === "login"
        ? {
            text: "Pas encore de compte ? Creer en un",
            href: "/(auth)/register" as RelativePathString,
          }
        : {
            text: "Vous avez déjà un compte ? Se connecter",
            href: "/(auth)/login" as RelativePathString,
          },
    [currentScreen]
  );

  return (
    <View
      style={{ marginBottom: 30 }}
      className="flex-1 w-screen h-full flex-col justify-between"
    >
      <View className="flex-1 w-full">{children}</View>
      <NavigateTo {...navigateToProps} />
    </View>
  );
};

export default AuthScreenWrapper;

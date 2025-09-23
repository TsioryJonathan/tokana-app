import React from "react";
import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useFonts } from "expo-font";

export default function AuthLayout() {
  const [loaded] = useFonts({
    quicksand: require("../../assets/fonts/QuicksandRegular.ttf"),
  });
  const router = useRouter();

  if (!loaded) return null;
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
        headerTransparent: true,
        headerShadowVisible: false,
        headerBackVisible: true,
        headerBackButtonDisplayMode: "default",
        headerLeft: () => (
          <Pressable
            className="ml-10"
            onPress={() => {
              router.replace("/");
            }}
          >
            <ArrowLeft />
          </Pressable>
        ),

        headerTitleStyle: {
          fontSize: 20,
          fontWeight: "900",
          fontFamily: "quicksand",
        },
      }}
    >
      <Stack.Screen name="login" options={{ title: "Login" }} />
      <Stack.Screen name="register" options={{ title: "Register" }} />
    </Stack>
  );
}

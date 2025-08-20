import React from "react";
import { View, Text, Image, StatusBar, Platform, ImageSourcePropType } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { assets } from "@/assets/images/assets";
import PrimaryButton from "@/components/ui/PrimaryButton";
import GhostButton from "@/components/ui/GhostButton";

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      className="flex-1 bg-customwhite"
      edges={["top","bottom"]}
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <StatusBar
        barStyle="dark-content"
        translucent={Platform.OS === 'android'}
        backgroundColor="transparent"
      />

      <View className="h-full flex flex-col justify-between items-center gap-5 px-10">
        <View className="w-full h-[40%] flex flex-1 items-center justify-center pt-24">
          <Image
            source={assets.deliveryGuyMockup as ImageSourcePropType}
            style={{
              width: 300,
              height: 300,
            }}
          />
        </View>
        <View className="mt-10 items-center h-[60%] justify-evenly">
          <View className="flex flex-col items-center justify-between mx-10">
            <Text className="text-3xl font-quicksand-bold text-secondary tracking-wide text-center">
              Bienvenue chez Tokana
            </Text>
            <Text className="mt-2 text-lg font-quicksand-semibold text-customblack">
              Livraison à vélo — rapide & assurée
            </Text>
            <Text className="mt-3 text-center text-accent font-quicksand-medium leading-6">
              Des coursiers locaux, des tarifs clairs. Suivez votre colis en
              temps réel et gagnez du temps au quotidien.
            </Text>
          </View>

          <View className="w-full flex flex-col items-center justify-around gap-5">
            <PrimaryButton
              onPress={() => {
                router.push("/(auth)/auth");
              }}
              textClassName="font-quicksand-bold"
              className="w-fit"
            >
              Se connecter
            </PrimaryButton>
            <GhostButton
              onPress={() => {
                router.push("/(auth)/auth?q=register");
              }}
              textClassName="font-quicksand-bold"
              className="w-fit"
            >
              S&apos;inscrire
            </GhostButton>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

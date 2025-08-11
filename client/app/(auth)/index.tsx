import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  Platform,
  ImageSourcePropType,
  ScrollView,
  SafeAreaViewBase,
} from "react-native";
import { useRouter } from "expo-router";
import { assets } from "@/assets/images/assets";
import PrimaryButton from "@/components/ui/PrimaryButton";
import GhostButton from "@/components/ui/GhostButton";

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar
        barStyle={Platform.OS === "ios" ? "dark-content" : "default"}
      />

      <View className="flex flex-col justify-between items-center mt-16 gap-5 px-10">
        <View className="w-full h-[40%] flex flex-1 items-center justify-center">
          <Image
            source={assets.deliveryGuy as ImageSourcePropType}
            style={{
              width: 300,
              height: 300,
            }}
          />
        </View>
        <View className="mt-10 items-center h-[60%] justify-evenly">
          <View className="flex flex-col items-center justify-between mx-10">
            <Text className="text-3xl font-quicksand-bold text-secondary tracking-wide">
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
                router.push("/(auth)/login");
              }}
              textClassName="font-quicksand-bold"
              className="w-fit"
            >
              Se connecter
            </PrimaryButton>
            <GhostButton
              onPress={() => {
                router.push("/(auth)/register");
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

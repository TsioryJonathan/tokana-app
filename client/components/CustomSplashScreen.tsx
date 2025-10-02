import React from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

export default function CustomSplashScreen() {
  return (
    <View style={styles.container}>
      <LottieView
        source={require("../assets/lotties/deliveryRiding.json")}
        autoPlay
        loop={true}
        style={{ width: 250, height: 250 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

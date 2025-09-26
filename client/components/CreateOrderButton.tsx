import { Pressable, StyleSheet } from "react-native";
import React from "react";
import { Plus } from "lucide-react-native";
import { useRouter } from "expo-router";

const CreateOrderButton = () => {
  const router = useRouter();
  return (
    <Pressable
      style={styles.button}
      onPress={() => {
        router.push("/(client)/orders/new");
      }}
    >
      <Plus size={30} color="white" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 90,
    right: 20,
    alignSelf: "center",
    width: 60,
    height: 60,
    borderRadius: 40,
    borderWidth: 0,
    borderColor: "white",
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 999,
  },
});

export default CreateOrderButton;

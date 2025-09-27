// components/CustomTabBar.tsx
import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { HomeIcon, BoxIcon, PlusCircle, User2Icon } from "lucide-react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

type CustomBottomTabBarProps = BottomTabBarProps & {
  whereToSlice: number;
};

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
  whereToSlice,
}: CustomBottomTabBarProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "white",
        borderRadius: 10,
        margin: 10,
        paddingVertical: 15,
        justifyContent: "space-around",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 5,
      }}
    >
      {state.routes.slice(0, whereToSlice).map((route, index) => {
        const isFocused = state.index === index;

        let Icon = HomeIcon;
        if (route.name === "orders/index") Icon = BoxIcon;
        if (route.name === "orders/new") Icon = PlusCircle;
        if (route.name.includes("profile")) Icon = User2Icon;
        if (route.name.includes("delivery")) Icon = BoxIcon;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name as never);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={{
              alignItems: "center",
              flex: 1,
            }}
          >
            <Icon size={30} color={isFocused ? "#059669" : "#94a3b8"} />
            {/* Si tu veux un label custom, décommente : */}
            {/* <Text style={{ color: isFocused ? "#059669" : "#94a3b8", fontSize: 12 }}>
              {options.title || route.name}
            </Text> */}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

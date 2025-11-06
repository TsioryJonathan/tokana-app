import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, CheckCircle2, XCircle } from 'lucide-react-native';

export function AvailabilityCards({ isStandard, isExpress }: { isStandard: boolean; isExpress: boolean }) {
  return (
    <View className="flex-row gap-3 flex-wrap">
      <View className="flex-1 min-w-[140px]">
        {isStandard ? (
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
            className="rounded-2xl p-4 border border-white/30"
          >
            <View className="flex-row items-center gap-2 mb-2">
              <View className="bg-white/30 rounded-full p-1.5">
                <CheckCircle2 size={18} color="#fff" strokeWidth={2.5} />
              </View>
              <Text className="text-white font-quicksand-bold text-base">Standard</Text>
            </View>
            <Text className="text-white/90 text-sm font-quicksand-medium">OUVERT</Text>
            <View className="flex-row items-center gap-1.5 mt-1">
              <Clock size={12} color="rgba(255, 255, 255, 0.8)" />
              <Text className="text-white/80 text-xs font-quicksand">04:00 - 23:00</Text>
            </View>
          </LinearGradient>
        ) : (
          <View className="bg-white/10 rounded-2xl p-4 border border-white/20">
            <View className="flex-row items-center gap-2 mb-2">
              <View className="bg-white/20 rounded-full p-1.5">
                <XCircle size={18} color="rgba(255, 255, 255, 0.7)" strokeWidth={2.5} />
              </View>
              <Text className="text-white/80 font-quicksand-bold text-base">Standard</Text>
            </View>
            <Text className="text-white/70 text-sm font-quicksand-medium">FERMÉ</Text>
            <View className="flex-row items-center gap-1.5 mt-1">
              <Clock size={12} color="rgba(255, 255, 255, 0.6)" />
              <Text className="text-white/60 text-xs font-quicksand">04:00 - 23:00</Text>
            </View>
          </View>
        )}
      </View>
      
      <View className="flex-1 min-w-[140px]">
        {isExpress ? (
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)']}
            className="rounded-2xl p-4 border border-white/30"
          >
            <View className="flex-row items-center gap-2 mb-2">
              <View className="bg-white/30 rounded-full p-1.5">
                <CheckCircle2 size={18} color="#fff" strokeWidth={2.5} />
              </View>
              <Text className="text-white font-quicksand-bold text-base">Express</Text>
            </View>
            <Text className="text-white/90 text-sm font-quicksand-medium">OUVERT</Text>
            <View className="flex-row items-center gap-1.5 mt-1">
              <Clock size={12} color="rgba(255, 255, 255, 0.8)" />
              <Text className="text-white/80 text-xs font-quicksand">06:00 - 15:00</Text>
            </View>
          </LinearGradient>
        ) : (
          <View className="bg-white/10 rounded-2xl p-4 border border-white/20">
            <View className="flex-row items-center gap-2 mb-2">
              <View className="bg-white/20 rounded-full p-1.5">
                <XCircle size={18} color="rgba(255, 255, 255, 0.7)" strokeWidth={2.5} />
              </View>
              <Text className="text-white/80 font-quicksand-bold text-base">Express</Text>
            </View>
            <Text className="text-white/70 text-sm font-quicksand-medium">FERMÉ</Text>
            <View className="flex-row items-center gap-1.5 mt-1">
              <Clock size={12} color="rgba(255, 255, 255, 0.6)" />
              <Text className="text-white/60 text-xs font-quicksand">06:00 - 15:00</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

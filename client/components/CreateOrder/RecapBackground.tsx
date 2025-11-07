import React from 'react';
import { Image, Dimensions, ImageSourcePropType, ColorValue, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

type Props = {
  source: ImageSourcePropType;
  height?: number;
  opacity?: number;
  gradientHeight?: number; // height of the bottom fade
  gradientColors?: readonly [ColorValue, ColorValue, ...ColorValue[]]; // custom colors if needed
};

export const HeaderBackground = ({ source, height = 300, opacity = 0.70, gradientHeight = 110, gradientColors }: Props) => {
  const defaultColors = ['rgba(248,250,252,.0)', 'rgba(248,250,252,1)'] as const;
  return (
    <>
      <View pointerEvents="none" style={{ position: 'absolute', top: -10, left: -10, width: screenWidth + 20, height }}>
        <Image
          source={source}
          style={{
            width: '100%',
            height: '100%',
            opacity,
            resizeMode: 'contain',
          }}
        />
      </View>
      {/* Bottom fade to blend into page background (slate-50) */}
      <LinearGradient
        pointerEvents="none"
        colors={gradientColors ?? defaultColors}
        locations={[0, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: 'absolute',
          left: -10,
          top: height - gradientHeight - 10,
          width: screenWidth + 20,
          height: gradientHeight,
        }}
      />
    </>
  );
};

// Backward compatibility export with the previous name
export const RecapBackground = () => (
  <HeaderBackground source={require('../../assets/images/recap-bg.png')} height={300} opacity={0.70} />
);

export default HeaderBackground;
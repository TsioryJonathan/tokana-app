import React, { useEffect, useRef } from 'react';
import { Animated, TextStyle } from 'react-native';

export function AnimatedMetric({
  value,
  format = (n: number) => String(n),
  textClassName,
  style,
}: {
  value: number;
  format?: (n: number) => string;
  textClassName?: string;
  style?: TextStyle;
}) {
  const fade = useRef(new Animated.Value(1)).current;
  const translate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fade.setValue(0.3);
    translate.setValue(6);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(translate, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [value]);

  return (
    <Animated.Text
      className={textClassName}
      style={[{ opacity: fade, transform: [{ translateY: translate }] }, style]}
    >
      {format(value)}
    </Animated.Text>
  );
}

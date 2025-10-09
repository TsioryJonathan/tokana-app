import React from 'react';
import { View } from 'react-native';

// Very lightweight SVG-like sparkline using a simple View polyline approximation.
// For simplicity and zero deps, we draw with absolute-positioned bars.
export function Sparkline({ data, height = 36, color = '#059669', accessibilityLabel }: { data: number[]; height?: number; color?: string; accessibilityLabel?: string }) {
  const max = Math.max(1, ...data);
  const n = data.length || 0;
  const gap = 4;
  const barW = 6;
  const width = n * (barW + gap);
  return (
    <View style={{ height, width }} className="flex-row items-end" accessible accessibilityLabel={accessibilityLabel}>
      {data.map((v, i) => {
        const h = Math.max(2, Math.round((v / max) * height));
        return (
          <View key={i} style={{ height: h, width: barW, marginRight: gap, backgroundColor: color, borderRadius: 2 }} />
        );
      })}
    </View>
  );
}

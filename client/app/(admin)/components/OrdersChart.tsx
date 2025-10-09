import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import Svg, { Polyline, Line as SvgLine, Text as SvgText } from 'react-native-svg';

export function OrdersChart({ data, accessibilityLabel = 'Graphique des commandes sur 7 jours' }: { data: number[]; accessibilityLabel?: string }) {
  const points = React.useMemo(() => {
    const now = new Date();
    const days = (data && data.length) ? data.length : 7;
    const start = new Date(now);
    start.setDate(now.getDate() - (days - 1));
    const arr = new Array(days).fill(0).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const label = `${d.getDate()}/${d.getMonth() + 1}`;
      return { x: label, y: data[i] ?? 0, _date: d };
    });
    return arr;
  }, [data]);

  // Simple SVG line chart rendering (responsive)
  const { width: winW } = useWindowDimensions();
  const width = Math.max(220, Math.min(winW - 32, 420));
  const height = 140;
  const padLeft = 28;
  const padRight = 8;
  const padTop = 8;
  const padBottom = 22;
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;
  const maxY = Math.max(1, ...points.map(p => p.y));
  const stepX = points.length > 1 ? innerW / (points.length - 1) : 0;
  const polyPoints = points.map((p, i) => {
    const x = padLeft + i * stepX;
    const y = padTop + (innerH - (p.y / maxY) * innerH);
    return `${x},${y}`;
  }).join(' ');

  return (
    <View accessible accessibilityLabel={accessibilityLabel} className="mt-1" style={{ width, height }}>
      <Svg width={width} height={height}>
        {/* Axes */}
        <SvgLine x1={padLeft} y1={padTop} x2={padLeft} y2={padTop + innerH} stroke="#cbd5e1" strokeWidth={1} />
        <SvgLine x1={padLeft} y1={padTop + innerH} x2={padLeft + innerW} y2={padTop + innerH} stroke="#cbd5e1" strokeWidth={1} />

        {/* Y ticks (0, max) */}
        <SvgText x={padLeft - 4} y={padTop + innerH} fill="#64748b" fontSize="10" textAnchor="end">0</SvgText>
        <SvgText x={padLeft - 4} y={padTop + 10} fill="#64748b" fontSize="10" textAnchor="end">{maxY}</SvgText>

        {/* X labels (first/last) */}
        {points.length > 0 && (
          <>
            <SvgText x={padLeft} y={padTop + innerH + 14} fill="#64748b" fontSize="10" textAnchor="start">{points[0].x}</SvgText>
            <SvgText x={padLeft + innerW} y={padTop + innerH + 14} fill="#64748b" fontSize="10" textAnchor="end">{points[points.length - 1].x}</SvgText>
          </>
        )}

        {/* Polyline */}
        <Polyline points={polyPoints} fill="none" stroke="#059669" strokeWidth={2} />
      </Svg>
    </View>
  );
}

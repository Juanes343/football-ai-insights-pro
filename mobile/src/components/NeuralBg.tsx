import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Defs, Pattern, Circle, Rect, Line } from 'react-native-svg';
import { theme } from '@/lib/theme';

/**
 * Fondo de red neuronal (nodos + sinapsis tenues) sobre base oscura SÓLIDA.
 * La base es opaca, así que nunca puede verse blanco aunque el SVG falle.
 */
export function NeuralBg() {
  const { width, height } = useWindowDimensions();
  const c = theme.colors.neural;
  const lines: [number, number, number, number][] = [
    [0.06, 0.08, 0.32, 0.18],
    [0.32, 0.18, 0.6, 0.1],
    [0.6, 0.1, 0.93, 0.22],
    [0.12, 0.42, 0.45, 0.52],
    [0.45, 0.52, 0.82, 0.44],
    [0.1, 0.78, 0.42, 0.68],
    [0.55, 0.84, 0.9, 0.76],
  ];
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.bg }]}>
      <Svg width={width} height={height}>
        <Defs>
          <Pattern id="psai-dots" width={32} height={32} patternUnits="userSpaceOnUse">
            <Circle cx={2.5} cy={2.5} r={1.1} fill={c} opacity={0.10} />
          </Pattern>
        </Defs>
        <Rect width={width} height={height} fill="url(#psai-dots)" />
        {lines.map(([x1, y1, x2, y2], i) => (
          <Line key={i} x1={x1 * width} y1={y1 * height} x2={x2 * width} y2={y2 * height} stroke={c} strokeWidth={1} opacity={0.06} />
        ))}
        {lines.map(([x1, y1], i) => (
          <Circle key={`n${i}`} cx={x1 * width} cy={y1 * height} r={2.2} fill={c} opacity={0.16} />
        ))}
      </Svg>
    </View>
  );
}

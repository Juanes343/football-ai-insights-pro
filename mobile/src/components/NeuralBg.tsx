import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Defs, Pattern, Circle, Rect, Line, RadialGradient, Stop } from 'react-native-svg';
import { theme } from '@/lib/theme';

/**
 * Fondo "red neuronal": cuadrícula de puntos + líneas tenues + glow superior,
 * en azul cian (estilo del logo). Decorativo, no intercepta toques.
 */
export function NeuralBg() {
  const { width, height } = useWindowDimensions();
  const c = theme.colors.primary;

  // Algunas líneas tipo conexiones neuronales (coordenadas relativas al tamaño)
  const lines: [number, number, number, number][] = [
    [0.05, 0.10, 0.35, 0.22],
    [0.35, 0.22, 0.62, 0.12],
    [0.62, 0.12, 0.92, 0.26],
    [0.15, 0.45, 0.48, 0.55],
    [0.48, 0.55, 0.80, 0.47],
    [0.10, 0.80, 0.40, 0.70],
    [0.55, 0.85, 0.88, 0.78],
  ];

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={width} height={height}>
        <Defs>
          <Pattern id="dots" width={30} height={30} patternUnits="userSpaceOnUse">
            <Circle cx={3} cy={3} r={1.3} fill={c} opacity={0.12} />
          </Pattern>
          <RadialGradient id="glow" cx="50%" cy="0%" r="80%">
            <Stop offset="0%" stopColor={c} stopOpacity={0.16} />
            <Stop offset="55%" stopColor={c} stopOpacity={0.04} />
            <Stop offset="100%" stopColor={theme.colors.bg} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        <Rect width={width} height={height} fill="url(#dots)" />
        <Rect width={width} height={height} fill="url(#glow)" />

        {lines.map(([x1, y1, x2, y2], i) => (
          <Line
            key={i}
            x1={x1 * width}
            y1={y1 * height}
            x2={x2 * width}
            y2={y2 * height}
            stroke={c}
            strokeWidth={1}
            opacity={0.07}
          />
        ))}
      </Svg>
    </View>
  );
}

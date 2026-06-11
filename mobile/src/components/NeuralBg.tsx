import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Defs, Pattern, Circle, Rect, Line, RadialGradient, Stop } from 'react-native-svg';
import { theme } from '@/lib/theme';

/**
 * Fondo de red neuronal estilo "centro de datos": degradado azul (centro
 * iluminado, bordes oscuros) + nodos y sinapsis cian + glow.
 * Todo es OPACO (degradado de fondo cubre la pantalla), así que nunca se ve blanco.
 */
export function NeuralBg() {
  const { width, height } = useWindowDimensions();
  const c = theme.colors.neural; // #00E5FF
  const lines: [number, number, number, number][] = [
    [0.06, 0.08, 0.32, 0.18],
    [0.32, 0.18, 0.6, 0.1],
    [0.6, 0.1, 0.93, 0.22],
    [0.1, 0.36, 0.4, 0.46],
    [0.4, 0.46, 0.78, 0.38],
    [0.78, 0.38, 0.95, 0.5],
    [0.08, 0.7, 0.4, 0.62],
    [0.4, 0.62, 0.7, 0.72],
    [0.55, 0.88, 0.9, 0.8],
  ];
  const nodes = Array.from(new Set(lines.flatMap(([x1, y1, x2, y2]) => [`${x1},${y1}`, `${x2},${y2}`])));

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.bg }]}>
      <Svg width={width} height={height}>
        <Defs>
          {/* Degradado de fondo: navy iluminado al centro, oscuro a los bordes */}
          <RadialGradient id="psai-bg" cx="50%" cy="32%" r="85%">
            <Stop offset="0%" stopColor="#143b73" stopOpacity={1} />
            <Stop offset="45%" stopColor="#0d2a55" stopOpacity={1} />
            <Stop offset="100%" stopColor="#061230" stopOpacity={1} />
          </RadialGradient>
          {/* Glow cian sutil en el centro */}
          <RadialGradient id="psai-glow" cx="50%" cy="26%" r="65%">
            <Stop offset="0%" stopColor={c} stopOpacity={0.14} />
            <Stop offset="55%" stopColor={c} stopOpacity={0.04} />
            <Stop offset="100%" stopColor={c} stopOpacity={0} />
          </RadialGradient>
          <Pattern id="psai-dots" width={34} height={34} patternUnits="userSpaceOnUse">
            <Circle cx={2.5} cy={2.5} r={1.1} fill={c} opacity={0.12} />
          </Pattern>
        </Defs>

        <Rect width={width} height={height} fill="url(#psai-bg)" />
        <Rect width={width} height={height} fill="url(#psai-dots)" />
        <Rect width={width} height={height} fill="url(#psai-glow)" />

        {lines.map(([x1, y1, x2, y2], i) => (
          <Line key={i} x1={x1 * width} y1={y1 * height} x2={x2 * width} y2={y2 * height} stroke={c} strokeWidth={1} opacity={0.09} />
        ))}
        {nodes.map((n, i) => {
          const [x, y] = n.split(',').map(Number);
          return <Circle key={`n${i}`} cx={x * width} cy={y * height} r={2.6} fill={c} opacity={0.22} />;
        })}
      </Svg>
    </View>
  );
}

import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Circle, Rect, Line, RadialGradient, Stop, Defs } from 'react-native-svg';
import { theme } from '@/lib/theme';

/** RNG determinista para generar siempre la misma red. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// Nodos (coordenadas normalizadas) + conexiones por cercanía → malla neuronal.
const NODES: [number, number][] = (() => {
  const rnd = seeded(11);
  return Array.from({ length: 52 }, () => [rnd(), rnd()] as [number, number]);
})();
const EDGES: [number, number][] = (() => {
  const e: [number, number][] = [];
  for (let i = 0; i < NODES.length; i++) {
    for (let j = i + 1; j < NODES.length; j++) {
      const dx = NODES[i][0] - NODES[j][0];
      const dy = NODES[i][1] - NODES[j][1];
      if (Math.hypot(dx, dy) < 0.17) e.push([i, j]);
    }
  }
  return e;
})();

/**
 * Fondo de red neuronal estilo "cerebro digital": malla densa de nodos +
 * sinapsis cian brillantes sobre degradado azul. Base OPACA (nunca blanco).
 */
export function NeuralBg() {
  const { width: w, height: h } = useWindowDimensions();
  const c = theme.colors.neural; // #00E5FF
  const X = (v: number) => v * w;
  const Y = (v: number) => v * h;

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.bg }]}>
      <Svg width={w} height={h}>
        <Defs>
          <RadialGradient id="psai-bg" cx="50%" cy="34%" r="90%">
            <Stop offset="0%" stopColor="#173f78" stopOpacity={1} />
            <Stop offset="45%" stopColor="#0d2a55" stopOpacity={1} />
            <Stop offset="100%" stopColor="#06122e" stopOpacity={1} />
          </RadialGradient>
          <RadialGradient id="psai-glow" cx="50%" cy="30%" r="60%">
            <Stop offset="0%" stopColor={c} stopOpacity={0.2} />
            <Stop offset="60%" stopColor={c} stopOpacity={0.05} />
            <Stop offset="100%" stopColor={c} stopOpacity={0} />
          </RadialGradient>
        </Defs>

        <Rect width={w} height={h} fill="url(#psai-bg)" />

        {/* Sinapsis (conexiones) */}
        {EDGES.map(([a, b], i) => (
          <Line
            key={`e${i}`}
            x1={X(NODES[a][0])}
            y1={Y(NODES[a][1])}
            x2={X(NODES[b][0])}
            y2={Y(NODES[b][1])}
            stroke={c}
            strokeWidth={1}
            opacity={0.18}
          />
        ))}

        {/* Glow central */}
        <Rect width={w} height={h} fill="url(#psai-glow)" />

        {/* Halos de los nodos */}
        {NODES.map(([nx, ny], i) => {
          const hub = i % 4 === 0;
          return (
            <Circle key={`halo${i}`} cx={X(nx)} cy={Y(ny)} r={hub ? 7 : 3.5} fill={c} opacity={hub ? 0.16 : 0.08} />
          );
        })}
        {NODES.map(([nx, ny], i) => {
          const hub = i % 4 === 0;
          return <Circle key={`dot${i}`} cx={X(nx)} cy={Y(ny)} r={hub ? 2.6 : 1.6} fill={c} opacity={hub ? 0.75 : 0.45} />;
        })}
      </Svg>
    </View>
  );
}

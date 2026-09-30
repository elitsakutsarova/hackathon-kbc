import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { useApp } from '@/lib/store';
import { useReducedMotion } from '@/lib/use-reduced-motion';

const PIECE_COUNT = 22;
const PIECE_COLOURS = ['#62BCEB', '#FFD66B', '#0070C0', '#FFB89B', '#BFE8B4', '#6158CC'];

// Pieces fly out in a circle: each one gets its own angle (360° ÷ piece count).
function Burst({ x, y }: { x: number; y: number }) {
  const [progress] = useState(() => new Animated.Value(0));
  const [fade] = useState(() => new Animated.Value(1));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(progress, { toValue: 1, duration: 900, easing: Easing.bezier(0.2, 0.7, 0.3, 1), useNativeDriver: true }),
      Animated.timing(fade, { toValue: 0, duration: 900, easing: Easing.in(Easing.ease), useNativeDriver: true }),
    ]).start();
  }, [progress, fade]);

  return (
    <>
      {Array.from({ length: PIECE_COUNT }, (unused, pieceNumber) => {
        const angle = pieceNumber * (2 * Math.PI / PIECE_COUNT);
        const distance = 70 + (pieceNumber % 3) * 30;
        return (
          <Animated.View
            key={pieceNumber}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: 9,
              height: 13,
              borderRadius: 2,
              backgroundColor: PIECE_COLOURS[pieceNumber % PIECE_COLOURS.length],
              opacity: fade,
              transform: [
                { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * distance] }) },
                { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * distance] }) },
                { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', pieceNumber * 40 + 'deg'] }) },
              ],
            }}
          />
        );
      })}
    </>
  );
}

export function Confetti() {
  const { confettiBursts } = useApp();
  const isReducedMotion = useReducedMotion();
  if (isReducedMotion || confettiBursts.length === 0) return null;
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex: 90 }]}>
      {confettiBursts.map((burst) => <Burst key={burst.id} x={burst.x} y={burst.y} />)}
    </View>
  );
}

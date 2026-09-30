import { useEffect, useState } from 'react';
import { Animated, Easing, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '@/lib/store';

import { T } from './ui';

const VISIBLE_MS = 3200;

// Messages after an action ("€150 moved to…"), sliding in from the top.
export function Toast() {
  const { toast } = useApp();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [shown] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!toast) return;
    Animated.timing(shown, { toValue: 1, duration: 260, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
    const timer = setTimeout(() => {
      Animated.timing(shown, { toValue: 0, duration: 260, easing: Easing.in(Easing.ease), useNativeDriver: true }).start();
    }, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [toast, shown]);

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      style={{
        position: 'absolute',
        zIndex: 80,
        top: 14 + insets.top,
        alignSelf: 'center',
        width: Math.min(408, width - 32),
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 18,
        backgroundColor: '#0B2A4A',
        boxShadow: '0px 12px 30px rgba(11, 42, 74, 0.3)',
        transform: [{ translateY: shown.interpolate({ inputRange: [0, 1], outputRange: [-(160 + insets.top), 0] }) }],
      }}
    >
      <T weight={600} color="#FFFFFF">{toast?.message}</T>
    </Animated.View>
  );
}

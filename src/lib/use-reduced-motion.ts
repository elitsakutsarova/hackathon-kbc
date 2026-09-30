import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** True when the user asked the system for less motion. */
export function useReducedMotion() {
  const [isReduced, setIsReduced] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setIsReduced).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setIsReduced);
    return () => subscription.remove();
  }, []);
  return isReduced;
}

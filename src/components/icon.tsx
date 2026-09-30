import Svg, { Path } from 'react-native-svg';

import { ICON_PATHS, type IconName } from '@/lib/icons';

export function Icon({ name, size, strokeWidth = 1.9, color }: { name: IconName; size: number; strokeWidth?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" accessible={false}>
      <Path d={ICON_PATHS[name]} />
    </Svg>
  );
}

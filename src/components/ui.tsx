import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, View, type GestureResponderEvent, type StyleProp, type TextProps, type TextStyle, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import type { Point } from '@/lib/actions';
import { useActions } from '@/lib/actions';
import { getTipFeed, TIP_KINDS, TODAY_MONTH_INDEX, formatMonth, type RichText, type Tip } from '@/lib/dreams';
import type { IconName } from '@/lib/icons';
import { useApp } from '@/lib/store';
import { fixed, font, makeStyles, PASTEL_BACKGROUNDS, radius, useTheme, type Weight } from '@/lib/theme';

import { Icon } from './icon';

export const pointOf = (event: GestureResponderEvent): Point => ({ x: event.nativeEvent.pageX, y: event.nativeEvent.pageY });

// ---------- Text ----------
type TProps = TextProps & { size?: number; weight?: Weight; color?: string; lh?: number; style?: StyleProp<TextStyle> };

/** Text in Poppins. `size` is in rem, like the CSS. */
export function T({ size = 1, weight = 400, color, lh = 1.5, style, children, ...rest }: TProps) {
  const { c, rem } = useTheme();
  return (
    <Text style={[font(weight), { fontSize: rem(size), lineHeight: rem(size) * lh, color: color ?? c.ink }, style]} {...rest}>
      {children}
    </Text>
  );
}

export function PageTitle({ children, color }: { children: ReactNode; color?: string }) {
  return <T size={1.6} weight={700} lh={1.2} color={color} accessibilityRole="header" style={{ letterSpacing: -0.3 }}>{children}</T>;
}

export function SectionTitle({ children, color }: { children: ReactNode; color?: string }) {
  return <T size={1.15} weight={700} color={color} accessibilityRole="header">{children}</T>;
}

export function Rich({ parts, color, size = 1 }: { parts: RichText; color?: string; size?: number }) {
  return (
    <T size={size} color={color}>
      {parts.map((part, index) => (typeof part === 'string' ? part : <T key={index} size={size} weight={700} color={color}>{part.bold}</T>))}
    </T>
  );
}

// ---------- Layout ----------
/** A scrolling screen: 20px sides, room for the floating tab bar, back to the top on every visit. */
export function Screen({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  useFocusEffect(useCallback(() => scrollRef.current?.scrollTo({ y: 0, animated: false }), []));
  return (
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ width: '100%', maxWidth: 440, alignSelf: 'center', paddingHorizontal: 20, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 132, gap: 22 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

export function Stack({ gap = 12, style, children }: { gap?: number; style?: StyleProp<ViewStyle>; children: ReactNode }) {
  return <View style={[{ gap }, style]}>{children}</View>;
}

export function Row({ gap = 12, style, children }: { gap?: number; style?: StyleProp<ViewStyle>; children: ReactNode }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>;
}

export function Spread({ style, children }: { style?: StyleProp<ViewStyle>; children: ReactNode }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, style]}>{children}</View>;
}

export function Card({ style, children, onPress, accessibilityLabel }: { style?: StyleProp<ViewStyle>; children: ReactNode; onPress?: () => void; accessibilityLabel?: string }) {
  const s = useStyles();
  if (onPress) {
    return (
      <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} style={({ pressed }) => [s.card, style, pressed && { opacity: 0.85 }]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[s.card, style]}>{children}</View>;
}

// ---------- Buttons ----------
type RoundVariant = 'default' | 'soft' | 'dark' | 'white';

export function RoundButton({ icon, iconSize = 22, strokeWidth = 2, variant = 'default', size = 48, label, onPress, disabled, showDot, style }: {
  icon: IconName; iconSize?: number; strokeWidth?: number; variant?: RoundVariant; size?: number; label: string;
  onPress?: () => void; disabled?: boolean; showDot?: boolean; style?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  const look = {
    default: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, color: c.ink },
    soft: { backgroundColor: fixed.skySoft, borderWidth: 0, borderColor: 'transparent', color: fixed.cardInk },
    dark: { backgroundColor: c.strongFill, borderWidth: 0, borderColor: 'transparent', color: c.strongFillInk },
    white: { backgroundColor: '#FFFFFF', borderWidth: 0, borderColor: 'transparent', color: fixed.cardInk },
  }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => [
        { width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: look.backgroundColor, borderWidth: look.borderWidth, borderColor: look.borderColor },
        disabled && { opacity: 0.35 },
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      <Icon name={icon} size={iconSize} strokeWidth={strokeWidth} color={look.color} />
      {showDot && <View style={{ position: 'absolute', top: 11, right: 12, width: 9, height: 9, borderRadius: 5, backgroundColor: fixed.badge, borderWidth: 2, borderColor: fixed.skySoft }} />}
    </Pressable>
  );
}

type ButtonVariant = 'dark' | 'outline' | 'primary';

export function Button({ label, onPress, variant = 'dark', icon, block, small, onPastel, style, textColor, fill }: {
  label: string; onPress: (event: GestureResponderEvent) => void; variant?: ButtonVariant; icon?: IconName; block?: boolean; small?: boolean;
  onPastel?: boolean; style?: StyleProp<ViewStyle>; textColor?: string; fill?: string;
}) {
  const { c } = useTheme();
  let look = {
    dark: { bg: c.strongFill, border: c.strongFill, ink: c.strongFillInk },
    outline: { bg: 'transparent', border: c.ink, ink: c.ink },
    primary: { bg: c.primary, border: c.primary, ink: c.primaryInk },
  }[variant];
  if (onPastel) {
    look = variant === 'outline' ? { bg: 'transparent', border: fixed.cardInk, ink: fixed.cardInk } : { bg: fixed.cardInk, border: fixed.cardInk, ink: '#FFFFFF' };
  }
  if (fill) look = { bg: fill, border: fill, ink: textColor ?? look.ink };
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        { minHeight: small ? 44 : 50, paddingHorizontal: small ? 18 : 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 25, borderWidth: 2, borderColor: look.border, backgroundColor: look.bg },
        block && { alignSelf: 'stretch' },
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      {icon && <Icon name={icon} size={20} strokeWidth={2.2} color={look.ink} />}
      <T size={small ? 0.9 : 1} weight={600} color={look.ink}>{label}</T>
    </Pressable>
  );
}

export function LinkButton({ label, onPress, onPastel, style }: { label: string; onPress: () => void; onPastel?: boolean; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={6} style={[{ minHeight: 44, paddingHorizontal: 4, justifyContent: 'center' }, style]}>
      <T weight={600} color={onPastel ? fixed.cardInk : c.primary} style={onPastel && { textDecorationLine: 'underline' }}>{label}</T>
    </Pressable>
  );
}

// ---------- Small pieces ----------
export function Pill({ label, color, icon }: { label: string; color: string; icon?: IconName }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 3, borderRadius: 999, borderWidth: 1.5, borderColor: color }}>
      {icon && <Icon name={icon} size={14} strokeWidth={2.2} color={color} />}
      <T size={0.8} weight={600} color={color}>{label}</T>
    </View>
  );
}

export function Chip({ label, icon }: { label: string; icon?: IconName }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 12, backgroundColor: fixed.lilacSoft }}>
      {icon && <Icon name={icon} size={14} strokeWidth={2} color={fixed.cardInk} />}
      <T size={0.8} weight={600} color={fixed.cardInk}>{label}</T>
    </View>
  );
}

export function Bar({ ratio, onPastel, warn }: { ratio: number; onPastel?: boolean; warn?: boolean }) {
  const { c } = useTheme();
  return (
    <View style={{ height: 10, borderRadius: 5, overflow: 'hidden', backgroundColor: onPastel ? 'rgba(255,255,255,0.7)' : c.day }}>
      <View style={{ height: '100%', borderRadius: 5, width: `${Math.round(Math.min(1, Math.max(0, ratio)) * 100)}%`, backgroundColor: warn ? fixed.warnLine : onPastel ? fixed.cardInk : c.strongFill }} />
    </View>
  );
}

export function Switch({ value, onToggle, label }: { value: boolean; onToggle: () => void; label: string }) {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={onToggle}
      style={{ width: 56, height: 34, borderRadius: 17, backgroundColor: value ? c.primary : '#8DA3B8' }}
    >
      <View style={{ position: 'absolute', top: 4, left: 4, width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFFFFF', transform: [{ translateX: value ? 22 : 0 }] }} />
    </Pressable>
  );
}

export function Segmented<V extends string>({ options, value, onChange, label }: { options: { value: V; label: string }[]; value: V; onChange: (value: V) => void; label: string }) {
  const { c } = useTheme();
  return (
    <View accessibilityLabel={label} style={{ flexDirection: 'row', gap: 4, padding: 4, borderRadius: 999, backgroundColor: c.day }}>
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onChange(option.value)}
            style={{ flex: 1, minHeight: 44, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: isSelected ? c.strongFill : 'transparent' }}
          >
            <T weight={600} color={isSelected ? c.strongFillInk : c.ink}>{option.label}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Ring({ percent, size, strokeWidth, trackColor, arcColor, labelColor }: { percent: number; size: number; strokeWidth: number; trackColor: string; arcColor: string; labelColor: string }) {
  const ringRadius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * ringRadius;
  const dashOffset = circumference * (1 - percent / 100);
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={center} cy={center} r={ringRadius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <Circle
          cx={center} cy={center} r={ringRadius} fill="none" stroke={arcColor} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={`${circumference.toFixed(2)}`} strokeDashoffset={dashOffset.toFixed(2)} transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
        <T size={size > 100 ? 1.7 : 0.85} weight={700} color={labelColor}>{percent}%</T>
      </View>
    </View>
  );
}

// Circles placed around a centre point: used for decoration in Wrapped and banners.
export function OrbitShapes({ shapeCount, orbitRadius, shapeSize, colours, centerX, centerY, opacity = 1 }: {
  shapeCount: number; orbitRadius: number; shapeSize: number; colours: string[]; centerX: number; centerY: number; opacity?: number;
}) {
  return (
    <>
      {Array.from({ length: shapeCount }, (unused, shapeNumber) => {
        const angle = shapeNumber * (2 * Math.PI / shapeCount);
        const sizeForThisShape = shapeSize * (0.6 + 0.4 * ((shapeNumber % 3) / 2));
        return (
          <View
            key={shapeNumber}
            style={{
              position: 'absolute',
              left: centerX + Math.cos(angle) * orbitRadius - sizeForThisShape / 2,
              top: centerY + Math.sin(angle) * orbitRadius - sizeForThisShape / 2,
              width: sizeForThisShape,
              height: sizeForThisShape,
              borderRadius: sizeForThisShape / 2,
              backgroundColor: colours[shapeNumber % colours.length],
              opacity,
            }}
          />
        );
      })}
    </>
  );
}

export function WrappedBanner({ title, subtitle }: { title: string; subtitle: string }) {
  const { openWrapped } = useActions();
  return (
    <Pressable accessibilityRole="button" onPress={openWrapped} style={({ pressed }) => [{ overflow: 'hidden', minHeight: 150, padding: 22, gap: 6, borderRadius: radius.xl, backgroundColor: '#0B2A4A', justifyContent: 'center' }, pressed && { opacity: 0.9 }]}>
      <View pointerEvents="none" style={{ position: 'absolute', right: -30, top: -30, width: 200, height: 200 }}>
        <OrbitShapes shapeCount={8} orbitRadius={70} shapeSize={34} colours={['#62BCEB', '#FFD66B', '#BFE8B4', '#6158CC']} centerX={100} centerY={100} opacity={0.9} />
      </View>
      <T size={1.5} weight={700} lh={1.1} color="#FFFFFF" style={{ zIndex: 1 }}>{title}</T>
      <T color="#CFE6F7" style={{ zIndex: 1 }}>{subtitle}</T>
    </Pressable>
  );
}

// ---------- Top bar ----------
export function TopBar() {
  const { state } = useApp();
  const { openTips } = useActions();
  const { c } = useTheme();
  const newTipCount = getTipFeed(state).shownDueTips.length;
  return (
    <Spread>
      <Row>
        <View style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: fixed.peach }}>
          <T weight={700} color={fixed.cardInk}>S</T>
        </View>
        <View>
          <T size={1.1} weight={700}>Hello, Sofie</T>
          <T size={0.85} color={c.muted}>Welcome back</T>
        </View>
      </Row>
      <RoundButton icon="bell" variant="soft" label={'Tips' + (newTipCount > 0 ? ', ' + newTipCount + ' new' : '')} showDot={newTipCount > 0} onPress={() => openTips('all')} />
    </Spread>
  );
}

// ---------- Tip card ----------
export function TipCard({ tip, showDreamName }: { tip: Tip; showDreamName: boolean }) {
  const { runTip, dismissTip } = useActions();
  const tipKind = TIP_KINDS[tip.kind];
  const metaParts: string[] = [tipKind.label];
  if (showDreamName && tip.dreamName) metaParts.push(tip.dreamName);
  if (tip.monthIndex > TODAY_MONTH_INDEX) metaParts.push(formatMonth(tip.monthIndex));

  return (
    <View style={{ gap: 12, borderRadius: radius.lg, padding: 18, backgroundColor: PASTEL_BACKGROUNDS[tipKind.pastel] }}>
      <Row style={{ alignItems: 'flex-start' }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={tip.iconName} size={22} color={fixed.cardInk} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <T size={0.8} weight={600} color={fixed.cardInk} style={{ opacity: 0.85 }}>{metaParts.join(' · ')}</T>
          <T size={1.1} weight={700} lh={1.25} color={fixed.cardInk}>{tip.title}</T>
        </View>
      </Row>
      <Rich parts={tip.body} color={fixed.cardInk} />
      <Row gap={8} style={{ flexWrap: 'wrap' }}>
        <Button small onPastel label={tip.primaryLabel} onPress={(event) => runTip(tip, pointOf(event))} />
        <LinkButton onPastel label="Not for me" onPress={() => dismissTip(tip.id)} />
      </Row>
    </View>
  );
}

const useStyles = makeStyles(({ c }) => ({
  card: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: radius.lg, padding: 18, boxShadow: c.shadow === 'none' ? undefined : c.shadow },
}));

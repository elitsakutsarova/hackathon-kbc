import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, BackHandler, Easing, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useActions } from '@/lib/actions';
import {
  describeSavingPersonality,
  formatEuro,
  formatLongMonth,
  formatMonthCount,
  getDescribedDreams,
  getSavingsHistory,
  getYear,
  MONTH_NAMES,
  sumOf,
  TODAY_MONTH_INDEX,
  type AppState,
} from '@/lib/dreams';
import { useApp } from '@/lib/store';
import { useTheme } from '@/lib/theme';
import { useReducedMotion } from '@/lib/use-reduced-motion';

import { Icon } from './icon';
import { OrbitShapes, T } from './ui';

const SLIDE_DURATION_MS = 6000;

const THEMES = {
  navy: { bg: '#0B2A4A', ink: '#FFFFFF' },
  sky: { bg: '#62BCEB', ink: '#0B2A4A' },
  mint: { bg: '#BFE8B4', ink: '#0B2A4A' },
  lilac: { bg: '#6158CC', ink: '#FFFFFF' },
  sun: { bg: '#FFD66B', ink: '#0B2A4A' },
  peach: { bg: '#FFB89B', ink: '#0B2A4A' },
};

/** `interactivePart` is the one part that can be tapped; everything else lets taps through to the tap zones. */
type Slide = { theme: keyof typeof THEMES; shapes: string[]; content: ReactNode[]; interactivePart?: number };

// ---------- Slide text styles (the CSS used clamp() on the viewport width) ----------
function useSlideText() {
  const { rem } = useTheme();
  const { width } = useWindowDimensions();
  const stageWidth = Math.min(width, 440);
  const clamp = (min: number, preferred: number, max: number) => Math.min(max, Math.max(min, preferred));
  return {
    huge: clamp(rem(3.2), stageWidth * 0.17, rem(4.8)),
    large: clamp(rem(2), stageWidth * 0.1, rem(2.8)),
  };
}

function Kicker({ children, color }: { children: ReactNode; color: string }) {
  return <T size={1.05} weight={600} color={color}>{children}</T>;
}

function Huge({ children, color }: { children: ReactNode; color: string }) {
  const { huge } = useSlideText();
  return <T weight={800} color={color} style={{ fontSize: huge, lineHeight: huge * 1.05, letterSpacing: -huge * 0.04 }}>{children}</T>;
}

function Large({ children, color }: { children: ReactNode; color: string }) {
  const { large } = useSlideText();
  return <T weight={800} color={color} style={{ fontSize: large, lineHeight: large * 1.1, letterSpacing: -large * 0.02 }}>{children}</T>;
}

function SlideText({ children, color }: { children: ReactNode; color: string }) {
  return <T size={1.1} weight={500} color={color} style={{ maxWidth: 300 }}>{children}</T>;
}

// Numbers count up from 0 with an ease-out curve.
function CountUp({ to, format, color }: { to: number; format: (value: number) => string; color: string }) {
  const isReducedMotion = useReducedMotion();
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (isReducedMotion) return;
    const countDuration = 1400;
    const startTime = Date.now();
    let frame = 0;
    const step = () => {
      const progress = Math.min(1, (Date.now() - startTime) / countDuration);
      setValue(to * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [to, isReducedMotion]);
  return <Huge color={color}>{format(isReducedMotion ? to : value)}</Huge>;
}

// Each part of a slide rises in, a little after the one before.
function Rise({ delay, isInteractive, children }: { delay: number; isInteractive: boolean; children: ReactNode }) {
  const isReducedMotion = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(progress, { toValue: 1, duration: isReducedMotion ? 1 : 600, delay: isReducedMotion ? 0 : delay, easing: Easing.bezier(0.2, 0.8, 0.2, 1), useNativeDriver: true }).start();
  }, [progress, delay, isReducedMotion]);
  return (
    <Animated.View pointerEvents={isInteractive ? 'box-none' : 'none'} style={{ opacity: progress, transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] }}>
      {children}
    </Animated.View>
  );
}

function buildWrappedSlides(state: AppState, onShare: () => void): Slide[] {
  const describedDreams = getDescribedDreams(state);
  const history = getSavingsHistory(state);
  const savedThisYear = sumOf(history.map((month) => month.amount));
  const bestMonth = history.reduce((best, month) => (month.amount > best.amount ? month : best), history[0]);
  const topDream = describedDreams.slice().sort((firstDream, secondDream) => secondDream.progressPercent - firstDream.progressPercent)[0];
  const nextDream = describedDreams.find((dream) => !dream.isComplete) ?? topDream;
  const plannedExtraCount = sumOf(describedDreams.map((dream) => dream.scheduledExtras.length));
  const extraMoveCount = state.moneyMoves.length + plannedExtraCount;
  const personality = describeSavingPersonality(history, extraMoveCount);
  const year = getYear(TODAY_MONTH_INDEX);
  const monthsSaved = history.filter((month) => month.amount > 0).length;
  const white = THEMES.navy.ink;
  const ink = THEMES.sky.ink;

  const slides: Slide[] = [
    {
      theme: 'navy', shapes: ['#62BCEB', '#FFD66B', '#BFE8B4'],
      content: [
        <Kicker key="k" color={white}>Hey Sofie,</Kicker>,
        <Huge key="h" color={white}>{year + '\nwas a\ndreamy year.'}</Huge>,
        <SlideText key="t" color={white}>Let&apos;s look back at what you built. Tap to go on.</SlideText>,
      ],
    },
    {
      theme: 'sky', shapes: ['#FFFFFF', '#0B2A4A', '#FFD66B'],
      content: [
        <Kicker key="k" color={ink}>This year you put aside</Kicker>,
        <CountUp key="h" to={savedThisYear} format={formatEuro} color={ink} />,
        <SlideText key="t" color={ink}>for the things that really matter to you.</SlideText>,
      ],
    },
  ];

  if (topDream) {
    slides.push({
      theme: 'mint', shapes: ['#0B2A4A', '#FFFFFF', '#62BCEB'],
      content: [
        <Kicker key="k" color={ink}>Your top dream</Kicker>,
        <Large key="l" color={ink}>{topDream.name}</Large>,
        <CountUp key="h" to={topDream.progressPercent} format={(value) => Math.round(value) + '%'} color={ink} />,
        <SlideText key="t" color={ink}>of the way there. {formatMonthCount(topDream.monthsLeft)} to go.</SlideText>,
      ],
    });
  }

  slides.push(
    {
      theme: 'lilac', shapes: ['#FFD66B', '#BFE8B4', '#FFFFFF'],
      content: [
        <Kicker key="k" color={white}>Saving streak</Kicker>,
        <Huge key="h" color={white}>{monthsSaved + ' of ' + history.length}</Huge>,
        <View key="m" accessibilityLabel="Months you saved" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, maxWidth: 320 }}>
          {history.map((month) => (
            <View key={month.monthIndex} style={{ width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: white, alignItems: 'center', justifyContent: 'center', backgroundColor: month.amount > 0 ? white : 'transparent' }}>
              <T size={0.8} weight={700} color={month.amount > 0 ? '#6158CC' : white}>{MONTH_NAMES[month.monthIndex % 12].charAt(0)}</T>
            </View>
          ))}
        </View>,
        <SlideText key="t" color={white}>months with money set aside for your dreams.</SlideText>,
      ],
    },
    {
      theme: 'sun', shapes: ['#0B2A4A', '#FFFFFF', '#FFB89B'],
      content: [
        <Kicker key="k" color={ink}>Your best month</Kicker>,
        <Huge key="h" color={ink}>{MONTH_NAMES[bestMonth.monthIndex % 12]}</Huge>,
        <View key="b" accessible={false} style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 150 }}>
          {history.map((month) => (
            <View key={month.monthIndex} style={{ flex: 1, height: `${Math.round(month.amount / bestMonth.amount * 100)}%`, borderTopLeftRadius: 8, borderTopRightRadius: 8, backgroundColor: ink, opacity: month === bestMonth ? 1 : 0.35 }} />
          ))}
        </View>,
        <SlideText key="t" color={ink}>{formatEuro(bestMonth.amount)} saved in {formatLongMonth(bestMonth.monthIndex)}.</SlideText>,
      ],
    },
    {
      theme: 'peach', shapes: ['#0B2A4A', '#FFFFFF', '#6158CC'],
      content: [
        <Kicker key="k" color={ink}>Your saving personality</Kicker>,
        <Large key="l" color={ink}>{personality.name}</Large>,
        <SlideText key="t" color={ink}>{personality.text}</SlideText>,
      ],
    },
  );

  if (nextDream) {
    slides.push({
      theme: 'navy', shapes: ['#62BCEB', '#FFD66B', '#FFB89B'], interactivePart: 3,
      content: [
        <Kicker key="k" color={white}>Coming up in {year + 1}</Kicker>,
        <Large key="l" color={white}>{nextDream.name} is {formatMonthCount(nextDream.monthsLeft)} away.</Large>,
        <SlideText key="t" color={white}>Keep going. We&apos;ve got the maths, you bring the dreaming.</SlideText>,
        <Pressable
          key="s"
          accessibilityRole="button"
          onPress={onShare}
          style={({ pressed }) => [{ alignSelf: 'flex-start', minHeight: 50, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 25, backgroundColor: '#FFFFFF' }, pressed && { opacity: 0.85 }]}
        >
          <Icon name="share" size={20} strokeWidth={2} color="#0B2A4A" />
          <T weight={600} color="#0B2A4A">Share my Wrapped</T>
        </Pressable>,
      ],
    });
  }
  return slides;
}

function StoryButton({ icon, label, color, onPress }: { icon: 'pause' | 'play' | 'close'; label: string; color: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={20} strokeWidth={2.4} color={color} />
    </Pressable>
  );
}

// Dream Wrapped: full-screen stories, like Spotify Wrapped.
// The story is mounted fresh every time Wrapped opens, so it always starts at slide 1.
export function Wrapped() {
  const { isWrappedOpen } = useApp();
  return isWrappedOpen ? <WrappedStory /> : null;
}

function WrappedStory() {
  const { state, showToast } = useApp();
  const { closeWrapped } = useActions();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isReducedMotion = useReducedMotion();
  // Built from real numbers once, when Wrapped opens.
  const [slides] = useState(() => buildWrappedSlides(state, () => showToast('Your Wrapped card is ready to share.')));
  const [slideIndex, setSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress] = useState(() => new Animated.Value(0));
  const [orbit] = useState(() => new Animated.Value(0));
  const progressSoFar = useRef(0);
  const stageWidth = Math.min(width, 440);

  const showSlide = (nextIndex: number) => {
    if (nextIndex >= slides.length) {
      closeWrapped();
      return;
    }
    progress.setValue(0);
    progressSoFar.current = 0;
    setSlideIndex(Math.max(0, nextIndex));
  };

  // When the active progress bar is full, go to the next slide.
  useEffect(() => {
    if (isPaused || isReducedMotion) return;
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: (1 - progressSoFar.current) * SLIDE_DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    animation.start(({ finished }) => {
      if (finished) showSlide(slideIndex + 1);
    });
    return () => {
      animation.stop();
      progress.stopAnimation((value) => { progressSoFar.current = value; });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideIndex, isPaused, isReducedMotion]);

  useEffect(() => {
    if (isReducedMotion) return;
    const spin = Animated.loop(Animated.timing(orbit, { toValue: 1, duration: 40000, easing: Easing.linear, useNativeDriver: true }));
    spin.start();
    return () => spin.stop();
  }, [isReducedMotion, orbit]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      closeWrapped();
      return true;
    });
    return () => subscription.remove();
  }, [closeWrapped]);


  const slide = slides[slideIndex];
  const theme = THEMES[slide.theme];

  return (
    <View accessibilityViewIsModal accessibilityLabel="Your Dream Wrapped" style={[StyleSheet.absoluteFill, { zIndex: 60, backgroundColor: '#000000', alignItems: 'center' }]}>
      <View style={{ flex: 1, width: '100%', maxWidth: 440, overflow: 'hidden', backgroundColor: theme.bg, paddingTop: 14 + insets.top, paddingHorizontal: 20, paddingBottom: 24 + insets.bottom }}>
        {/* Decorative circles, arranged in a ring around the top-right corner. */}
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { transform: [{ rotate: orbit.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]}>
          <OrbitShapes shapeCount={10} orbitRadius={120} shapeSize={46} colours={slide.shapes} centerX={stageWidth - 30} centerY={150} opacity={0.9} />
        </Animated.View>

        <View style={{ flexDirection: 'row', gap: 5, zIndex: 3 }} accessible={false}>
          {slides.map((unusedSlide, slidePosition) => {
            const isDone = slidePosition < slideIndex;
            const isActive = slidePosition === slideIndex;
            return (
              <View key={slidePosition} style={{ flex: 1, height: 4, borderRadius: 2, overflow: 'hidden', backgroundColor: isActive ? theme.ink + '4D' : theme.ink, opacity: isDone || isActive ? 1 : 0.3 }}>
                {isActive && (
                  <Animated.View
                    style={{
                      height: '100%',
                      backgroundColor: theme.ink,
                      width: isReducedMotion ? '100%' : progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                    }}
                  />
                )}
              </View>
            );
          })}
        </View>

        <View style={{ zIndex: 3, marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <T weight={700} color={theme.ink} style={{ letterSpacing: 0.3 }}>Dream Wrapped</T>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <StoryButton icon={isPaused ? 'play' : 'pause'} label={isPaused ? 'Play' : 'Pause'} color={theme.ink} onPress={() => setIsPaused((paused) => !paused)} />
            <StoryButton icon="close" label="Close" color={theme.ink} onPress={closeWrapped} />
          </View>
        </View>

        <Pressable accessibilityRole="button" accessibilityLabel="Previous slide" onPress={() => showSlide(slideIndex - 1)} style={{ position: 'absolute', top: 120, bottom: 0, left: 0, width: '35%', zIndex: 2 }} />
        <Pressable accessibilityRole="button" accessibilityLabel="Next slide" onPress={() => showSlide(slideIndex + 1)} style={{ position: 'absolute', top: 120, bottom: 0, right: 0, width: '65%', zIndex: 2 }} />

        <View key={slideIndex} pointerEvents="box-none" accessibilityLabel={'Slide ' + (slideIndex + 1) + ' of ' + slides.length} style={{ flex: 1, justifyContent: 'center', gap: 18, zIndex: 3 }}>
          {slide.content.map((part, index) => (
            <Rise key={index} delay={index * 120} isInteractive={index === slide.interactivePart}>{part}</Rise>
          ))}
        </View>
      </View>
    </View>
  );
}

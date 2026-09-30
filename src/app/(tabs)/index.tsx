import { Pressable, useWindowDimensions, View } from 'react-native';

import { Bar, LinkButton, PageTitle, Pill, RoundButton, Row, Screen, SCREEN_SIDE_PADDING, SectionTitle, Spread, Stack, T, TopBar } from '@/components/ui';
import { useActions } from '@/lib/actions';
import {
  EVENT_KIND_LABELS,
  EVENT_KIND_ORDER,
  formatEuro,
  formatLongMonth,
  formatMonth,
  generateCalendarEvents,
  getDaysInMonth,
  getDescribedDreams,
  getLongMonthName,
  getNextMilestone,
  getYear,
  TODAY_DAY_OF_MONTH,
  TODAY_MONTH_INDEX,
  WEEKDAY_LETTERS,
  type CalendarEvent,
  type DescribedDream,
  type EventKind,
  type Pastel,
} from '@/lib/dreams';
import { useApp } from '@/lib/store';
import { fixed, PASTEL_BACKGROUNDS, radius, useTheme, type Theme } from '@/lib/theme';

const GOAL_COLOURS: Pastel[] = ['mint', 'lilac', 'sky', 'peach'];
const MAX_DAY_SIZE = 72;

function eventKindLook(kind: EventKind, c: Theme['c']) {
  return {
    dream: { day: c.primary, dayInk: c.primaryInk, legend: c.primary },
    milestone: { day: fixed.mint, dayInk: '#0B2A4A', legend: fixed.mint },
    tip: { day: fixed.lilac, dayInk: '#FFFFFF', legend: fixed.lilac },
    money: { day: c.strongFill, dayInk: c.strongFillInk, legend: c.strongFill },
  }[kind];
}

function MonthGrid({ monthIndex, monthEvents }: { monthIndex: number; monthEvents: CalendarEvent[] }) {
  const { c, rem } = useTheme();
  const { width } = useWindowDimensions();
  // The grid spans the whole screen width; each day circle grows with its column.
  const cellWidth = (width - SCREEN_SIDE_PADDING * 2) / 7;
  const daySize = Math.min(MAX_DAY_SIZE, Math.floor(cellWidth) - 6);
  const dayFontSize = rem(0.95) * Math.min(1.3, Math.max(1, daySize / 44));
  const year = getYear(monthIndex);
  const daysInMonth = getDaysInMonth(monthIndex);
  // getDay() starts on Sunday (0). Shifting by 6 puts Monday first, as in Belgium.
  const leadingBlankDays = (new Date(year, monthIndex % 12, 1).getDay() + 6) % 7;
  const cell = { width: `${100 / 7}%`, alignItems: 'center', justifyContent: 'center' } as const;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 8 }}>
      {WEEKDAY_LETTERS.map((letter, index) => (
        <View key={'weekday-' + index} style={cell} accessible={false}>
          <T size={0.85} weight={600} color={c.muted}>{letter}</T>
        </View>
      ))}
      {Array.from({ length: leadingBlankDays }, (unused, index) => <View key={'blank-' + index} style={cell} />)}
      {Array.from({ length: daysInMonth }, (unused, dayIndex) => {
        const dayNumber = dayIndex + 1;
        const dayEvents = monthEvents.filter((calendarEvent) => calendarEvent.day === dayNumber);
        // The most important kind of event on this day decides the circle colour.
        const topKind = EVENT_KIND_ORDER.find((kind) => dayEvents.some((calendarEvent) => calendarEvent.kind === kind));
        const look = topKind ? eventKindLook(topKind, c) : null;
        const isToday = monthIndex === TODAY_MONTH_INDEX && dayNumber === TODAY_DAY_OF_MONTH;
        const isPast = monthIndex === TODAY_MONTH_INDEX && dayNumber < TODAY_DAY_OF_MONTH;
        const eventSummary = dayEvents.map((calendarEvent) => calendarEvent.title).join(', ');
        return (
          <View key={dayNumber} style={cell}>
            <View
              accessible
              accessibilityLabel={dayNumber + ' ' + getLongMonthName(monthIndex) + (isToday ? ', today' : '') + (eventSummary ? ': ' + eventSummary : '')}
              style={[
                { width: daySize, height: daySize, borderRadius: daySize / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: look?.day ?? c.day },
                isPast && !topKind && { opacity: 0.55 },
              ]}
            >
              {isToday && (
                <View pointerEvents="none" style={{ position: 'absolute', top: -5, left: -5, width: daySize + 10, height: daySize + 10, borderRadius: daySize / 2 + 5, borderWidth: 2, borderColor: c.primary }} />
              )}
              <T weight={isToday ? 700 : 500} lh={1.2} color={look?.dayInk ?? c.ink} style={{ fontSize: dayFontSize, lineHeight: dayFontSize * 1.2 }}>{dayNumber}</T>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function GoalCard({ dream, colourName }: { dream: DescribedDream; colourName: Pastel }) {
  const { openDream, openTips } = useActions();
  const nextMilestone = getNextMilestone(dream);
  const nextLabel = nextMilestone ? 'Next: ' + nextMilestone.label + ' in ' + nextMilestone.whenLabel : 'Fully funded';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={dream.name}
      onPress={() => openDream(dream.id)}
      style={({ pressed }) => [{ gap: 10, padding: 20, borderRadius: radius.xl, backgroundColor: PASTEL_BACKGROUNDS[colourName] }, pressed && { opacity: 0.9 }]}
    >
      <Pill icon="calendar" label={formatMonth(dream.targetMonthIndex)} color={fixed.cardInk} />
      <T size={1.35} weight={700} lh={1.2} color={fixed.cardInk} style={{ paddingRight: 56 }}>{dream.name}</T>
      <RoundButton icon="arrowUpRight" iconSize={20} strokeWidth={2.4} variant="white" label={'Tips for ' + dream.name} onPress={() => openTips(dream.id)} style={{ position: 'absolute', top: 16, right: 16 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <T size={1.15} weight={700} color={fixed.cardInk}>
          {formatEuro(dream.saved)} <T size={0.9} weight={500} color={fixed.cardMuted}>of {formatEuro(dream.cost)}</T>
        </T>
        <T weight={600} color={fixed.cardInk}>{dream.progressPercent}%</T>
      </View>
      <Bar ratio={dream.progressRatio} onPastel />
      <Spread>
        <T size={0.9} color={fixed.cardInk}>{formatEuro(dream.monthlyAmount)} / month</T>
        <T size={0.9} color={fixed.cardMuted} style={{ flexShrink: 1, textAlign: 'right' }}>{nextLabel}</T>
      </Spread>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { state } = useApp();
  const { c } = useTheme();
  const { go, changeMonth } = useActions();

  const monthIndex = state.calendarMonthIndex;
  const monthEvents = generateCalendarEvents(state, monthIndex);
  const upcomingDreams = getDescribedDreams(state).filter((dream) => !dream.isComplete);

  return (
    <Screen>
      <TopBar />
      <PageTitle>Dream schedule</PageTitle>

      <Spread>
        <SectionTitle>{formatLongMonth(monthIndex)}</SectionTitle>
        <Row gap={6}>
          <RoundButton icon="back" iconSize={20} strokeWidth={2.2} label="Previous month" disabled={monthIndex <= TODAY_MONTH_INDEX} onPress={() => changeMonth(-1)} />
          <RoundButton icon="forward" iconSize={20} strokeWidth={2.2} label="Next month" onPress={() => changeMonth(1)} />
        </Row>
      </Spread>

      <MonthGrid monthIndex={monthIndex} monthEvents={monthEvents} />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 8 }} accessible={false}>
        {EVENT_KIND_ORDER.map((kind) => (
          <Row key={kind} gap={6}>
            <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: eventKindLook(kind, c).legend }} />
            <T size={0.8} weight={500} color={c.muted}>{EVENT_KIND_LABELS[kind]}</T>
          </Row>
        ))}
      </View>

      <Stack>
        <Spread>
          <SectionTitle>Upcoming goals</SectionTitle>
          <LinkButton label="See all" onPress={() => go('dreams')} />
        </Spread>
        {upcomingDreams.map((dream, dreamPosition) => (
          <GoalCard key={dream.id} dream={dream} colourName={GOAL_COLOURS[dreamPosition % GOAL_COLOURS.length]} />
        ))}
      </Stack>
    </Screen>
  );
}

import { Pressable, ScrollView, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Bar, LinkButton, PageTitle, Pill, RoundButton, Row, Screen, SectionTitle, Spread, Stack, T, TopBar } from '@/components/ui';
import { useActions } from '@/lib/actions';
import {
  EVENT_KIND_LABELS,
  EVENT_KIND_ORDER,
  formatDayLabel,
  formatEuro,
  formatLongMonth,
  formatMonth,
  generateCalendarEvents,
  getDaysInMonth,
  getDescribedDreams,
  getLongMonthName,
  getNextMilestone,
  getYear,
  padTwoDigits,
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

const MONTH_STRIP_LENGTH = 24;
const GOAL_COLOURS: Pastel[] = ['mint', 'lilac', 'sky', 'peach'];

function eventKindLook(kind: EventKind, c: Theme['c']) {
  return {
    dream: { day: c.primary, dayInk: c.primaryInk, icon: '#FFE9A8', legend: c.primary },
    milestone: { day: fixed.mint, dayInk: '#0B2A4A', icon: fixed.mint, legend: fixed.mint },
    tip: { day: fixed.lilac, dayInk: '#FFFFFF', icon: fixed.lilacSoft, legend: fixed.lilac },
    money: { day: c.strongFill, dayInk: c.strongFillInk, icon: fixed.skySoft, legend: c.strongFill },
  }[kind];
}

function MonthGrid({ monthIndex, monthEvents, selectedDay }: { monthIndex: number; monthEvents: CalendarEvent[]; selectedDay: number }) {
  const { c } = useTheme();
  const { pickDay } = useActions();
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
        const isSelected = dayNumber === selectedDay;
        const ringColour = isSelected ? fixed.focus : isToday ? c.primary : null;
        const eventSummary = dayEvents.map((calendarEvent) => calendarEvent.title).join(', ');
        return (
          <View key={dayNumber} style={cell}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={dayNumber + ' ' + getLongMonthName(monthIndex) + (isToday ? ', today' : '') + (eventSummary ? ': ' + eventSummary : '')}
              onPress={() => pickDay(dayNumber)}
              style={({ pressed }) => [
                { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: look?.day ?? c.day },
                isPast && !topKind && { opacity: 0.55 },
                pressed && { transform: [{ scale: 1.07 }] },
              ]}
            >
              {ringColour && <View pointerEvents="none" style={{ position: 'absolute', top: -5, left: -5, width: 54, height: 54, borderRadius: 27, borderWidth: 2, borderColor: ringColour }} />}
              <T size={0.95} weight={isToday || isSelected ? 700 : 500} lh={1.2} color={look?.dayInk ?? c.ink}>{dayNumber}</T>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

function EventButton({ calendarEvent }: { calendarEvent: CalendarEvent }) {
  const { c } = useTheme();
  const { openTarget } = useActions();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => openTarget(calendarEvent.target)}
      style={({ pressed }) => [{ minHeight: 56, paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: c.line, borderRadius: radius.md, backgroundColor: c.surface }, pressed && { opacity: 0.85 }]}
    >
      <View style={{ width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: eventKindLook(calendarEvent.kind, c).icon }}>
        <Icon name={calendarEvent.iconName} size={20} color={fixed.cardInk} />
      </View>
      <View style={{ flex: 1 }}>
        <T weight={700}>{calendarEvent.title}</T>
        <T size={0.85} color={c.muted}>{calendarEvent.detail}</T>
      </View>
      <Icon name="forward" size={18} strokeWidth={2.2} color={c.ink} />
    </Pressable>
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
  const { go, toggleMonthStrip, setMonth, changeMonth } = useActions();

  const monthIndex = state.calendarMonthIndex;
  const selectedDay = Math.min(state.selectedCalendarDay, getDaysInMonth(monthIndex));
  const monthEvents = generateCalendarEvents(state, monthIndex);
  const selectedDayEvents = monthEvents.filter((calendarEvent) => calendarEvent.day === selectedDay);
  const upcomingDreams = getDescribedDreams(state).filter((dream) => !dream.isComplete);
  const pillDate = padTwoDigits(selectedDay) + '.' + padTwoDigits(monthIndex % 12 + 1) + '.' + getYear(monthIndex);

  return (
    <Screen>
      <TopBar />
      <PageTitle>Dream schedule</PageTitle>

      <Spread>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: state.isMonthStripOpen }}
          accessibilityLabel={'Change month, now showing ' + formatLongMonth(monthIndex)}
          onPress={toggleMonthStrip}
          style={{ minHeight: 52, paddingLeft: 8, paddingRight: 6, flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 26, borderWidth: 1, borderColor: c.line, backgroundColor: c.surface, boxShadow: c.shadow === 'none' ? undefined : c.shadow }}
        >
          <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: c.day, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="calendar" size={20} strokeWidth={2} color={c.ink} />
          </View>
          <T weight={600}>{pillDate}</T>
          <View style={{ width: 38, height: 38, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: state.isMonthStripOpen ? '180deg' : '0deg' }] }}>
            <Icon name="chevronDown" size={20} strokeWidth={2.2} color={c.ink} />
          </View>
        </Pressable>
        <RoundButton icon="pencil" variant="dark" size={52} label="Add a dream" onPress={() => go('add')} />
      </Spread>

      {state.isMonthStripOpen && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, marginTop: -8 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingVertical: 4 }}>
          {Array.from({ length: MONTH_STRIP_LENGTH }, (unused, monthOffset) => {
            const chipMonthIndex = TODAY_MONTH_INDEX + monthOffset;
            const isSelected = chipMonthIndex === monthIndex;
            return (
              <Pressable
                key={chipMonthIndex}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => setMonth(chipMonthIndex)}
                style={{ minHeight: 44, paddingHorizontal: 16, borderRadius: 22, justifyContent: 'center', borderWidth: 1, borderColor: isSelected ? c.strongFill : c.line, backgroundColor: isSelected ? c.strongFill : c.surface }}
              >
                <T size={0.9} weight={600} color={isSelected ? c.strongFillInk : c.ink}>{formatMonth(chipMonthIndex)}</T>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <Spread>
        <SectionTitle>{formatLongMonth(monthIndex)}</SectionTitle>
        <Row gap={6}>
          <RoundButton icon="back" iconSize={20} strokeWidth={2.2} label="Previous month" disabled={monthIndex <= TODAY_MONTH_INDEX} onPress={() => changeMonth(-1)} />
          <RoundButton icon="forward" iconSize={20} strokeWidth={2.2} label="Next month" onPress={() => changeMonth(1)} />
        </Row>
      </Spread>

      <MonthGrid monthIndex={monthIndex} monthEvents={monthEvents} selectedDay={selectedDay} />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 8 }} accessible={false}>
        {EVENT_KIND_ORDER.map((kind) => (
          <Row key={kind} gap={6}>
            <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: eventKindLook(kind, c).legend }} />
            <T size={0.8} weight={500} color={c.muted}>{EVENT_KIND_LABELS[kind]}</T>
          </Row>
        ))}
      </View>

      <Stack>
        <SectionTitle>{formatDayLabel(monthIndex, selectedDay)}</SectionTitle>
        {selectedDayEvents.length > 0 ? (
          <Stack gap={8}>
            {selectedDayEvents.map((calendarEvent, index) => <EventButton key={index} calendarEvent={calendarEvent} />)}
          </Stack>
        ) : (
          <T color={c.muted}>Nothing planned. Tap a coloured day to see what happens then.</T>
        )}
      </Stack>

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

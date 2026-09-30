import { Pressable, View } from 'react-native';
import Svg, { G, Rect, Text as SvgText } from 'react-native-svg';

import { Icon } from '@/components/icon';
import { Bar, Button, Card, Chip, PageTitle, Pill, Ring, Row, Screen, SectionTitle, Spread, Stack, T, TopBar, WrappedBanner } from '@/components/ui';
import { useActions } from '@/lib/actions';
import {
  calculateBudget,
  calculateTradeOff,
  formatEuro,
  formatMonth,
  formatMonthCount,
  getDescribedDreams,
  getSavingsHistory,
  getYear,
  MONTH_NAMES,
  sumOf,
  TODAY_MONTH_INDEX,
  type Budget,
  type DescribedDream,
  type HistoryMonth,
} from '@/lib/dreams';
import { useApp } from '@/lib/store';
import { fixed, PASTEL_BACKGROUNDS, radius, useTheme } from '@/lib/theme';

const RECENT_MONTH_COUNT = 6;

// Bar chart of the last 6 months. Bar height = amount ÷ biggest amount.
function SavingsChart({ recentHistory }: { recentHistory: HistoryMonth[] }) {
  const { c } = useTheme();
  const chartWidth = 320;
  const chartHeight = 130;
  const labelSpace = 22;
  const valueSpace = 18;
  const barGap = 12;
  const barCount = recentHistory.length;
  const barWidth = (chartWidth - barGap * (barCount - 1)) / barCount;
  const biggestAmount = Math.max(...recentHistory.map((month) => month.amount));
  const drawableHeight = chartHeight - labelSpace - valueSpace;
  const chartDescription = 'Saved per month: ' + recentHistory.map((month) => MONTH_NAMES[month.monthIndex % 12] + ' ' + formatEuro(month.amount)).join(', ');

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={chartDescription} style={{ width: '100%', aspectRatio: chartWidth / chartHeight }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        {recentHistory.map((month, barPosition) => {
          const barHeight = Math.max(4, drawableHeight * month.amount / biggestAmount);
          const barX = barPosition * (barWidth + barGap);
          const barY = valueSpace + drawableHeight - barHeight;
          const isCurrentMonth = month.monthIndex === TODAY_MONTH_INDEX;
          return (
            <G key={month.monthIndex}>
              <Rect x={barX} y={barY} width={barWidth} height={barHeight} rx={10} fill={isCurrentMonth ? c.strongFill : fixed.sky} />
              <SvgText x={barX + barWidth / 2} y={barY - 5} textAnchor="middle" fontSize={11} fontFamily="Poppins_700Bold" fill={c.ink}>{String(Math.round(month.amount))}</SvgText>
              <SvgText x={barX + barWidth / 2} y={chartHeight - 4} textAnchor="middle" fontSize={11} fontFamily="Poppins_600SemiBold" fill={c.muted}>{MONTH_NAMES[month.monthIndex % 12]}</SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

function StreakDots({ history }: { history: HistoryMonth[] }) {
  const { c } = useTheme();
  const perRow = 6;
  const rows = Array.from({ length: Math.ceil(history.length / perRow) }, (unused, rowIndex) => history.slice(rowIndex * perRow, rowIndex * perRow + perRow));
  return (
    <View style={{ gap: 5 }} accessible={false}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={{ flexDirection: 'row', gap: 5 }}>
          {Array.from({ length: perRow }, (unused, index) => {
            const month = row[index];
            return <View key={index} style={{ flex: 1, aspectRatio: 1, borderRadius: 999, backgroundColor: month ? (month.amount > 0 ? fixed.mintStrong : c.day) : 'transparent' }} />;
          })}
        </View>
      ))}
    </View>
  );
}

function ChoiceButton({ title, detail, onPress }: { title: string; detail: string; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [{ paddingVertical: 14, paddingHorizontal: 16, gap: 2, borderWidth: 1.5, borderColor: pressed ? c.ink : c.line, borderRadius: radius.md, backgroundColor: c.surface }]}
    >
      <T weight={700}>{title}</T>
      <T color={c.muted}>{detail}</T>
    </Pressable>
  );
}

function TradeOffCard({ describedDreams, budget }: { describedDreams: DescribedDream[]; budget: Budget }) {
  const { c } = useTheme();
  const { state } = useApp();
  const { tradeOffMove, tradeOffSaveMore } = useActions();
  const tradeOff = calculateTradeOff(describedDreams, budget);
  if (!tradeOff) return null;
  return (
    <View style={{ gap: 12, padding: 18, borderRadius: radius.lg, backgroundColor: c.warnBg, borderWidth: 2, borderColor: fixed.warnLine }}>
      <SectionTitle>Two dreams are competing</SectionTitle>
      <T>
        Together they need <T weight={700}>{formatEuro(budget.overflowAmount)} more a month</T> than the {formatEuro(state.monthlyRoom)} you usually put aside. You choose what matters most.
      </T>
      {tradeOff.canMoveDate && (
        <ChoiceButton
          title={'Move "' + tradeOff.flexibleDream.name + '" to ' + formatMonth(tradeOff.newTargetMonthIndex)}
          detail={'About ' + formatMonthCount(tradeOff.delayMonths) + ' later. The rest stays on track.'}
          onPress={tradeOffMove}
        />
      )}
      <ChoiceButton title="Keep every date" detail={'Save ' + formatEuro(budget.overflowAmount) + ' more each month instead.'} onPress={tradeOffSaveMore} />
    </View>
  );
}

function DreamItem({ dream }: { dream: DescribedDream }) {
  const { c } = useTheme();
  const { openDream } = useActions();
  return (
    <Card onPress={() => openDream(dream.id)} accessibilityLabel={dream.name} style={{ gap: 10 }}>
      <Row>
        <View style={{ width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: PASTEL_BACKGROUNDS[dream.template.pastel] }}>
          <Icon name={dream.template.iconName} size={26} color={fixed.cardInk} />
        </View>
        <View style={{ flex: 1 }}>
          <T weight={700}>{dream.name}</T>
          <T size={0.9} color={c.muted}>{formatMonth(dream.targetMonthIndex)} · {formatMonthCount(dream.monthsLeft)} to go</T>
          {dream.isShared && <Chip icon="people" label="With Tom" />}
        </View>
        <Ring percent={dream.progressPercent} size={56} strokeWidth={7} trackColor={c.day} arcColor={c.primary} labelColor={c.ink} />
      </Row>
      <Spread>
        <T size={0.9} weight={700}>{formatEuro(dream.monthlyAmount)} / month</T>
        <T size={0.9} color={c.muted}>{formatEuro(dream.saved)} of {formatEuro(dream.cost)}</T>
      </Spread>
    </Card>
  );
}

function StatusTab({ label, count, isSelected, onPress }: { label: string; count: number; isSelected: boolean; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      onPress={onPress}
      style={{ flex: 1, minHeight: 56, paddingLeft: 18, paddingRight: 8, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, borderRadius: 28, borderWidth: 1.5, borderColor: isSelected ? c.strongFill : c.ink, backgroundColor: isSelected ? c.strongFill : 'transparent' }}
    >
      <T size={0.9} weight={600} numberOfLines={1} color={isSelected ? c.strongFillInk : c.ink} style={{ flexShrink: 1 }}>{label}</T>
      <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: isSelected ? c.surface : 'transparent' }}>
        <T weight={700}>{count}</T>
      </View>
    </Pressable>
  );
}

export default function DreamsScreen() {
  const { state } = useApp();
  const { c } = useTheme();
  const { go, setDreamsTab } = useActions();

  const describedDreams = getDescribedDreams(state);
  const inProgressDreams = describedDreams.filter((dream) => !dream.isComplete);
  const completedDreams = describedDreams.filter((dream) => dream.isComplete);
  const visibleDreams = state.dreamsTab === 'progress' ? inProgressDreams : completedDreams;
  const budget = calculateBudget(state, describedDreams);
  const history = getSavingsHistory(state);
  const recentHistory = history.slice(-RECENT_MONTH_COUNT);
  const savedThisYear = sumOf(history.map((month) => month.amount));
  const lastMonthAmount = history[history.length - 2].amount;
  const thisMonthAmount = history[history.length - 1].amount;
  const changePercent = Math.round((thisMonthAmount - lastMonthAmount) / lastMonthAmount * 100);
  const streakMonths = history.filter((month) => month.amount > 0).length;

  return (
    <Screen>
      <TopBar />
      <PageTitle>Manage your dreams</PageTitle>

      <Row gap={10}>
        <StatusTab label="In progress" count={inProgressDreams.length} isSelected={state.dreamsTab === 'progress'} onPress={() => setDreamsTab('progress')} />
        <StatusTab label="Completed" count={completedDreams.length} isSelected={state.dreamsTab === 'done'} onPress={() => setDreamsTab('done')} />
      </Row>

      <Card style={{ gap: 12 }}>
        <Spread style={{ alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <T weight={700} color={c.muted}>Saved for dreams in {getYear(TODAY_MONTH_INDEX)}</T>
            <T size={2.2} weight={700} lh={1.1} style={{ letterSpacing: -0.6 }}>{formatEuro(savedThisYear)}</T>
          </View>
          <Pill
            label={(changePercent >= 0 ? '+' : '') + changePercent + '% vs ' + MONTH_NAMES[(TODAY_MONTH_INDEX - 1) % 12]}
            color={changePercent >= 0 ? fixed.mintStrong : fixed.warnLine}
          />
        </Spread>
        <SavingsChart recentHistory={recentHistory} />
      </Card>

      <Row style={{ alignItems: 'stretch' }}>
        <Card style={{ flex: 1, padding: 16, gap: 6 }}>
          <T size={0.85} weight={700} color={c.muted}>Monthly plan</T>
          <SectionTitle>{formatEuro(budget.totalMonthly)}</SectionTitle>
          <Bar ratio={budget.usedRatio} warn={budget.overflowAmount > 0} />
          <T size={0.85} color={c.muted}>of {formatEuro(state.monthlyRoom)} room</T>
        </Card>
        <Card style={{ flex: 1, padding: 16, gap: 6 }}>
          <T size={0.85} weight={700} color={c.muted}>Saving streak</T>
          <SectionTitle>{formatMonthCount(streakMonths)}</SectionTitle>
          <StreakDots history={history} />
        </Card>
      </Row>

      <WrappedBanner title={'Your ' + getYear(TODAY_MONTH_INDEX) + '\nDream Wrapped'} subtitle="Your year in dreams, in 7 slides. Tap to play." />

      <TradeOffCard describedDreams={describedDreams} budget={budget} />

      <Stack>
        {visibleDreams.length > 0 ? (
          visibleDreams.map((dream) => <DreamItem key={dream.id} dream={dream} />)
        ) : (
          <Card style={{ alignItems: 'center', paddingVertical: 28, gap: 12 }}>
            <T weight={700}>No finished dreams yet.</T>
            <T color={c.muted} style={{ textAlign: 'center' }}>When a pot is full, it shows up here. Your first one is on its way.</T>
          </Card>
        )}
      </Stack>

      <Button variant="outline" block icon="plus" label="Add a dream" onPress={() => go('add')} />
    </Screen>
  );
}

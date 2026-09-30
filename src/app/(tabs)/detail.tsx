import { View } from 'react-native';

import { Icon } from '@/components/icon';
import { Button, Card, LinkButton, Ring, RoundButton, Row, Screen, SectionTitle, Spread, Stack, Switch, T, TipCard } from '@/components/ui';
import { useActions } from '@/lib/actions';
import { calculateMilestones, formatEuro, formatMonth, formatMonthCount, getOpenTips, getSelectedDream } from '@/lib/dreams';
import { useApp } from '@/lib/store';
import { fixed, PASTEL_BACKGROUNDS, radius, useTheme } from '@/lib/theme';

export default function DetailScreen() {
  const { state } = useApp();
  const { c } = useTheme();
  const { go, openTips, toggleRoundUps, toggleShared, moveDate } = useActions();
  const dream = getSelectedDream(state);

  if (!dream) {
    return (
      <Screen>
        <RoundButton icon="back" iconSize={22} strokeWidth={2.4} label="Back" onPress={() => go('dreams')} />
        <T color={c.muted}>This dream doesn&apos;t exist any more.</T>
      </Screen>
    );
  }

  const milestones = calculateMilestones(dream);
  const halfOfMonthly = Math.ceil(dream.monthlyAmount / 2);
  const dreamTips = getOpenTips(state).filter((tip) => tip.dreamId === dream.id);

  return (
    <Screen>
      <Spread>
        <RoundButton icon="back" iconSize={22} strokeWidth={2.4} label="Back" onPress={() => go('dreams')} />
        <RoundButton icon="bulb" variant="dark" label="Tips for this dream" onPress={() => openTips(dream.id)} />
      </Spread>

      <Row gap={18} style={{ padding: 22, borderRadius: radius.xl, backgroundColor: PASTEL_BACKGROUNDS[dream.template.pastel] }}>
        <Ring percent={dream.progressPercent} size={120} strokeWidth={12} trackColor="rgba(255,255,255,0.75)" arcColor="#0B2A4A" labelColor={fixed.cardInk} />
        <View style={{ flex: 1, gap: 4 }}>
          <T size={1.45} weight={700} lh={1.2} color={fixed.cardInk} accessibilityRole="header">{dream.name}</T>
          <T weight={700} color={fixed.cardInk}>{formatMonth(dream.targetMonthIndex)}</T>
          <T color={fixed.cardMuted}>{formatMonthCount(dream.monthsLeft)} to go</T>
        </View>
      </Row>

      <Row style={{ alignItems: 'stretch' }}>
        <Card style={{ flex: 1, padding: 16, gap: 6 }}>
          <T size={0.85} weight={700} color={c.muted}>Saved</T>
          <SectionTitle>{formatEuro(dream.saved)}</SectionTitle>
          <T size={0.85} color={c.muted}>of {formatEuro(dream.cost)}</T>
        </Card>
        <Card style={{ flex: 1, padding: 16, gap: 6 }}>
          <T size={0.85} weight={700} color={c.muted}>Autosave</T>
          <SectionTitle>{formatEuro(dream.monthlyAmount)}</SectionTitle>
          <T size={0.85} color={c.muted}>on the 1st</T>
        </Card>
      </Row>

      {dream.scheduledExtras.length > 0 && (
        <T size={0.9} color={c.muted}>
          Also planned: {dream.scheduledExtras.map((extra) => formatEuro(extra.amount) + ' ' + extra.label.toLowerCase() + ' in ' + formatMonth(extra.monthIndex)).join(', ')}.
        </T>
      )}

      <Stack>
        <SectionTitle>Tips for this dream</SectionTitle>
        {dreamTips.map((tip) => <TipCard key={tip.id} tip={tip} showDreamName={false} />)}
        <Card>
          <Spread style={{ gap: 16 }}>
            <T style={{ flex: 1 }}>Round up card payments and put the change in this pot.</T>
            <Switch label="Round up card payments and put the change in this pot." value={dream.hasRoundUps} onToggle={toggleRoundUps} />
          </Spread>
        </Card>
      </Stack>

      <Card style={{ gap: 12 }}>
        <SectionTitle>Milestones</SectionTitle>
        <View style={{ gap: 14 }}>
          {milestones.map((milestone) => (
            <Row key={milestone.fraction}>
              <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center', borderColor: milestone.isReached ? c.strongFill : c.ink, backgroundColor: milestone.isReached ? c.strongFill : 'transparent' }}>
                {milestone.isReached && <Icon name="check" size={16} strokeWidth={3} color={c.strongFillInk} />}
              </View>
              <T weight={600} style={{ flex: 1 }}>
                {milestone.label} <T weight={400} color={c.muted}>({milestone.amountLabel})</T>
              </T>
              <T weight={700} color={c.muted}>{milestone.whenLabel}</T>
            </Row>
          ))}
        </View>
      </Card>

      {dream.isShared ? (
        <Card style={{ gap: 12 }}>
          <SectionTitle>Saving together</SectionTitle>
          <Spread>
            <Row>
              <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: fixed.peach }}>
                <T size={0.85} weight={700} color={fixed.cardInk}>S</T>
              </View>
              <T weight={700}>You · {formatEuro(halfOfMonthly)}</T>
            </Row>
            <Row>
              <T weight={700}>Tom · {formatEuro(dream.monthlyAmount - halfOfMonthly)}</T>
              <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: fixed.lilacSoft }}>
                <T size={0.85} weight={700} color={fixed.cardInk}>T</T>
              </View>
            </Row>
          </Spread>
          <View style={{ flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden' }}>
            <View style={{ width: `${(halfOfMonthly / Math.max(1, dream.monthlyAmount)) * 100}%`, backgroundColor: '#FF9E80' }} />
            <View style={{ flex: 1, backgroundColor: fixed.lilac }} />
          </View>
          <LinkButton label="Stop sharing" onPress={toggleShared} style={{ alignSelf: 'flex-start' }} />
        </Card>
      ) : (
        <Button variant="outline" block icon="people" label="Plan this dream together" onPress={toggleShared} />
      )}

      <Card style={{ gap: 12 }}>
        <SectionTitle>Plans change, and that&apos;s fine</SectionTitle>
        <T color={c.muted}>Move the date and we&apos;ll redo the maths for you.</T>
        <Row>
          <Button variant="outline" label="3 months earlier" onPress={() => moveDate(-3)} style={{ flex: 1, paddingHorizontal: 8 }} />
          <Button variant="outline" label="3 months later" onPress={() => moveDate(3)} style={{ flex: 1, paddingHorizontal: 8 }} />
        </Row>
      </Card>
    </Screen>
  );
}

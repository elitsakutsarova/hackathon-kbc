import Slider from '@react-native-community/slider';
import { Pressable, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Button, Card, PageTitle, RoundButton, Row, Screen, SectionTitle, Spread, Stack, T } from '@/components/ui';
import { useActions } from '@/lib/actions';
import {
  calculateDraftPlan,
  calculateMilestones,
  createDream,
  describeDream,
  DREAM_TEMPLATES,
  findTemplate,
  formatEuro,
  formatMonth,
  TODAY_MONTH_INDEX,
} from '@/lib/dreams';
import { useApp } from '@/lib/store';
import { fixed, font, PASTEL_BACKGROUNDS, radius, useTheme } from '@/lib/theme';

const STEP_COUNT = 3;
const MAXIMUM_MONTHS_AHEAD = 120;

function StepBar({ currentStep }: { currentStep: number }) {
  const { c } = useTheme();
  return (
    <Stack gap={6}>
      <View accessible={false} style={{ flexDirection: 'row', gap: 6 }}>
        {Array.from({ length: STEP_COUNT }, (unused, index) => (
          <View key={index} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: index + 1 <= currentStep ? c.strongFill : c.day }} />
        ))}
      </View>
      <T size={0.9} weight={700} color={c.muted}>Step {currentStep} of {STEP_COUNT}</T>
    </Stack>
  );
}

export default function AddScreen() {
  const { state } = useApp();
  const { c, rem } = useTheme();
  const { addBack, pickTemplate, updateDraft, addNext, saveDraft } = useActions();
  const draft = state.draft;
  const backButton = <RoundButton icon="back" iconSize={22} strokeWidth={2.4} label="Back" onPress={addBack} />;

  if (state.addStep === 1 || !draft) {
    return (
      <Screen>
        {backButton}
        <StepBar currentStep={1} />
        <View>
          <PageTitle>What are you dreaming of?</PageTitle>
          <T color={c.muted}>Pick one to start. You can change everything later.</T>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {DREAM_TEMPLATES.map((template) => (
            <Pressable
              key={template.id}
              accessibilityRole="button"
              onPress={() => pickTemplate(template.id)}
              style={({ pressed }) => [{ width: '47.5%', flexGrow: 1, minHeight: 120, padding: 16, justifyContent: 'space-between', alignItems: 'flex-start', borderRadius: radius.lg, backgroundColor: PASTEL_BACKGROUNDS[template.pastel] }, pressed && { opacity: 0.85 }]}
            >
              <Icon name={template.iconName} size={30} strokeWidth={1.8} color={fixed.cardInk} />
              <T size={1.05} weight={700} color={fixed.cardInk}>{template.label}</T>
            </Pressable>
          ))}
        </View>
      </Screen>
    );
  }

  const template = findTemplate(draft.templateId);
  const draftPlan = calculateDraftPlan(state, draft);
  const resultBackground = draftPlan.fitsInRoom ? c.goodBg : c.warnBg;

  if (state.addStep === 2) {
    return (
      <Screen>
        {backButton}
        <StepBar currentStep={2} />
        <PageTitle>Tell us a bit more</PageTitle>
        <Card style={{ gap: 22 }}>
          <Stack gap={6}>
            <T weight={600} nativeID="draftNameLabel">Name your dream</T>
            <TextInput
              accessibilityLabelledBy="draftNameLabel"
              value={draft.name}
              onChangeText={(name) => updateDraft({ name })}
              autoComplete="off"
              style={[font(500), { minHeight: 52, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1.5, borderColor: c.muted, backgroundColor: c.surface, color: c.ink, fontSize: rem(1) }]}
            />
          </Stack>
          <Stack gap={6}>
            <Spread>
              <T weight={600}>Roughly costs</T>
              <T size={1.2} weight={700}>{formatEuro(draft.cost)}</T>
            </Spread>
            <Slider
              accessibilityLabel="Roughly costs"
              style={{ height: 44 }}
              minimumValue={template.costStep}
              maximumValue={template.defaultCost * 3}
              step={template.costStep}
              value={draft.cost}
              onValueChange={(cost) => updateDraft({ cost })}
              minimumTrackTintColor={c.primary}
              thumbTintColor={c.primary}
            />
          </Stack>
          <Stack gap={6}>
            <Spread>
              <T weight={600}>When</T>
              <T size={1.2} weight={700}>{formatMonth(draft.targetMonthIndex)}</T>
            </Spread>
            <Slider
              accessibilityLabel="When"
              style={{ height: 44 }}
              minimumValue={1}
              maximumValue={MAXIMUM_MONTHS_AHEAD}
              step={1}
              value={draftPlan.monthsLeft}
              onValueChange={(monthsAhead) => updateDraft({ targetMonthIndex: TODAY_MONTH_INDEX + monthsAhead })}
              minimumTrackTintColor={c.primary}
              thumbTintColor={c.primary}
            />
          </Stack>
        </Card>
        <View accessibilityLiveRegion="polite" style={{ paddingVertical: 16, paddingHorizontal: 18, borderRadius: radius.md, backgroundColor: resultBackground }}>
          <SectionTitle>That&apos;s {formatEuro(draftPlan.draftMonthly)} a month</SectionTitle>
        </View>
        <Button block label="See my plan" onPress={addNext} />
      </Screen>
    );
  }

  const previewDream = describeDream(createDream({ id: 'preview', templateId: draft.templateId, name: draft.name, targetMonthIndex: draft.targetMonthIndex, cost: draft.cost }));
  return (
    <Screen>
      {backButton}
      <StepBar currentStep={3} />
      <PageTitle>Here&apos;s your plan</PageTitle>
      <Row gap={18} style={{ padding: 22, borderRadius: radius.xl, backgroundColor: PASTEL_BACKGROUNDS[template.pastel] }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={template.iconName} size={32} strokeWidth={1.8} color={fixed.cardInk} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <SectionTitle color={fixed.cardInk}>{draft.name.trim() || template.defaultName}</SectionTitle>
          <T weight={700} color={fixed.cardInk}>{formatEuro(draft.cost)} by {formatMonth(draft.targetMonthIndex)}</T>
        </View>
      </Row>
      <View style={{ gap: 4, paddingVertical: 16, paddingHorizontal: 18, borderRadius: radius.md, backgroundColor: resultBackground }}>
        <SectionTitle>{formatEuro(draftPlan.draftMonthly)} a month, automatically</SectionTitle>
        <T>{draftPlan.fitsInRoom ? 'This fits in your monthly room. Nice.' : 'This is a stretch. We\'ll show you some honest options.'}</T>
      </View>
      <Card style={{ gap: 12 }}>
        <SectionTitle>Milestones</SectionTitle>
        <View style={{ gap: 14 }}>
          {calculateMilestones(previewDream).map((milestone) => (
            <Row key={milestone.fraction}>
              <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: c.ink }} />
              <T weight={600} style={{ flex: 1 }}>{milestone.label}</T>
              <T weight={700} color={c.muted}>{milestone.whenLabel}</T>
            </Row>
          ))}
        </View>
      </Card>
      <Button block label="Add to my dreams" onPress={saveDraft} />
    </Screen>
  );
}

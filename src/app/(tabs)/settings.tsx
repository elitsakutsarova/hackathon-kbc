import { Button, Card, PageTitle, Screen, SectionTitle, Spread, Segmented, Switch, T, TopBar, WrappedBanner } from '@/components/ui';
import { useActions } from '@/lib/actions';
import { NUDGE_LEVELS, type NudgeLevel } from '@/lib/dreams';
import { useApp } from '@/lib/store';
import { useTheme } from '@/lib/theme';

const NUDGE_OPTIONS = (Object.keys(NUDGE_LEVELS) as NudgeLevel[]).map((level) => ({ value: level, label: NUDGE_LEVELS[level].label }));

export default function SettingsScreen() {
  const { state } = useApp();
  const { c } = useTheme();
  const { setNudge, toggleLargeText, resetDemo } = useActions();

  return (
    <Screen>
      <TopBar />
      <PageTitle>Settings</PageTitle>

      <Card style={{ gap: 12 }}>
        <SectionTitle>How often can we nudge you?</SectionTitle>
        <T color={c.muted}>We only send tips that move a dream forward. You decide how many.</T>
        <Segmented label="How often can we nudge you?" options={NUDGE_OPTIONS} value={state.nudgeLevel} onChange={setNudge} />
      </Card>

      <Card style={{ gap: 12 }}>
        <SectionTitle>Easier reading</SectionTitle>
        <Spread>
          <T style={{ flex: 1 }}>Bigger text everywhere</T>
          <Switch label="Bigger text everywhere" value={state.isLargeText} onToggle={toggleLargeText} />
        </Spread>
      </Card>

      <WrappedBanner title={'Replay your\nDream Wrapped'} subtitle="Your year in dreams." />

      <Card style={{ gap: 12 }}>
        <SectionTitle>Demo data</SectionTitle>
        <T color={c.muted}>Start again with the example dreams.</T>
        <Button variant="outline" label="Reset demo" onPress={resetDemo} style={{ alignSelf: 'flex-start' }} />
      </Card>
    </Screen>
  );
}

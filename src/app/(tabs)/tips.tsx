import { Fragment } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Card, PageTitle, Screen, SectionTitle, Stack, T, TipCard, TopBar } from '@/components/ui';
import { useActions } from '@/lib/actions';
import { formatLongMonth, getDescribedDreams, getTipFeed, type Tip } from '@/lib/dreams';
import { useApp } from '@/lib/store';
import { useTheme } from '@/lib/theme';

export default function TipsScreen() {
  const { state } = useApp();
  const { c } = useTheme();
  const { go, setTipsFilter } = useActions();

  const tipFeed = getTipFeed(state);
  const filterDreamId = state.tipsFilterDreamId;
  const matchesFilter = (tip: Tip) => filterDreamId === 'all' || tip.dreamId === filterDreamId;
  const dueTips = tipFeed.shownDueTips.filter(matchesFilter);
  const upcomingTips = tipFeed.upcomingTips.filter(matchesFilter);
  const filterOptions = [{ id: 'all', name: 'All tips' }, ...getDescribedDreams(state).map((dream) => ({ id: dream.id, name: dream.name }))];
  const showDreamName = filterDreamId === 'all';

  return (
    <Screen>
      <TopBar />
      <View>
        <PageTitle>Tips</PageTitle>
        <T color={c.muted}>Small, well-timed moves for your dreams.</T>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingTop: 2, paddingBottom: 6 }}>
        {filterOptions.map((option) => {
          const isSelected = option.id === filterDreamId;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => setTipsFilter(option.id)}
              style={{ minHeight: 44, paddingHorizontal: 16, borderRadius: 22, justifyContent: 'center', borderWidth: 1.5, borderColor: isSelected ? c.strongFill : c.ink, backgroundColor: isSelected ? c.strongFill : 'transparent' }}
            >
              <T size={0.9} weight={600} color={isSelected ? c.strongFillInk : c.ink}>{option.name}</T>
            </Pressable>
          );
        })}
      </ScrollView>

      <Stack>
        <SectionTitle>Right now</SectionTitle>
        {dueTips.length > 0 ? (
          dueTips.map((tip) => <TipCard key={tip.id} tip={tip} showDreamName={showDreamName} />)
        ) : (
          <Card style={{ alignItems: 'center', paddingVertical: 28, gap: 12 }}>
            <T weight={700}>You&apos;re all caught up.</T>
            <T color={c.muted} style={{ textAlign: 'center' }}>We&apos;ll let you know when a good moment comes.</T>
          </Card>
        )}
        {tipFeed.waitingCount > 0 && showDreamName && (
          <T color={c.muted}>
            {tipFeed.waitingCount} more {tipFeed.waitingCount === 1 ? 'tip is' : 'tips are'} waiting. You asked for fewer nudges, so we&apos;re keeping them for later.{' '}
            <T weight={600} color={c.primary} onPress={() => go('settings')} accessibilityRole="link">Change this</T>
          </T>
        )}
      </Stack>

      {upcomingTips.length > 0 && (
        <Stack>
          <SectionTitle>Coming up</SectionTitle>
          {/* Group by month: print a heading whenever the month changes. */}
          {upcomingTips.map((tip, index) => (
            <Fragment key={tip.id}>
              {(index === 0 || upcomingTips[index - 1].monthIndex !== tip.monthIndex) && (
                <T size={0.95} weight={700} color={c.muted} style={{ marginTop: 4 }}>{formatLongMonth(tip.monthIndex)}</T>
              )}
              <TipCard tip={tip} showDreamName={showDreamName} />
            </Fragment>
          ))}
        </Stack>
      )}
    </Screen>
  );
}

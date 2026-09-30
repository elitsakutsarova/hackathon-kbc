import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { T } from '@/components/ui';
import { useActions, type ScreenName } from '@/lib/actions';
import { getTipFeed } from '@/lib/dreams';
import type { IconName } from '@/lib/icons';
import { useApp } from '@/lib/store';
import { fixed, useTheme } from '@/lib/theme';

const TAB_ITEMS: { screen: ScreenName; iconName: IconName; label: string }[] = [
  { screen: 'home', iconName: 'home', label: 'Home' },
  { screen: 'dreams', iconName: 'stats', label: 'Dreams' },
  { screen: 'tips', iconName: 'bulb', label: 'Tips' },
  { screen: 'settings', iconName: 'gear', label: 'Settings' },
];

// Detail belongs to Dreams, Add belongs to Home.
const TAB_FOR_ROUTE: Record<string, ScreenName> = { index: 'home', dreams: 'dreams', detail: 'dreams', add: 'home', tips: 'tips', settings: 'settings' };

function TabBar({ state }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { c, isDark } = useTheme();
  const { state: appState } = useApp();
  const { go, openTips } = useActions();
  const currentTab = TAB_FOR_ROUTE[state.routes[state.index].name];
  const newTipCount = getTipFeed(appState).shownDueTips.length;

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 12, paddingBottom: 12 + insets.bottom, alignItems: 'center' }}>
      <View
        accessibilityRole="tablist"
        style={{
          width: '100%', maxWidth: 416, height: 70, paddingHorizontal: 10, borderRadius: 35,
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: c.tabbar, boxShadow: isDark ? undefined : '0px 12px 30px rgba(11, 42, 74, 0.25)',
        }}
      >
        {TAB_ITEMS.map((tabItem) => {
          const isCurrent = tabItem.screen === currentTab;
          const showBadge = tabItem.screen === 'tips' && newTipCount > 0;
          return (
            <Pressable
              key={tabItem.screen}
              accessibilityRole="tab"
              accessibilityState={{ selected: isCurrent }}
              accessibilityLabel={tabItem.label + (showBadge ? ', ' + newTipCount + ' new' : '')}
              onPress={() => (tabItem.screen === 'tips' ? openTips('all') : go(tabItem.screen))}
              style={{
                minWidth: 52, height: 50, paddingHorizontal: isCurrent ? 18 : 14, borderRadius: 25,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                backgroundColor: isCurrent ? '#FFFFFF' : 'transparent',
              }}
            >
              <Icon name={tabItem.iconName} size={24} strokeWidth={2} color={isCurrent ? '#0B2A4A' : c.tabbarIcon} />
              {isCurrent && <T size={0.9} weight={600} color="#0B2A4A">{tabItem.label}</T>}
              {showBadge && (
                <View style={{ position: 'absolute', top: 6, right: 8, minWidth: 18, height: 18, paddingHorizontal: 5, borderRadius: 9, backgroundColor: fixed.badge, alignItems: 'center', justifyContent: 'center' }}>
                  <T size={0.7} weight={700} lh={1.2} color="#FFFFFF">{newTipCount}</T>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { c } = useTheme();
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.bg } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="dreams" />
      <Tabs.Screen name="tips" />
      <Tabs.Screen name="settings" />
      <Tabs.Screen name="detail" />
      <Tabs.Screen name="add" />
    </Tabs>
  );
}

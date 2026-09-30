import { router } from 'expo-router';

import {
  calculateBudget,
  calculateMonthsAhead,
  calculateTradeOff,
  createDream,
  createInitialState,
  findDescribedDream,
  findTemplate,
  formatEuro,
  formatMonth,
  formatMonthCount,
  getDescribedDreams,
  NUDGE_LEVELS,
  TODAY_DAY_OF_MONTH,
  TODAY_MONTH_INDEX,
  type AppState,
  type Dream,
  type Draft,
  type NudgeLevel,
  type Tip,
} from './dreams';
import { useApp } from './store';

export type ScreenName = 'home' | 'dreams' | 'tips' | 'settings' | 'detail' | 'add';

const SCREEN_PATHS = {
  home: '/',
  dreams: '/dreams',
  tips: '/tips',
  settings: '/settings',
  detail: '/detail',
  add: '/add',
} as const;

export type Point = { x: number; y: number };

function updateDream(state: AppState, dreamId: string, changeDream: (dream: Dream) => Dream): AppState {
  return { ...state, dreams: state.dreams.map((dream) => (dream.id === dreamId ? changeDream({ ...dream }) : dream)) };
}

// Every button in the app calls one of these (the React Native version of APP_ACTIONS).
export function useActions() {
  const { state, replace, update, showToast, launchConfetti, setWrappedOpen } = useApp();

  const go = (screenName: ScreenName) => {
    if (screenName === 'add') {
      update((current) => ({ ...current, addStep: 1, draft: null }));
    }
    router.navigate(SCREEN_PATHS[screenName]);
  };

  const openDream = (dreamId: string) => {
    update((current) => ({ ...current, selectedDreamId: dreamId }));
    router.navigate(SCREEN_PATHS.detail);
  };

  const openTips = (dreamId = 'all') => {
    update((current) => ({ ...current, tipsFilterDreamId: dreamId }));
    router.navigate(SCREEN_PATHS.tips);
  };

  const addWeekend = () => {
    update((current) => ({
      ...current,
      draft: { templateId: 'travel', name: 'Weekend away', cost: 400, targetMonthIndex: TODAY_MONTH_INDEX + 3 },
      addStep: 2,
    }));
    router.navigate(SCREEN_PATHS.add);
  };

  const runTip = (tip: Tip, origin: Point) => {
    const markTip = (current: AppState, status: 'done' | 'planned') => ({ ...current, tipStatus: { ...current.tipStatus, [tip.id]: status } });

    if (tip.actionType === 'add-money' && tip.dreamId && tip.amount) {
      const dream = findDescribedDream(state, tip.dreamId);
      const monthsAhead = dream ? calculateMonthsAhead(tip.amount, dream) : 1;
      const amount = tip.amount;
      launchConfetti(origin.x, origin.y);
      let next = updateDream(state, tip.dreamId, (storedDream) => ({ ...storedDream, saved: storedDream.saved + amount }));
      next = {
        ...markTip(next, 'done'),
        currentBalance: next.currentBalance - amount,
        moneyMoves: [...next.moneyMoves, { monthIndex: TODAY_MONTH_INDEX, day: TODAY_DAY_OF_MONTH, amount, dreamId: tip.dreamId }],
      };
      replace(next);
      showToast(formatEuro(amount) + ' moved to ' + tip.dreamName + '. About ' + formatMonthCount(monthsAhead) + ' ahead!');
      return;
    }
    if (tip.actionType === 'schedule-money' && tip.dreamId && tip.amount) {
      const monthlyBefore = findDescribedDream(state, tip.dreamId)?.monthlyAmount ?? 0;
      launchConfetti(origin.x, origin.y);
      const extra = { monthIndex: tip.monthIndex, day: tip.day, amount: tip.amount, label: tip.extraLabel ?? '' };
      const next = markTip(updateDream(state, tip.dreamId, (storedDream) => ({ ...storedDream, scheduledExtras: [...storedDream.scheduledExtras, extra] })), 'planned');
      const monthlyAfter = findDescribedDream(next, tip.dreamId)?.monthlyAmount ?? 0;
      replace(next);
      showToast('Planned for ' + formatMonth(tip.monthIndex) + '. Monthly amount: ' + formatEuro(monthlyBefore) + ' → ' + formatEuro(monthlyAfter) + '.');
      return;
    }

    let next = markTip(state, 'done');
    if (tip.actionType === 'add-weekend') {
      replace(next);
      addWeekend();
      return;
    }
    if (tip.actionType === 'roundups' && tip.dreamId) {
      next = updateDream(next, tip.dreamId, (storedDream) => ({ ...storedDream, hasRoundUps: true }));
      showToast('Round-ups are on for ' + tip.dreamName);
    } else if (tip.actionType === 'flight-reminder' && tip.dreamId) {
      next = updateDream(next, tip.dreamId, (storedDream) => ({ ...storedDream, wantsFlightReminder: true }));
      showToast('We\'ll remind you in ' + formatMonth(tip.monthIndex));
    } else if (tip.actionType === 'share' && tip.dreamId) {
      next = updateDream(next, tip.dreamId, (storedDream) => ({ ...storedDream, isShared: true }));
      showToast('Invite sent to Tom');
    } else {
      showToast('Got it');
    }
    replace(next);
  };

  return {
    go,
    openDream,
    openTips,
    addWeekend,
    runTip,
    openWrapped: () => setWrappedOpen(true),
    closeWrapped: () => setWrappedOpen(false),

    changeMonth: (months: number) => update((current) => ({
      ...current,
      calendarMonthIndex: Math.max(TODAY_MONTH_INDEX, current.calendarMonthIndex + months),
    })),
    setDreamsTab: (value: AppState['dreamsTab']) => update((current) => ({ ...current, dreamsTab: value })),
    setTipsFilter: (dreamId: string) => update((current) => ({ ...current, tipsFilterDreamId: dreamId })),

    dismissTip: (tipId: string) => {
      update((current) => ({ ...current, tipStatus: { ...current.tipStatus, [tipId]: 'dismissed' } }));
      showToast('Hidden. We won\'t show that one again.');
    },
    setNudge: (level: NudgeLevel) => {
      update((current) => ({ ...current, nudgeLevel: level }));
      showToast('We\'ll nudge you ' + NUDGE_LEVELS[level].label.toLowerCase());
    },
    toggleLargeText: () => update((current) => ({ ...current, isLargeText: !current.isLargeText })),
    resetDemo: () => {
      replace(createInitialState());
      router.navigate(SCREEN_PATHS.home);
      showToast('Demo reset');
    },

    pickTemplate: (templateId: string) => {
      const template = findTemplate(templateId);
      update((current) => ({
        ...current,
        draft: { templateId: template.id, name: template.defaultName, cost: template.defaultCost, targetMonthIndex: TODAY_MONTH_INDEX + template.defaultMonthsAhead },
        addStep: 2,
      }));
    },
    updateDraft: (change: Partial<Draft>) => update((current) => (current.draft ? { ...current, draft: { ...current.draft, ...change } } : current)),
    addBack: () => {
      if (state.addStep > 1 && state.draft) {
        update((current) => ({ ...current, addStep: (current.addStep - 1) as AppState['addStep'] }));
      } else {
        go('home');
      }
    },
    addNext: () => update((current) => ({ ...current, addStep: 3 })),
    saveDraft: () => {
      const draft = state.draft;
      if (!draft) return;
      const dreamName = draft.name.trim() || findTemplate(draft.templateId).defaultName;
      update((current) => ({
        ...current,
        dreams: [...current.dreams, createDream({ id: 'dream-' + Date.now(), templateId: draft.templateId, name: dreamName, targetMonthIndex: draft.targetMonthIndex, cost: draft.cost })],
        addStep: 1,
        draft: null,
      }));
      router.navigate(SCREEN_PATHS.dreams);
      showToast(dreamName + ' is in your dreams');
    },

    toggleRoundUps: () => update((current) => updateDream(current, current.selectedDreamId, (storedDream) => ({ ...storedDream, hasRoundUps: !storedDream.hasRoundUps }))),
    toggleShared: () => {
      const wasShared = state.dreams.find((dream) => dream.id === state.selectedDreamId)?.isShared;
      update((current) => updateDream(current, current.selectedDreamId, (storedDream) => ({ ...storedDream, isShared: !storedDream.isShared })));
      showToast(wasShared ? 'Only you can see this dream now' : 'Invite sent to Tom');
    },
    moveDate: (months: number) => {
      const dream = state.dreams.find((candidate) => candidate.id === state.selectedDreamId);
      if (!dream) return;
      const targetMonthIndex = Math.max(TODAY_MONTH_INDEX + 1, dream.targetMonthIndex + months);
      update((current) => updateDream(current, dream.id, (storedDream) => ({ ...storedDream, targetMonthIndex })));
      showToast('New date: ' + formatMonth(targetMonthIndex));
    },
    tradeOffMove: () => {
      const describedDreams = getDescribedDreams(state);
      const tradeOff = calculateTradeOff(describedDreams, calculateBudget(state, describedDreams));
      if (!tradeOff) return;
      update((current) => updateDream(current, tradeOff.flexibleDream.id, (storedDream) => ({ ...storedDream, targetMonthIndex: tradeOff.newTargetMonthIndex })));
      showToast(tradeOff.flexibleDream.name + ' moved to ' + formatMonth(tradeOff.newTargetMonthIndex));
    },
    tradeOffSaveMore: () => {
      const monthlyRoom = state.monthlyRoom + calculateBudget(state, getDescribedDreams(state)).overflowAmount;
      update((current) => ({ ...current, monthlyRoom }));
      showToast('Got it: ' + formatEuro(monthlyRoom) + ' a month for your dreams');
    },
  };
}

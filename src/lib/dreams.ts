import type { IconName } from './icons';

// =============================================================
// 1. DATES AS NUMBERS
// Every month becomes one number (year × 12 + month). "How many months
// between two dates" is then just a subtraction.
// =============================================================
export function toMonthIndex(year: number, monthNumber: number) {
  return year * 12 + (monthNumber - 1);
}

export const TODAY_MONTH_INDEX = toMonthIndex(2026, 9); // demo "today": 30 September 2026
export const TODAY_DAY_OF_MONTH = 30;
export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const LONG_MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SHORT_WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// Monday first, as in Belgium.
export const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function getYear(monthIndex: number) {
  return Math.floor(monthIndex / 12);
}

export function getLongMonthName(monthIndex: number) {
  return LONG_MONTH_NAMES[monthIndex % 12];
}

export function formatMonth(monthIndex: number) {
  return MONTH_NAMES[monthIndex % 12] + ' ' + getYear(monthIndex);
}

export function formatLongMonth(monthIndex: number) {
  return getLongMonthName(monthIndex) + ' ' + getYear(monthIndex);
}

export function formatDayLabel(monthIndex: number, dayNumber: number) {
  const weekday = new Date(getYear(monthIndex), monthIndex % 12, dayNumber).getDay();
  return SHORT_WEEKDAY_NAMES[weekday] + ' ' + dayNumber + ' ' + getLongMonthName(monthIndex);
}

// Written by hand so it looks the same on every phone (no Intl needed).
export function formatEuro(amount: number) {
  return '€' + Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatMonthCount(monthCount: number) {
  return monthCount + (monthCount === 1 ? ' month' : ' months');
}

export function padTwoDigits(number: number) {
  return String(number).padStart(2, '0');
}

export function getDaysInMonth(monthIndex: number) {
  // Day 0 of next month = the last day of this month.
  return new Date(getYear(monthIndex), monthIndex % 12 + 1, 0).getDate();
}

// The next time a calendar month comes round (e.g. "next May").
function getNextOccurrence(monthNumber: number) {
  let candidateMonthIndex = toMonthIndex(getYear(TODAY_MONTH_INDEX), monthNumber);
  if (candidateMonthIndex < TODAY_MONTH_INDEX) {
    candidateMonthIndex += 12;
  }
  return candidateMonthIndex;
}

export function sumOf(numbers: number[]) {
  return numbers.reduce((total, number) => total + number, 0);
}

// =============================================================
// 3. DREAM TEMPLATES (the reusable "playbooks")
// =============================================================
export type Pastel = 'sky' | 'sun' | 'peach' | 'mint' | 'lilac';

export type DreamTemplate = {
  id: string;
  label: string;
  defaultName: string;
  defaultCost: number;
  costStep: number;
  defaultMonthsAhead: number;
  pastel: Pastel;
  iconName: IconName;
};

export const DREAM_TEMPLATES: DreamTemplate[] = [
  { id: 'travel', label: 'Travel', defaultName: 'A big trip', defaultCost: 3000, costStep: 100, defaultMonthsAhead: 12, pastel: 'sky', iconName: 'plane' },
  { id: 'home', label: 'A home', defaultName: 'Our first home', defaultCost: 25000, costStep: 500, defaultMonthsAhead: 60, pastel: 'sun', iconName: 'house' },
  { id: 'wedding', label: 'Wedding', defaultName: 'Our wedding', defaultCost: 18000, costStep: 500, defaultMonthsAhead: 24, pastel: 'peach', iconName: 'heart' },
  { id: 'car', label: 'A car', defaultName: 'A new car', defaultCost: 15000, costStep: 500, defaultMonthsAhead: 30, pastel: 'mint', iconName: 'car' },
  { id: 'study', label: 'Study', defaultName: 'Study abroad', defaultCost: 8000, costStep: 250, defaultMonthsAhead: 24, pastel: 'lilac', iconName: 'study' },
  { id: 'sabbatical', label: 'Time off', defaultName: 'A sabbatical', defaultCost: 10000, costStep: 500, defaultMonthsAhead: 36, pastel: 'mint', iconName: 'sun' },
];

export function findTemplate(templateId: string) {
  return DREAM_TEMPLATES.find((template) => template.id === templateId) ?? DREAM_TEMPLATES[0];
}

// =============================================================
// 4. STATE
// =============================================================
export const LEFTOVER_AMOUNT = 150;
const MILESTONE_COUNT = 4;
const HOLIDAY_PAY_AMOUNT = 400;
const YEAR_END_BONUS_AMOUNT = 300;

export const NUDGE_LEVELS = {
  rarely: { label: 'Rarely', tipsPerMonth: 1 },
  sometimes: { label: 'Sometimes', tipsPerMonth: 3 },
  often: { label: 'Often', tipsPerMonth: 6 },
};
export type NudgeLevel = keyof typeof NUDGE_LEVELS;

export type ScheduledExtra = { monthIndex: number; day: number; amount: number; label: string };

export type Dream = {
  id: string;
  templateId: string;
  name: string;
  targetMonthIndex: number;
  cost: number;
  saved: number;
  isShared: boolean;
  hasRoundUps: boolean;
  wantsFlightReminder: boolean;
  scheduledExtras: ScheduledExtra[]; // money planned for later, e.g. holiday pay in May
};

export type Draft = { templateId: string; name: string; cost: number; targetMonthIndex: number };
export type TipStatus = 'open' | 'done' | 'planned' | 'dismissed';

export type AppState = {
  selectedDreamId: string;
  monthlyRoom: number;
  currentBalance: number;
  addStep: 1 | 2 | 3;
  draft: Draft | null;
  calendarMonthIndex: number;
  selectedCalendarDay: number;
  isMonthStripOpen: boolean;
  dreamsTab: 'progress' | 'done';
  tipsFilterDreamId: string;
  nudgeLevel: NudgeLevel;
  isLargeText: boolean;
  tipStatus: Record<string, TipStatus>;
  moneyMoves: { monthIndex: number; day: number; amount: number; dreamId: string }[];
  dreams: Dream[];
};

export function createDream(details: Pick<Dream, 'id' | 'templateId' | 'name' | 'targetMonthIndex' | 'cost'> & Partial<Dream>): Dream {
  return { saved: 0, isShared: false, hasRoundUps: false, wantsFlightReminder: false, scheduledExtras: [], ...details };
}

export function createInitialState(): AppState {
  return {
    selectedDreamId: 'japan',
    monthlyRoom: 950,
    currentBalance: 1243.85,
    addStep: 1,
    draft: null,
    calendarMonthIndex: TODAY_MONTH_INDEX,
    selectedCalendarDay: TODAY_DAY_OF_MONTH,
    isMonthStripOpen: false,
    dreamsTab: 'progress',
    tipsFilterDreamId: 'all',
    nudgeLevel: 'sometimes',
    isLargeText: false,
    tipStatus: {},
    moneyMoves: [],
    dreams: [
      createDream({ id: 'japan', templateId: 'travel', name: 'Japan with Emma', targetMonthIndex: toMonthIndex(2028, 4), cost: 6400, saved: 1850 }),
      createDream({ id: 'sabbatical', templateId: 'sabbatical', name: 'Sabbatical in Portugal', targetMonthIndex: toMonthIndex(2029, 9), cost: 15000, saved: 2100 }),
    ],
  };
}

// What was in the pots when the demo starts (used to build the savings history).
const STARTING_POTS_TOTAL = sumOf(createInitialState().dreams.map((dream) => dream.saved));

// =============================================================
// 5. DREAM CALCULATIONS
// =============================================================
export type DescribedDream = Dream & {
  template: DreamTemplate;
  monthsLeft: number;
  remainingAmount: number;
  amountStillNeeded: number;
  monthlyAmount: number;
  progressRatio: number;
  progressPercent: number;
  isComplete: boolean;
};

// Takes one stored dream and adds everything the screens need.
export function describeDream(dream: Dream): DescribedDream {
  const monthsLeft = Math.max(1, dream.targetMonthIndex - TODAY_MONTH_INDEX);
  const remainingAmount = Math.max(0, dream.cost - dream.saved);
  // Money that is already planned (holiday pay, bonus) lowers what we need each month.
  const scheduledTotal = sumOf(dream.scheduledExtras
    .filter((extra) => extra.monthIndex <= dream.targetMonthIndex)
    .map((extra) => extra.amount));
  const amountStillNeeded = Math.max(0, remainingAmount - scheduledTotal);
  const progressRatio = Math.min(1, dream.saved / dream.cost);
  return {
    ...dream,
    template: findTemplate(dream.templateId),
    monthsLeft,
    remainingAmount,
    amountStillNeeded,
    monthlyAmount: Math.ceil(amountStillNeeded / monthsLeft),
    progressRatio,
    progressPercent: Math.round(progressRatio * 100),
    isComplete: remainingAmount === 0,
  };
}

export function getDescribedDreams(state: AppState) {
  return state.dreams
    .map(describeDream)
    .sort((firstDream, secondDream) => firstDream.targetMonthIndex - secondDream.targetMonthIndex);
}

export function findDescribedDream(state: AppState, dreamId: string) {
  return getDescribedDreams(state).find((dream) => dream.id === dreamId);
}

export function getSelectedDream(state: AppState) {
  return findDescribedDream(state, state.selectedDreamId) ?? getDescribedDreams(state)[0];
}

export type Budget = { totalMonthly: number; overflowAmount: number; usedRatio: number };

export function calculateBudget(state: AppState, describedDreams: DescribedDream[]): Budget {
  const totalMonthly = sumOf(describedDreams.map((dream) => dream.monthlyAmount));
  return {
    totalMonthly,
    overflowAmount: totalMonthly - state.monthlyRoom,
    usedRatio: Math.min(1, totalMonthly / state.monthlyRoom),
  };
}

// When the dreams need more than the monthly room, the dream furthest away
// gets only what is left over, and we calculate how much later it lands.
export function calculateTradeOff(describedDreams: DescribedDream[], budget: Budget) {
  if (budget.overflowAmount <= 0 || describedDreams.length === 0) {
    return null;
  }
  const flexibleDream = describedDreams[describedDreams.length - 1];
  const stretchedMonthly = flexibleDream.monthlyAmount - budget.overflowAmount;
  const canMoveDate = stretchedMonthly > 0;
  const newMonthsLeft = canMoveDate ? Math.ceil(flexibleDream.amountStillNeeded / stretchedMonthly) : flexibleDream.monthsLeft;
  return {
    flexibleDream,
    canMoveDate,
    delayMonths: newMonthsLeft - flexibleDream.monthsLeft,
    newTargetMonthIndex: TODAY_MONTH_INDEX + newMonthsLeft,
  };
}

export type Milestone = {
  fraction: number;
  label: string;
  amountLabel: string;
  isReached: boolean;
  whenMonthIndex: number;
  whenLabel: string;
};

export function calculateMilestones(dream: DescribedDream): Milestone[] {
  const milestoneFractions = Array.from({ length: MILESTONE_COUNT }, (unused, stepNumber) => (stepNumber + 1) / MILESTONE_COUNT);
  return milestoneFractions.map((fraction) => {
    const milestoneAmount = dream.cost * fraction;
    const isReached = dream.saved >= milestoneAmount;
    const monthsUntilReached = dream.monthlyAmount > 0
      ? Math.min(dream.monthsLeft, Math.ceil((milestoneAmount - dream.saved) / dream.monthlyAmount))
      : dream.monthsLeft;
    const whenMonthIndex = isReached ? TODAY_MONTH_INDEX : TODAY_MONTH_INDEX + monthsUntilReached;
    return {
      fraction,
      label: fraction === 1 ? 'Dream funded' : Math.round(fraction * 100) + '% there',
      amountLabel: formatEuro(milestoneAmount),
      isReached,
      whenMonthIndex,
      whenLabel: isReached ? 'Done' : formatMonth(whenMonthIndex),
    };
  });
}

export function getNextMilestone(dream: DescribedDream) {
  return calculateMilestones(dream).find((milestone) => !milestone.isReached);
}

export function calculateMonthsAhead(amount: number, dream: DescribedDream) {
  return dream.monthlyAmount > 0 ? Math.max(1, Math.round(amount / dream.monthlyAmount)) : 1;
}

export type HistoryMonth = { monthIndex: number; amount: number };

// Monthly savings since January. Part of what's in the pots was saved this
// year; we spread it over the months with a gentle wave (not every month is
// the same), then add the extra moves the user made in the app.
export function getSavingsHistory(state: AppState): HistoryMonth[] {
  const firstMonthIndex = toMonthIndex(getYear(TODAY_MONTH_INDEX), 1);
  const monthCount = TODAY_MONTH_INDEX - firstMonthIndex + 1;
  const shareSavedThisYear = 0.85;
  const waveStrength = 0.18;
  const monthWeights = Array.from({ length: monthCount }, (unused, monthOffset) => 1 + waveStrength * Math.sin(monthOffset * 1.3));
  const weightTotal = sumOf(monthWeights);
  const roundTo = 5;
  return monthWeights.map((weight, monthOffset) => {
    const monthIndex = firstMonthIndex + monthOffset;
    const baseAmount = Math.round((STARTING_POTS_TOTAL * shareSavedThisYear * weight / weightTotal) / roundTo) * roundTo;
    const movedAmount = sumOf(state.moneyMoves.filter((move) => move.monthIndex === monthIndex).map((move) => move.amount));
    return { monthIndex, amount: baseAmount + movedAmount };
  });
}

// =============================================================
// 6. TIPS + CALENDAR EVENTS
// Every tip is generated from the user's dreams and the Belgian money
// calendar (holiday pay in May, end-of-year bonus in December).
// =============================================================
/** Text with bold parts: plain strings, or { bold } for emphasised words. */
export type RichText = (string | { bold: string })[];

// This order is also the priority when several tips are due at once.
export const TIP_KINDS = {
  celebrate: { label: 'Milestone', pastel: 'sun' },
  money: { label: 'Money moment', pastel: 'mint' },
  time: { label: 'Time for you', pastel: 'peach' },
  habit: { label: 'Small habit', pastel: 'sky' },
  together: { label: 'Together', pastel: 'lilac' },
  booking: { label: 'Good timing', pastel: 'sky' },
} as const;
export type TipKind = keyof typeof TIP_KINDS;
const TIP_KIND_ORDER = Object.keys(TIP_KINDS) as TipKind[];

export type TipAction = 'add-money' | 'schedule-money' | 'roundups' | 'add-weekend' | 'acknowledge' | 'flight-reminder' | 'share';

export type Tip = {
  id: string;
  kind: TipKind;
  dreamId: string | null;
  dreamName: string | null;
  monthIndex: number;
  day: number;
  iconName: IconName;
  title: string;
  body: RichText;
  actionType: TipAction;
  primaryLabel: string;
  amount?: number;
  extraLabel?: string;
};

function pickTipDay(monthIndex: number, preferredDay: number) {
  return monthIndex === TODAY_MONTH_INDEX ? TODAY_DAY_OF_MONTH : preferredDay;
}

function createMoneyTip(tipDetails: { id: string; dream: DescribedDream; amount: number; monthIndex: number; day: number; title: string; sentence: string; extraLabel?: string }): Tip {
  const dream = tipDetails.dream;
  const isNow = tipDetails.monthIndex === TODAY_MONTH_INDEX;
  return {
    id: tipDetails.id,
    kind: 'money',
    dreamId: dream.id,
    dreamName: dream.name,
    monthIndex: tipDetails.monthIndex,
    day: pickTipDay(tipDetails.monthIndex, tipDetails.day),
    iconName: 'coins',
    title: tipDetails.title,
    body: [tipDetails.sentence + ' Putting ', { bold: formatEuro(tipDetails.amount) }, ' into "' + dream.name + '" gets you about ' + formatMonthCount(calculateMonthsAhead(tipDetails.amount, dream)) + ' ahead.'],
    amount: tipDetails.amount,
    extraLabel: tipDetails.extraLabel,
    actionType: isNow ? 'add-money' : 'schedule-money',
    primaryLabel: isNow ? 'Move ' + formatEuro(tipDetails.amount) : 'Plan it for ' + MONTH_NAMES[tipDetails.monthIndex % 12],
  };
}

export function generateAllTips(state: AppState): Tip[] {
  const describedDreams = getDescribedDreams(state);
  const unfinishedDreams = describedDreams.filter((dream) => !dream.isComplete);
  const allTips: Tip[] = [];

  if (unfinishedDreams.length > 0) {
    const soonestDream = unfinishedDreams[0];
    // The dream that needs the most per month benefits most from a bonus.
    const hungriestDream = unfinishedDreams.slice().sort((firstDream, secondDream) => secondDream.monthlyAmount - firstDream.monthlyAmount)[0];

    allTips.push(createMoneyTip({
      id: 'leftover-' + TODAY_MONTH_INDEX, dream: soonestDream, amount: LEFTOVER_AMOUNT, monthIndex: TODAY_MONTH_INDEX, day: TODAY_DAY_OF_MONTH,
      title: formatEuro(LEFTOVER_AMOUNT) + ' left over this month',
      sentence: 'It\'s the end of the month and there\'s still money to spare in your current account.',
    }));
    allTips.push(createMoneyTip({
      id: 'year-end-bonus', dream: hungriestDream, amount: YEAR_END_BONUS_AMOUNT, monthIndex: getNextOccurrence(12), day: 18,
      extraLabel: 'End-of-year bonus', title: 'Your end-of-year bonus is coming',
      sentence: 'Your end-of-year bonus usually lands in December.',
    }));
    allTips.push(createMoneyTip({
      id: 'holiday-pay', dream: soonestDream, amount: HOLIDAY_PAY_AMOUNT, monthIndex: getNextOccurrence(5), day: 25,
      extraLabel: 'Holiday pay', title: 'Holiday pay lands in May',
      sentence: 'Your holiday pay usually arrives at the end of May.',
    }));

    const dreamWithoutRoundUps = unfinishedDreams.find((dream) => !dream.hasRoundUps && dream.progressRatio < 0.5);
    if (dreamWithoutRoundUps) {
      allTips.push({
        id: 'roundups-' + dreamWithoutRoundUps.id, kind: 'habit', dreamId: dreamWithoutRoundUps.id, dreamName: dreamWithoutRoundUps.name,
        monthIndex: TODAY_MONTH_INDEX, day: TODAY_DAY_OF_MONTH, iconName: 'trend',
        title: 'Let small change add up',
        body: ['Round up every card payment to the next euro and the change goes to "' + dreamWithoutRoundUps.name + '". You won\'t notice it, your dream will.'],
        actionType: 'roundups', primaryLabel: 'Turn on round-ups',
      });
    }
  }

  // Time is scarce too.
  allTips.push({
    id: 'holiday-days', kind: 'time', dreamId: null, dreamName: null,
    monthIndex: TODAY_MONTH_INDEX, day: TODAY_DAY_OF_MONTH, iconName: 'sun',
    title: '4 holiday days left this year',
    body: ['You still have ', { bold: '4 holiday days' }, ' before the end of the year. Fancy a short getaway?'],
    actionType: 'add-weekend', primaryLabel: 'Make it a dream',
  });

  describedDreams.forEach((dream) => {
    const reachedMilestones = calculateMilestones(dream).filter((milestone) => milestone.isReached && milestone.fraction < 1);
    if (reachedMilestones.length > 0) {
      const latestMilestone = reachedMilestones[reachedMilestones.length - 1];
      allTips.push({
        id: 'milestone-' + dream.id + '-' + latestMilestone.fraction, kind: 'celebrate', dreamId: dream.id, dreamName: dream.name,
        monthIndex: TODAY_MONTH_INDEX, day: TODAY_DAY_OF_MONTH, iconName: 'star',
        title: latestMilestone.label + ' for ' + dream.name + '!',
        body: ['You\'ve saved ' + formatEuro(dream.saved) + ' so far. That\'s real progress, keep going.'],
        actionType: 'acknowledge', primaryLabel: 'Nice!',
      });
    }

    if (dream.templateId === 'travel') {
      if (!dream.wantsFlightReminder) {
        const bookingMonthIndex = Math.max(TODAY_MONTH_INDEX, dream.targetMonthIndex - 6);
        allTips.push({
          id: 'flights-' + dream.id, kind: 'booking', dreamId: dream.id, dreamName: dream.name,
          monthIndex: bookingMonthIndex, day: pickTipDay(bookingMonthIndex, 1), iconName: 'plane',
          title: 'Booking window for your flights',
          body: ['Around ' + formatMonth(bookingMonthIndex) + ' is a good moment to book flights for "' + dream.name + '". Want a nudge when prices look good?'],
          actionType: 'flight-reminder', primaryLabel: 'Remind me',
        });
      }
      const insuranceMonthIndex = Math.max(TODAY_MONTH_INDEX, dream.targetMonthIndex - 4);
      allTips.push({
        id: 'insurance-' + dream.id, kind: 'booking', dreamId: dream.id, dreamName: dream.name,
        monthIndex: insuranceMonthIndex, day: pickTipDay(insuranceMonthIndex, 10), iconName: 'shield',
        title: 'Travel insurance, ready in one tap',
        body: ['Once you\'ve booked "' + dream.name + '", your travel insurance is pre-filled. No forms.'],
        actionType: 'acknowledge', primaryLabel: 'Good to know',
      });
    }

    if ((dream.templateId === 'home' || dream.templateId === 'wedding') && !dream.isShared) {
      allTips.push({
        id: 'share-' + dream.id, kind: 'together', dreamId: dream.id, dreamName: dream.name,
        monthIndex: TODAY_MONTH_INDEX, day: TODAY_DAY_OF_MONTH, iconName: 'people',
        title: 'Plan it together',
        body: ['Saving for "' + dream.name + '" with someone? Share it and split the monthly amount. You both see the progress.'],
        actionType: 'share', primaryLabel: 'Invite someone',
      });
    }
  });

  return allTips.sort((firstTip, secondTip) =>
    firstTip.monthIndex - secondTip.monthIndex ||
    TIP_KIND_ORDER.indexOf(firstTip.kind) - TIP_KIND_ORDER.indexOf(secondTip.kind));
}

export function getTipStatus(state: AppState, tipId: string): TipStatus {
  return state.tipStatus[tipId] ?? 'open';
}

export function getOpenTips(state: AppState) {
  return generateAllTips(state).filter((tip) => getTipStatus(state, tip.id) === 'open');
}

// "Right now" tips are limited by the nudge level the user picked.
export function getTipFeed(state: AppState) {
  const openTips = getOpenTips(state);
  const dueTips = openTips.filter((tip) => tip.monthIndex <= TODAY_MONTH_INDEX);
  const tipsPerMonth = NUDGE_LEVELS[state.nudgeLevel].tipsPerMonth;
  return {
    shownDueTips: dueTips.slice(0, tipsPerMonth),
    waitingCount: Math.max(0, dueTips.length - tipsPerMonth),
    upcomingTips: openTips.filter((tip) => tip.monthIndex > TODAY_MONTH_INDEX),
  };
}

// Kinds of calendar days. The order is the priority for the circle colour.
export const EVENT_KIND_ORDER = ['dream', 'milestone', 'tip', 'money'] as const;
export type EventKind = (typeof EVENT_KIND_ORDER)[number];
export const EVENT_KIND_LABELS: Record<EventKind, string> = { dream: 'Dream date', milestone: 'Milestone', tip: 'Tip', money: 'Money in' };

/** Where tapping a calendar event takes you. */
export type EventTarget = { type: 'dreams' } | { type: 'dream'; dreamId: string } | { type: 'tips'; dreamId: string };

export type CalendarEvent = { day: number; kind: EventKind; iconName: IconName; title: string; detail: string; target: EventTarget };

export function generateCalendarEvents(state: AppState, monthIndex: number): CalendarEvent[] {
  const describedDreams = getDescribedDreams(state);
  const calendarEvents: CalendarEvent[] = [];

  const savingDreams = describedDreams.filter((dream) => dream.monthlyAmount > 0 && dream.targetMonthIndex >= monthIndex);
  if (savingDreams.length > 0) {
    calendarEvents.push({
      day: 1, kind: 'money', iconName: 'coins',
      title: 'Autosave ' + formatEuro(sumOf(savingDreams.map((dream) => dream.monthlyAmount))),
      detail: 'Split over ' + savingDreams.length + (savingDreams.length === 1 ? ' dream pot' : ' dream pots'),
      target: { type: 'dreams' },
    });
  }

  // Salary usually lands on the 25th: the moment the next autosave is covered.
  const salaryDay = 25;
  calendarEvents.push({
    day: salaryDay, kind: 'money', iconName: 'wallet', title: 'Salary lands',
    detail: 'Your next autosave on the 1st is covered', target: { type: 'dreams' },
  });

  // Round-ups are swept into their pots every Sunday.
  const roundUpDreams = describedDreams.filter((dream) => dream.hasRoundUps && !dream.isComplete);
  if (roundUpDreams.length > 0) {
    const daysInMonth = getDaysInMonth(monthIndex);
    for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber++) {
      const isSunday = new Date(getYear(monthIndex), monthIndex % 12, dayNumber).getDay() === 0;
      if (isSunday) {
        calendarEvents.push({ day: dayNumber, kind: 'money', iconName: 'trend', title: 'Round-ups swept', detail: 'Small change to ' + roundUpDreams[0].name, target: { type: 'dream', dreamId: roundUpDreams[0].id } });
      }
    }
  }

  describedDreams.forEach((dream) => {
    const openDream: EventTarget = { type: 'dream', dreamId: dream.id };
    if (dream.targetMonthIndex === monthIndex) {
      calendarEvents.push({ day: 15, kind: 'dream', iconName: dream.template.iconName, title: dream.name, detail: 'Your dream date!', target: openDream });
    }
    calculateMilestones(dream).forEach((milestone) => {
      if (!milestone.isReached && milestone.fraction < 1 && milestone.whenMonthIndex === monthIndex) {
        calendarEvents.push({ day: 28, kind: 'milestone', iconName: 'star', title: milestone.label + ': ' + dream.name, detail: milestone.amountLabel + ' saved by now', target: openDream });
      }
    });
    dream.scheduledExtras.forEach((extra) => {
      if (extra.monthIndex === monthIndex) {
        calendarEvents.push({ day: extra.day, kind: 'money', iconName: 'coins', title: formatEuro(extra.amount) + ' to ' + dream.name, detail: extra.label + ', planned', target: openDream });
      }
    });
  });

  generateAllTips(state).forEach((tip) => {
    if (getTipStatus(state, tip.id) === 'open' && tip.monthIndex === monthIndex) {
      calendarEvents.push({ day: tip.day, kind: 'tip', iconName: tip.iconName, title: tip.title, detail: TIP_KINDS[tip.kind].label, target: { type: 'tips', dreamId: tip.dreamId ?? 'all' } });
    }
  });

  return calendarEvents.sort((firstEvent, secondEvent) => firstEvent.day - secondEvent.day);
}

export function calculateDraftPlan(state: AppState, draft: Draft) {
  const monthsLeft = Math.max(1, draft.targetMonthIndex - TODAY_MONTH_INDEX);
  const draftMonthly = Math.ceil(draft.cost / monthsLeft);
  const currentBudget = calculateBudget(state, getDescribedDreams(state));
  return { monthsLeft, draftMonthly, fitsInRoom: currentBudget.totalMonthly + draftMonthly <= state.monthlyRoom };
}

// =============================================================
// Wrapped: saving personality
// =============================================================
export function describeSavingPersonality(history: HistoryMonth[], extraMoveCount: number) {
  const monthsSaved = history.filter((month) => month.amount > 0).length;
  if (extraMoveCount >= 2) {
    return { name: 'The Opportunist', text: 'Leftovers, bonuses, holiday pay: you grab good moments when they come.' };
  }
  if (monthsSaved === history.length) {
    return { name: 'The Steady Planner', text: 'Every single month, no drama. Slow and steady is how dreams really happen.' };
  }
  return { name: 'The Dreamer', text: 'Big plans and a head full of ideas. Now let\'s give them dates.' };
}

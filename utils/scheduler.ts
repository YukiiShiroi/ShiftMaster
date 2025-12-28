import { CycleType, Overrides, Holidays, DayInfo, OverrideType } from '../types';

// Epoch: Monday, Jan 1, 2024 is the start of a Shift 1 cycle.
const EPOCH = new Date('2024-01-01T00:00:00Z');
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_WEEK = MS_PER_DAY * 7;

/**
 * Determines the cycle type (Shift 1 or Shift 2) for a given date based on weeks passed since Epoch.
 */
export const getCycleType = (date: Date): CycleType => {
  // Normalize to UTC midnight to avoid timezone issues with difference calculation
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const diff = utcDate.getTime() - EPOCH.getTime();
  
  // Calculate weeks passed. 
  // Floor ensures we stay in the same week index from Mon-Sun.
  // Note: getDay() 0 is Sunday, so we need to handle the start of the week logic carefully.
  // However, since Jan 1 2024 was a Monday, standard week math works if we treat Mon as start.
  
  // Adjusting for day of week to align weeks to Monday start
  // JS getDay(): 0=Sun, 1=Mon...
  // We want to calculate the "Week Index" relative to the Epoch Monday.
  const daysPassed = Math.floor(diff / MS_PER_DAY);
  
  // We need to handle negative dates (pre-2024) correctly too, but for simplicity let's assume floor works
  // We want to group 7 days into a week index.
  // To ensure Sunday falls into the previous Monday's week, we shift the calculation slightly or rely on ISO weeks.
  
  // Simpler approach: Get Monday of the current week, find diff from Epoch Monday.
  const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon...
  const distToMonday = (dayOfWeek + 6) % 7; // Mon=0, Tue=1, ... Sun=6
  const mondayOfCurrentWeek = new Date(date);
  mondayOfCurrentWeek.setDate(date.getDate() - distToMonday);
  mondayOfCurrentWeek.setHours(0, 0, 0, 0);

  // Re-calculate diff based on Mondays
  const diffWeeks = Math.floor((mondayOfCurrentWeek.getTime() - new Date('2024-01-01T00:00:00').getTime()) / MS_PER_WEEK);
  
  // Even weeks are Shift 1, Odd weeks are Shift 2
  // We use absolute value to handle dates before 2024
  return Math.abs(diffWeeks) % 2 === 0 ? 'SHIFT_1' : 'SHIFT_2';
};

/**
 * Logic:
 * Shift 1 (Week 1): Work Mon, Tue, Fri, Sat, Sun. Off Wed, Thu.
 * Shift 2 (Week 2): Work Wed, Thu. Off Mon, Tue, Fri, Sat, Sun.
 * 
 * Payday: Wednesday of Shift 2.
 */
export const getBaseStatus = (date: Date, cycle: CycleType) => {
  const day = date.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

  let isWork = false;
  let isPayday = false;

  if (cycle === 'SHIFT_1') {
    // Work: Mon(1), Tue(2), Fri(5), Sat(6), Sun(0)
    // Off: Wed(3), Thu(4)
    if (day !== 3 && day !== 4) {
      isWork = true;
    }
  } else {
    // Shift 2
    // Work: Wed(3), Thu(4)
    if (day === 3 || day === 4) {
      isWork = true;
    }
    
    // Payday Rule: Wednesday of Shift 2
    if (day === 3) {
      isPayday = true;
    }
  }

  return { isWork, isPayday };
};

export const toDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const getDayInfo = (
  date: Date, 
  overrides: Overrides, 
  holidays: Holidays
): DayInfo => {
  const dateKey = toDateKey(date);
  const cycleType = getCycleType(date);
  const { isWork: baseIsWork, isPayday } = getBaseStatus(date, cycleType);
  
  const override = overrides[dateKey];
  const holidayName = holidays[dateKey];

  let isWork = baseIsWork;
  if (override) {
    isWork = override === 'WORK';
  }

  return {
    date,
    isWork,
    baseIsWork,
    isOverride: !!override,
    overrideType: override,
    isHoliday: !!holidayName,
    holidayName,
    cycleType,
    isPayday
  };
};

export const getPseudocode = (): string => {
  return `CONST EPOCH = '2024-01-01' (Monday, Shift 1 Start)

FUNCTION GetCycle(date):
  weeksPassed = Floor((date - EPOCH) / 7_DAYS)
  IF weeksPassed is EVEN: RETURN "SHIFT_1"
  ELSE: RETURN "SHIFT_2"

FUNCTION GetDayStatus(date):
  cycle = GetCycle(date)
  day = date.dayOfWeek // 0=Sun...6=Sat
  
  isWork = FALSE
  isPayday = FALSE

  IF cycle is "SHIFT_1":
    // Work Mon, Tue, Fri, Sat, Sun
    IF day NOT Wed AND day NOT Thu: isWork = TRUE
  
  ELSE (SHIFT_2):
    // Work Wed, Thu
    IF day IS Wed OR day IS Thu: isWork = TRUE
    
    // Payday Rule
    IF day IS Wed: isPayday = TRUE

  // Overrides override 'isWork'
  // Holidays are just flags
  
  RETURN { isWork, isPayday, cycle }`;
};
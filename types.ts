export enum ViewType {
  WEEK = 'Week',
  MONTH = 'Month',
  YEAR = 'Year',
}

export type OverrideType = 'WORK' | 'OFF';

// Shift 1 = Week 1, Shift 2 = Week 2
export type CycleType = 'SHIFT_1' | 'SHIFT_2';

export interface DayInfo {
  date: Date;
  isWork: boolean;
  baseIsWork: boolean;
  isOverride: boolean;
  overrideType?: OverrideType;
  isHoliday: boolean;
  holidayName?: string;
  cycleType: CycleType; // Which shift cycle this day belongs to
  isPayday: boolean;   // Is this a payday?
}

export type Overrides = Record<string, OverrideType>;
export type Holidays = Record<string, string>; // dateString -> name

export interface CalendarStats {
  workDays: number;
  offDays: number;
  payDays: number;
}
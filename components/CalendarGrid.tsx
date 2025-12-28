import React from 'react';
import { ViewType, Overrides, Holidays } from '../types';
import { getDayInfo, toDateKey } from '../utils/scheduler';
import { Lock, Flag, Banknote, CalendarRange } from 'lucide-react';

interface CalendarGridProps {
  view: ViewType;
  currentDate: Date;
  overrides: Overrides;
  holidays: Holidays;
  onDateClick: (date: Date) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarGrid: React.FC<CalendarGridProps> = ({ 
  view, 
  currentDate, 
  overrides, 
  holidays,
  onDateClick 
}) => {
  const getDaysForView = () => {
    const days = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (view === ViewType.MONTH) {
      const firstDayOfMonth = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      // Previous month padding
      for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
      }

      // Current month days
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
      }
    } else if (view === ViewType.WEEK) {
      const dayOfWeek = currentDate.getDay();
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - dayOfWeek);

      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        days.push(d);
      }
    }

    return days;
  };

  const renderDay = (date: Date | null, index: number) => {
    if (!date) return <div key={`empty-${index}`} className="h-28 bg-slate-50/50" />;

    const dayInfo = getDayInfo(date, overrides, holidays);
    const isToday = date.toDateString() === new Date().toDateString();
    
    // Determine if we should label the cycle (e.g., on Mondays)
    const showCycleLabel = date.getDay() === 1 || (date.getDate() === 1 && view === ViewType.MONTH) || view === ViewType.WEEK;

    return (
      <div
        key={date.toISOString()}
        onClick={() => onDateClick(date)}
        className={`
          relative p-2 h-28 sm:h-32 border-t border-r border-slate-100 transition-all duration-200 group cursor-pointer
          ${dayInfo.isWork ? 'bg-white hover:bg-blue-50/30' : 'bg-slate-50 hover:bg-slate-100'}
          ${isToday ? 'ring-2 ring-inset ring-indigo-500 z-10' : ''}
          ${dayInfo.isOverride ? 'bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlN2U1ZTQiLz4KPC9zdmc+")]' : ''}
        `}
      >
        <div className="flex justify-between items-start mb-1">
          <span className={`
            text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full
            ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-700'}
          `}>
            {date.getDate()}
          </span>
          
          <div className="flex gap-1 items-center">
            {dayInfo.isPayday && (
              <span className="text-emerald-600 bg-emerald-50 rounded-full p-0.5 border border-emerald-100 shadow-sm" title="Payday">
                <Banknote size={14} />
              </span>
            )}
            {dayInfo.isHoliday && (
              <span className="text-amber-500" title={`Holiday: ${dayInfo.holidayName}`}>
                <Flag size={14} fill="currentColor" />
              </span>
            )}
            {dayInfo.isOverride && (
              <span className="text-slate-400" title="Manual Override">
                <Lock size={14} />
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5 mt-1">
          {/* Cycle Label for Mondays (or 1st of month) */}
          {showCycleLabel && view === ViewType.MONTH && date.getDay() === 1 && (
            <div className={`text-[9px] font-bold uppercase tracking-tight mb-0.5 ${dayInfo.cycleType === 'SHIFT_1' ? 'text-blue-400' : 'text-emerald-500'}`}>
              {dayInfo.cycleType === 'SHIFT_1' ? 'Week 1' : 'Week 2'}
            </div>
          )}

          <span className={`
            text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider w-fit
            ${dayInfo.isWork 
              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
              : 'bg-slate-200 text-slate-600 border border-slate-300'}
          `}>
            {dayInfo.isWork ? 'WORK' : 'OFF'}
          </span>
          
          {dayInfo.isHoliday && (
             <span className="text-[10px] font-medium text-amber-700 truncate bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
               {dayInfo.holidayName}
             </span>
          )}
        </div>
        
        {/* Hover hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
          <div className="bg-slate-900/80 text-white text-xs px-2 py-1 rounded shadow-lg backdrop-blur-sm">
            Toggle Status
          </div>
        </div>
      </div>
    );
  };

  const days = getDaysForView();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden select-none">
      {/* Week View specific header to show Cycle */}
      {view === ViewType.WEEK && days.length > 0 && days[0] && (
        <div className="bg-indigo-50 px-4 py-2 border-b border-indigo-100 text-center text-xs font-semibold text-indigo-800 uppercase tracking-widest flex items-center justify-center gap-2">
           <CalendarRange size={14} />
           Current Cycle: {getDayInfo(days[0], overrides, holidays).cycleType.replace('_', ' ')}
        </div>
      )}

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>
      
      {/* Days Grid */}
      <div className="grid grid-cols-7">
        {days.map((date, idx) => renderDay(date, idx))}
      </div>
    </div>
  );
};

export default CalendarGrid;
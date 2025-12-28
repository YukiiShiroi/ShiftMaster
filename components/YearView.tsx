import React from 'react';
import { Overrides, Holidays } from '../types';
import { getDayInfo } from '../utils/scheduler';

interface YearViewProps {
  year: number;
  overrides: Overrides;
  holidays: Holidays;
}

const YearView: React.FC<YearViewProps> = ({ year, overrides, holidays }) => {
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {months.map((month) => {
        const date = new Date(year, month, 1);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const startDay = date.getDay();
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const monthName = date.toLocaleString('default', { month: 'long' });

        return (
          <div key={month} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">{monthName}</h3>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['S','M','T','W','T','F','S'].map(d => (
                <div key={d} className="text-[10px] text-slate-400 font-bold uppercase">{d}</div>
              ))}
              
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              
              {days.map((d) => {
                const dayDate = new Date(year, month, d);
                const info = getDayInfo(dayDate, overrides, holidays);
                
                let bgClass = info.isWork ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400';
                
                // Priority of coloring
                if (info.isOverride) {
                    bgClass = info.isWork ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-white';
                } else if (info.isPayday) {
                    bgClass = 'bg-emerald-500 text-white font-bold ring-2 ring-emerald-200';
                } else if (info.isHoliday) {
                    bgClass = info.isWork ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300' : 'bg-orange-50 text-orange-400 ring-1 ring-orange-200';
                }

                return (
                  <div
                    key={d}
                    className={`
                      aspect-square flex items-center justify-center text-xs rounded-full cursor-default font-medium transition-transform hover:scale-110
                      ${bgClass}
                    `}
                    title={`${monthName} ${d}: ${info.isWork ? 'WORK' : 'OFF'} 
Cycle: ${info.cycleType}
${info.isPayday ? 'PAYDAY' : ''} 
${info.isHoliday ? `(${info.holidayName})` : ''}`}
                  >
                    {info.isPayday ? '$' : d}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default YearView;
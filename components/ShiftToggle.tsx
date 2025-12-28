import React from 'react';
import { CalendarClock, Banknote } from 'lucide-react';

const CycleLegend: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm w-fit text-xs">
      <div className="flex items-center gap-2 px-2">
        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
        <span className="font-medium text-slate-700">Week 1 (Shift 1)</span>
        <span className="text-slate-400 hidden sm:inline">| M T F S S</span>
      </div>
      <div className="flex items-center gap-2 px-2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-1 sm:pt-0">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span className="font-medium text-slate-700">Week 2 (Shift 2)</span>
        <span className="text-slate-400 hidden sm:inline">| W Th</span>
      </div>
      <div className="flex items-center gap-2 px-2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-1 sm:pt-0">
         <Banknote size={14} className="text-emerald-600" />
         <span className="font-medium text-emerald-700">Payday (Wed/Wk2)</span>
      </div>
    </div>
  );
};

export default CycleLegend;
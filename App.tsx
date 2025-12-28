import React, { useState } from 'react';
import { ViewType, Overrides, Holidays } from './types';
import CalendarGrid from './components/CalendarGrid';
import YearView from './components/YearView';
import CycleLegend from './components/ShiftToggle';
import AiAssistant from './components/AiAssistant';
import { getPseudocode, toDateKey } from './utils/scheduler';
import { ChevronLeft, ChevronRight, Calendar, Info, Code, Settings, Plus, Trash2, X } from 'lucide-react';

const DEFAULT_HOLIDAYS: Holidays = {
  [`${new Date().getFullYear()}-01-01`]: "New Year's Day",
  [`${new Date().getFullYear()}-12-25`]: "Christmas Day",
  [`${new Date().getFullYear()}-07-04`]: "Independence Day",
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.MONTH);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showLogic, setShowLogic] = useState(false);
  const [showHolidays, setShowHolidays] = useState(false);
  
  const [overrides, setOverrides] = useState<Overrides>({});
  const [holidays, setHolidays] = useState<Holidays>(DEFAULT_HOLIDAYS);

  // Holiday Form State
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayName, setNewHolidayName] = useState('');

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (currentView === ViewType.YEAR) {
      newDate.setFullYear(currentDate.getFullYear() - 1);
    } else if (currentView === ViewType.MONTH) {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setDate(currentDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (currentView === ViewType.YEAR) {
      newDate.setFullYear(currentDate.getFullYear() + 1);
    } else if (currentView === ViewType.MONTH) {
      newDate.setMonth(currentDate.getMonth() + 1);
    } else {
      newDate.setDate(currentDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => setCurrentDate(new Date());

  const handleDateClick = (date: Date) => {
    // Toggle Override: Default -> Work -> Off -> Default
    const key = toDateKey(date);
    setOverrides(prev => {
      const current = prev[key];
      const next = { ...prev };
      
      if (!current) {
        next[key] = 'WORK'; // Force work
      } else if (current === 'WORK') {
        next[key] = 'OFF'; // Force off
      } else {
        delete next[key]; // Reset
      }
      return next;
    });
  };

  const addHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHolidayDate && newHolidayName) {
      setHolidays(prev => ({
        ...prev,
        [newHolidayDate]: newHolidayName
      }));
      setNewHolidayDate('');
      setNewHolidayName('');
    }
  };

  const removeHoliday = (dateKey: string) => {
    setHolidays(prev => {
      const next = { ...prev };
      delete next[dateKey];
      return next;
    });
  };

  const getTitle = () => {
    if (currentView === ViewType.YEAR) return currentDate.getFullYear().toString();
    if (currentView === ViewType.MONTH) return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    // For week view, show range
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const startStr = startOfWeek.toLocaleString('default', { month: 'short', day: 'numeric' });
    const endStr = endOfWeek.toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Calendar size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">ShiftMaster</h1>
            <p className="text-xs text-slate-500 font-medium">Alternating Work & Pay Calendar</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <CycleLegend />
          
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 hidden sm:flex">
            {[ViewType.WEEK, ViewType.MONTH, ViewType.YEAR].map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  currentView === view
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <button onClick={handlePrev} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-xl font-semibold text-slate-800 min-w-[200px] text-center">
                {getTitle()}
              </h2>
              <button onClick={handleNext} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>

             {/* Mobile View Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 sm:hidden">
            {[ViewType.WEEK, ViewType.MONTH, ViewType.YEAR].map((view) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  currentView === view
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {view}
              </button>
            ))}
          </div>

            <div className="flex items-center gap-2 sm:gap-3">
               <button 
                onClick={handleToday}
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 px-3 py-2 hover:bg-indigo-50 rounded-lg transition-colors whitespace-nowrap"
              >
                Today
              </button>
              <button 
                onClick={() => setShowHolidays(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border bg-white text-slate-600 border-slate-200 hover:bg-slate-50 whitespace-nowrap"
              >
                <Settings size={16} />
                <span className="hidden sm:inline">Holidays</span>
              </button>
              <button 
                onClick={() => setShowLogic(!showLogic)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border whitespace-nowrap ${
                  showLogic 
                    ? 'bg-slate-800 text-white border-slate-800' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Code size={16} />
                <span className="hidden sm:inline">{showLogic ? 'Hide' : 'Logic'}</span>
              </button>
            </div>
          </div>

          {/* Logic Explainer Panel */}
          {showLogic && (
            <div className="bg-slate-900 text-slate-200 p-6 rounded-2xl shadow-lg border border-slate-800 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-800 rounded-lg">
                  <Info size={20} className="text-indigo-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Procedural Logic - Alternating Cycle</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    The calendar alternates between Week 1 (Shift 1) and Week 2 (Shift 2) indefinitely.
                    Calculation is based on weeks passed since Jan 1, 2024.
                  </p>
                  <div className="bg-black/50 p-4 rounded-xl font-mono text-xs sm:text-sm text-green-400 overflow-x-auto border border-white/10">
                    <pre>{getPseudocode()}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Calendar Views */}
          <div className="min-h-[500px]">
            {currentView === ViewType.YEAR ? (
              <YearView 
                year={currentDate.getFullYear()} 
                overrides={overrides}
                holidays={holidays}
              />
            ) : (
              <CalendarGrid 
                view={currentView} 
                currentDate={currentDate} 
                overrides={overrides}
                holidays={holidays}
                onDateClick={handleDateClick}
              />
            )}
          </div>
        </div>
      </main>

      {/* Holidays Modal */}
      {showHolidays && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Settings size={18} className="text-indigo-600" />
                Manage Holidays
              </h3>
              <button 
                onClick={() => setShowHolidays(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={addHoliday} className="flex gap-2 mb-6">
                <input
                  type="date"
                  required
                  value={newHolidayDate}
                  onChange={(e) => setNewHolidayDate(e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <input
                  type="text"
                  required
                  placeholder="Holiday Name"
                  value={newHolidayName}
                  onChange={(e) => setNewHolidayName(e.target.value)}
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button 
                  type="submit"
                  className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </form>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {Object.keys(holidays).length === 0 && (
                   <p className="text-center text-slate-400 text-sm py-4">No holidays added yet.</p>
                )}
                {Object.entries(holidays).sort().map(([date, name]) => (
                  <div key={date} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                      <div className="font-medium text-slate-800 text-sm">{name}</div>
                      <div className="text-xs text-slate-500">{date}</div>
                    </div>
                    <button
                      onClick={() => removeHoliday(date)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <AiAssistant 
        currentDate={currentDate} 
        overrides={overrides}
        holidays={holidays}
      />
    </div>
  );
};

export default App;
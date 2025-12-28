import React, { useState } from 'react';
import { Overrides, Holidays } from '../types';
import { analyzeSchedule } from '../services/geminiService';
import { Sparkles, Send, Loader2 } from 'lucide-react';

interface AiAssistantProps {
  currentDate: Date;
  overrides: Overrides;
  holidays: Holidays;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ currentDate, overrides, holidays }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse(null);
    const result = await analyzeSchedule(currentDate, query, overrides, holidays);
    setResponse(result);
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 z-50 flex items-center gap-2 font-medium"
      >
        <Sparkles size={20} />
        <span className="hidden sm:inline">Ask AI Assistant</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="text-yellow-400" size={18} />
          <h3 className="font-semibold">Schedule Assistant</h3>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="p-4 max-h-[60vh] overflow-y-auto bg-slate-50 min-h-[200px]">
        {response ? (
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            <span className="font-semibold text-indigo-600 block mb-2">AI Analysis:</span>
            {response}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center p-6 space-y-3">
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center">
              <Sparkles className="text-indigo-400" size={24} />
            </div>
            <p className="text-sm">Ask about paydays, which shift week it is, or work streaks.</p>
          </div>
        )}
      </div>

      <form onSubmit={handleAsk} className="p-3 bg-white border-t border-slate-100 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., When is my next payday?"
          className="flex-1 px-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>
    </div>
  );
};

export default AiAssistant;
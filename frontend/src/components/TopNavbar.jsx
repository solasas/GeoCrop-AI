import React from 'react';
import { Sprout, Map, BarChart3 } from 'lucide-react';

export default function TopNavbar({ activeTab = 'Farm Map', onTabChange, onGoHome }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between z-30 shadow-sm">
      {/* Brand Logo */}
      <div
        onClick={onGoHome}
        className="flex items-center space-x-2.5 cursor-pointer group"
        title="GeoCrop AI Home"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-emerald-400 to-amber-300 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
          <Sprout className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">GeoCrop AI</span>
          <span className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase">Precision Agronomics</span>
        </div>
      </div>

      {/* Main Workspace Navigation Tabs */}
      <nav className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
        <button
          onClick={() => onTabChange('Farm Map')}
          className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'Farm Map'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          <span>Interactive Map</span>
        </button>

        <button
          onClick={() => onTabChange('Analytics')}
          className={`flex items-center space-x-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'Analytics'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Yield Analytics</span>
        </button>
      </nav>

      {/* Right User Profile */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onGoHome}
          className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          Landing Overview
        </button>
        <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-emerald-400 flex items-center justify-center text-white text-xs font-bold shadow-sm">
          GA
        </div>
      </div>
    </header>
  );
}

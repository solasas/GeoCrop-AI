import React from 'react';
import { Search, Sprout, Home } from 'lucide-react';

export default function TopNavbar({ activeTab = 'Farm Map', onTabChange, onGoHome }) {
  const tabs = ['Farm Map', 'Tasks', 'Analytics', 'Plan'];

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between z-30 shadow-sm">
      {/* Brand & Main Navigation Links */}
      <div className="flex items-center space-x-8">
        {/* Brand Logo */}
        <div
          onClick={onGoHome}
          className="flex items-center space-x-2.5 cursor-pointer group"
          title="Return to Landing Page"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-emerald-400 to-amber-300 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg text-slate-900 tracking-tight">GeoCrop</span>
        </div>

        {/* Horizontal Navigation Tabs */}
        <nav className="flex items-center space-x-1 h-16">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => onTabChange && onTabChange(tab)}
                className={`relative px-4 h-full flex items-center text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'text-slate-900'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>{tab}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-slate-900 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right Search Input & Landing Home Link */}
      <div className="flex items-center space-x-4">
        {/* Home Link Button */}
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            title="Landing Page Overview"
          >
            <Home className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Landing Page</span>
          </button>
        )}

        {/* Search Bar */}
        <div className="relative w-48 sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search fields, crops, tasks..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100/80 border border-transparent hover:border-slate-300 focus:border-emerald-500 focus:bg-white rounded-xl text-xs text-slate-800 placeholder-slate-400 transition-all outline-none"
          />
        </div>

        {/* Profile Avatar Group */}
        <div className="flex items-center space-x-2 pl-2">
          <div className="flex -space-x-2 overflow-hidden">
            <img
              className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-sm"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
              alt="User profile 1"
            />
            <img
              className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-sm"
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
              alt="User profile 2"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

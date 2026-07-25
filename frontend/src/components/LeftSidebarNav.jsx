import React from 'react';
import { Map, BarChart3, Calendar } from 'lucide-react';

export default function LeftSidebarNav({ activeView = 'map', onViewChange }) {
  const items = [
    { id: 'map', icon: Map, label: 'Farm Satellite Map' },
    { id: 'analytics', icon: BarChart3, label: 'Yield Analytics' },
    { id: 'calendar', icon: Calendar, label: 'Crop Calendar' },
  ];

  return (
    <aside className="w-16 bg-white border-r border-slate-200/80 flex flex-col items-center justify-between py-5 z-20 shadow-sm flex-none">
      {/* Top Navigation Icons */}
      <div className="flex flex-col items-center space-y-4">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange && onViewChange(item.id)}
              className={`p-3 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>

      {/* Bottom Profile Avatar */}
      <div className="flex flex-col items-center space-y-3">
        <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
          GA
        </div>
      </div>
    </aside>
  );
}

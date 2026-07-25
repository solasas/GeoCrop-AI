import React from 'react';
import { Map, LayoutDashboard, Calendar, Settings, HelpCircle } from 'lucide-react';

export default function LeftSidebarNav({ activeView = 'map', onViewChange }) {
  const items = [
    { id: 'map', icon: Map, label: 'Farm Map' },
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
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
                  ? 'bg-slate-100 text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
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
        <button className="w-9 h-9 rounded-2xl overflow-hidden ring-2 ring-slate-200 shadow-sm hover:ring-emerald-500 transition-all cursor-pointer">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
            alt="User Profile"
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </aside>
  );
}

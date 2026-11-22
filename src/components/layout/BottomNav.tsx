import React from 'react';
import { BookOpen, Scale, Settings } from 'lucide-react';
import type { TabChinh } from '../../types';

interface BottomNavProps {
  activeTab: TabChinh;
  onSelectTab: (tab: TabChinh) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const items: { key: TabChinh; label: string; icon: React.ReactNode }[] = [
    { key: 'can_lua', label: 'Cân lúa', icon: <Scale className="h-7 w-7" /> },
    { key: 'so_can', label: 'Sổ cân', icon: <BookOpen className="h-7 w-7" /> },
    { key: 'cai_dat', label: 'Cài đặt', icon: <Settings className="h-7 w-7" /> },
  ];

  return (
    <nav className="no-print fixed bottom-0 left-0 right-0 z-40 border-t-2 border-[#111111] bg-white pb-safe">
      <div className="mx-auto grid max-w-lg grid-cols-3 gap-2 px-2 pt-2">
        {items.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectTab(item.key)}
              className={`flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl border-2 px-1 py-2 text-[20px] font-extrabold leading-none transition ${
                isActive
                  ? 'border-[#1B5E20] bg-[#1B5E20] text-white'
                  : 'border-transparent bg-white text-[#111111] active:bg-[#f0f0f0]'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

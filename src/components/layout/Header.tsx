import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  saveStatus?: 'idle' | 'saving' | 'saved';
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onBack,
  saveStatus = 'idle',
}) => {
  return (
    <header className="no-print sticky top-0 z-30 border-b-2 border-[#111111] bg-[#1B5E20] text-white pt-safe">
      <div className="mx-auto flex min-h-[68px] max-w-lg items-center justify-between gap-3 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex min-h-[64px] items-center gap-1.5 rounded-xl border-2 border-white bg-[#144618] px-3 text-body font-extrabold text-white active:bg-[#0e3211]"
            >
              <ArrowLeft className="h-6 w-6 shrink-0" />
              <span>Quay lại</span>
            </button>
          )}
          <h1 className="truncate text-title font-extrabold leading-tight">
            {title}
          </h1>
        </div>

        {saveStatus !== 'idle' && (
          <span className="shrink-0 rounded-xl bg-[#F9A825] px-3 py-1.5 text-[20px] font-extrabold text-[#111111]">
            {saveStatus === 'saving' ? 'Đang lưu...' : 'Đã lưu'}
          </span>
        )}
      </div>
    </header>
  );
};

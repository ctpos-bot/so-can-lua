import React from 'react';
import { RotateCcw } from 'lucide-react';

interface UndoToastProps {
  visible: boolean;
  message: string;
  onUndo: () => void;
}

export const UndoToast: React.FC<UndoToastProps> = ({
  visible,
  message,
  onUndo,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed bottom-24 left-3 right-3 z-50 mx-auto max-w-lg rounded-2xl border-2 border-[#111111] bg-[#111111] p-3 text-white shadow-2xl">
      <div className="flex items-center justify-between gap-3">
        <span className="text-body font-bold">{message}</span>
        <button
          type="button"
          onClick={onUndo}
          className="inline-flex min-h-[64px] shrink-0 items-center gap-2 rounded-xl bg-[#F9A825] px-5 text-body font-extrabold text-[#111111] active:bg-[#e09412]"
        >
          <RotateCcw className="h-6 w-6" />
          <span>Hoàn tác</span>
        </button>
      </div>
    </div>
  );
};

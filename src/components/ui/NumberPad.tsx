import React from 'react';
import { Check, Delete } from 'lucide-react';

interface NumberPadProps {
  onDigit: (digit: string) => void;
  onComma: () => void;
  onBackspace: () => void;
  onSubmit: () => void;
  submitLabel?: string;
}

export const NumberPad: React.FC<NumberPadProps> = ({
  onDigit,
  onComma,
  onBackspace,
  onSubmit,
  submitLabel = 'GHI',
}) => {
  const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3'];

  return (
    <div className="grid grid-cols-4 gap-3 bg-white pt-2">
      <div className="col-span-3 grid grid-cols-3 gap-3">
        {keys.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => onDigit(k)}
            className="flex min-h-[72px] items-center justify-center rounded-2xl border-2 border-[#111111] bg-white text-[28px] font-extrabold text-[#111111] active:bg-[#e8f5e9]"
          >
            {k}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onDigit('0')}
          className="col-span-2 flex min-h-[72px] items-center justify-center rounded-2xl border-2 border-[#111111] bg-white text-[28px] font-extrabold text-[#111111] active:bg-[#e8f5e9]"
        >
          0
        </button>

        <button
          type="button"
          onClick={onComma}
          className="flex min-h-[72px] items-center justify-center rounded-2xl border-2 border-[#111111] bg-white text-[32px] font-extrabold text-[#111111] active:bg-[#e8f5e9]"
          aria-label="Dấu phẩy"
        >
          ,
        </button>
      </div>

      <div className="col-span-1 flex flex-col gap-3">
        <button
          type="button"
          onClick={onBackspace}
          className="flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-[#C62828] bg-white px-2 text-body font-extrabold text-[#C62828] active:bg-[#fff5f5]"
        >
          <Delete className="h-7 w-7" />
          <span className="text-[20px]">XÓA</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          className="flex flex-1 min-h-[156px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-[#1B5E20] bg-[#1B5E20] px-2 text-white shadow-sm active:bg-[#144618]"
        >
          <Check className="h-9 w-9" />
          <span className="text-[24px] font-extrabold">{submitLabel}</span>
        </button>
      </div>
    </div>
  );
};

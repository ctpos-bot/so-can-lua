import React from 'react';

interface BigInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  requiredMark?: boolean;
  error?: string;
}

export const BigInput: React.FC<BigInputProps> = ({
  label,
  requiredMark = false,
  error,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `input-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className="min-w-0 space-y-2">
      <label
        htmlFor={inputId}
        className="block text-body font-bold text-[#111111]"
      >
        {label}
        {requiredMark && <span className="ml-1 text-[#C62828]">*</span>}
      </label>
      <input
        id={inputId}
        {...props}
        className={`block min-h-[64px] w-full min-w-0 max-w-full rounded-2xl border-2 bg-white px-4 py-3 text-body font-bold text-[#111111] placeholder:text-[#555555] focus:outline-none ${
          error
            ? 'border-[#C62828] bg-[#fff5f5]'
            : 'border-[#111111] focus:border-[#1B5E20]'
        } ${className}`}
      />
      {error && (
        <p className="text-body font-bold text-[#C62828]">{error}</p>
      )}
    </div>
  );
};

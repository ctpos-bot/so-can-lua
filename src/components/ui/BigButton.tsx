import React from 'react';

type ButtonVariant =
  | 'primary'
  | 'accent'
  | 'secondary'
  | 'danger'
  | 'danger-outline';

interface BigButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-[#1B5E20] text-white border-2 border-[#1B5E20] active:bg-[#144618]',
  accent: 'bg-[#F9A825] text-[#111111] border-2 border-[#111111] active:bg-[#e09412]',
  secondary: 'bg-white text-[#111111] border-2 border-[#111111] active:bg-[#f0f0f0]',
  danger: 'bg-[#C62828] text-white border-2 border-[#C62828] active:bg-[#a31d1d]',
  'danger-outline':
    'bg-white text-[#C62828] border-2 border-[#C62828] active:bg-[#fff5f5]',
};

export const BigButton: React.FC<BigButtonProps> = ({
  variant = 'primary',
  fullWidth = true,
  icon,
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex min-h-[64px] items-center justify-center gap-3 rounded-2xl px-5 py-3 text-body font-extrabold leading-tight transition active:scale-[0.98] disabled:opacity-50 ${
        fullWidth ? 'w-full' : ''
      } ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

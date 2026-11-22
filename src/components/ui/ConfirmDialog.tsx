import React from 'react';
import { BigButton } from './BigButton';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Không, quay lại',
  danger = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
      <div className="w-full max-w-md space-y-5 rounded-3xl border-2 border-[#111111] bg-white p-6 shadow-2xl">
        <h2 className="text-title font-extrabold text-[#111111]">{title}</h2>
        <p className="text-body font-semibold text-[#111111]">{message}</p>
        <div className="space-y-3 pt-2">
          <BigButton
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </BigButton>
          <BigButton variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </BigButton>
        </div>
      </div>
    </div>
  );
};

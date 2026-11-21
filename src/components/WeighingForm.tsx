import React from 'react';
import {
  Calendar,
  MapPin,
  User,
  Coins,
  Scale,
  Save,
  FilePlus2,
  Printer,
  CheckCircle2,
  Plus,
  Trash2,
  Wallet,
} from 'lucide-react';
import type {
  ExpenseItem,
  Plot,
  TareMode,
  WeighingRecord,
} from '../types/weighing';
import {
  calcRecordSummary,
  formatCurrency,
  formatWeight,
} from '../utils/calculations';
import { WeighingGrid } from './WeighingGrid';

interface WeighingFormProps {
  record: WeighingRecord;
  plots: Plot[];
  weighers: string[];
  isEditingExisting: boolean;
  savedBanner: boolean;
  quickThreeDigitDecimal: boolean;
  onToggleQuickThreeDigit: () => void;
  onChange: (updated: WeighingRecord) => void;
  onSave: () => void;
  onNewRecord: () => void;
  onPrint: () => void;
}

export const WeighingForm: React.FC<WeighingFormProps> = ({
  record,
  plots,
  weighers,
  isEditingExisting,
  savedBanner,
  quickThreeDigitDecimal,
  onToggleQuickThreeDigit,
  onChange,
  onSave,
  onNewRecord,
  onPrint,
}) => {
  const summary = calcRecordSummary(record);

  const handlePlotSelect = (plotId: string) => {
    if (!plotId) {
      onChange({ ...record, plotId: undefined });
      return;
    }
    const found = plots.find((p) => p.id === plotId);
    if (found) {
      onChange({
        ...record,
        plotId: found.id,
        plotName: found.name,
        areaCong: found.areaCong ?? record.areaCong,
        riceVariety: found.riceVariety || record.riceVariety,
        farmerName: found.owner || record.farmerName,
      });
    }
  };

  const EXPENSE_PRESETS = [
    'Tiền giống',
    'Phân bón',
    'Thuốc BVTV',
    'Công cắt',
    'Vận chuyển / Bốc vác',
    'Làm đất / Bơm nước',
  ];

  const expenses = record.expenses || [];

  const handleAddExpense = (presetName = '') => {
    const newItem: ExpenseItem = {
      id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: presetName,
      amount: 0,
    };
    onChange({ ...record, expenses: [...expenses, newItem] });
  };

  const handleUpdateExpense = (
    id: string,
    field: 'name' | 'amount',
    value: string
  ) => {
    const updated = expenses.map((item) => {
      if (item.id !== id) return item;
      if (field === 'amount') {
        return { ...item, amount: Math.max(0, Number(value) || 0) };
      }
      return { ...item, name: value };
    });
    onChange({ ...record, expenses: updated });
  };

  const handleRemoveExpense = (id: string) => {
    onChange({
      ...record,
      expenses: expenses.filter((item) => item.id !== id),
    });
  };

  const updateTareMode = (mode: TareMode) => {
    onChange({
      ...record,
      tareConfig: { ...record.tareConfig, mode },
    });
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header action bar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-emerald-200 bg-white p-3 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
              {record.code}
            </span>
            {isEditingExisting && (
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                Đang sửa phiếu
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Nhập thông tin phiếu và trọng lượng từng bao bên dưới
          </p>
        </div>

        <div className="flex w-full sm:w-auto flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onNewRecord}
            className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-base font-extrabold text-slate-800 hover:bg-slate-50 active:scale-95"
          >
            <FilePlus2 className="h-5 w-5" />
            Phiếu mới
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-base font-extrabold text-slate-800 hover:bg-slate-50 active:scale-95"
          >
            <Printer className="h-5 w-5" />
            In phiếu
          </button>
          <button
            type="button"
            onClick={onSave}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-base font-black text-white shadow-sm hover:bg-emerald-800 active:scale-95"
          >
            <Save className="h-5 w-5" />
            Lưu phiếu
          </button>
        </div>
      </div>

      {savedBanner && (
        <div className="no-print flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          Đã lưu phiếu cân {record.code} vào sổ!
        </div>
      )}

      {/* Thông tin chung */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-base font-extrabold uppercase tracking-wide text-slate-800">
          1. Thông tin phiếu cân
        </h2>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Ngày cân */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-slate-800">
              <Calendar className="h-4 w-4 text-emerald-700" />
              Ngày cân
            </label>
            <input
              type="date"
              value={record.date}
              onChange={(e) => onChange({ ...record, date: e.target.value })}
              className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-3 py-2.5 text-base font-bold text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Khuông đất */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-slate-800">
              <MapPin className="h-4 w-4 text-emerald-700" />
              Khuông đất
            </label>
            <div className="flex gap-2">
              {plots.length > 0 && (
                <select
                  value={record.plotId || ''}
                  onChange={(e) => handlePlotSelect(e.target.value)}
                  className="w-2/5 rounded-xl border-2 border-slate-300 bg-slate-50 px-2.5 py-2.5 text-sm font-bold text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                >
                  <option value="">-- Chọn nhanh --</option>
                  {plots.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
              <input
                type="text"
                placeholder="Nhập tên khuông đất..."
                value={record.plotName}
                onChange={(e) =>
                  onChange({ ...record, plotId: undefined, plotName: e.target.value })
                }
                className="flex-1 rounded-xl border-2 border-slate-300 bg-slate-50 px-3 py-2.5 text-base font-bold text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Người cân */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-slate-800">
              <User className="h-4 w-4 text-emerald-700" />
              Người cân
            </label>
            <input
              type="text"
              placeholder="Tên người cân..."
              value={record.weigherName}
              onChange={(e) => onChange({ ...record, weigherName: e.target.value })}
              className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-3 py-2.5 text-base font-bold text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
            />
            {weighers.length > 0 && (
              <div className="no-print mt-2 flex flex-wrap gap-1.5">
                {weighers.slice(0, 5).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => onChange({ ...record, weigherName: w })}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                      record.weigherName === w
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Giá tiền / 1 kg lúa */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-bold text-slate-800">
              <Coins className="h-4 w-4 text-amber-600" />
              Giá tiền / 1 kg lúa (đ)
            </label>
            <input
              type="number"
              inputMode="numeric"
              step="100"
              min="0"
              placeholder="VD: 7800"
              value={record.pricePerKg || ''}
              onChange={(e) =>
                onChange({
                  ...record,
                  pricePerKg: Math.max(0, Number(e.target.value) || 0),
                })
              }
              className="w-full rounded-xl border-2 border-amber-400 bg-amber-50/50 px-3 py-2.5 text-base font-black text-amber-950 focus:border-amber-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Giống lúa */}
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-800">
              Giống lúa (tùy chọn)
            </label>
            <input
              type="text"
              placeholder="VD: OM 18, Đài Thơm 8, ST25..."
              value={record.riceVariety}
              onChange={(e) => onChange({ ...record, riceVariety: e.target.value })}
              className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-3 py-2.5 text-base font-bold text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Chủ ruộng */}
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-800">
              Chủ ruộng / Thương lái (tùy chọn)
            </label>
            <input
              type="text"
              placeholder="Tên chủ ruộng..."
              value={record.farmerName}
              onChange={(e) => onChange({ ...record, farmerName: e.target.value })}
              className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-3 py-2.5 text-base font-bold text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Diện tích (số công) */}
          <div>
            <label className="mb-1.5 block text-sm font-bold text-slate-800">
              Diện tích khuông đất (số công)
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.5"
              min="0"
              placeholder="VD: 5 (để tính TB / 1 công)"
              value={record.areaCong || ''}
              onChange={(e) =>
                onChange({
                  ...record,
                  areaCong: e.target.value ? Math.max(0, Number(e.target.value)) : undefined,
                })
              }
              className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-3 py-2.5 text-base font-bold text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Trừ bao => tính ký */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-sm font-extrabold text-slate-800">
              <Scale className="h-4 w-4 text-emerald-700" />
              Cách trừ bao (quy ra ký thực)
            </span>
            <span className="text-sm font-bold text-emerald-900">
              Đang trừ: <strong className="text-base font-black">{formatWeight(summary.tareWeight)} kg</strong> ({summary.bagCount} bao)
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <label
              className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 p-3 text-sm transition ${
                record.tareConfig.mode === 'bags_per_kg'
                  ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-950'
                  : 'border-slate-200 bg-white font-semibold text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="tareMode"
                checked={record.tareConfig.mode === 'bags_per_kg'}
                onChange={() => updateTareMode('bags_per_kg')}
                className="h-4 w-4 accent-emerald-700"
              />
              <div className="flex flex-1 items-center gap-1.5">
                <input
                  type="number"
                  inputMode="decimal"
                  min="1"
                  value={record.tareConfig.bagsPerKg}
                  onChange={(e) =>
                    onChange({
                      ...record,
                      tareConfig: {
                        ...record.tareConfig,
                        mode: 'bags_per_kg',
                        bagsPerKg: Math.max(1, Number(e.target.value) || 8),
                      },
                    })
                  }
                  className="w-14 rounded-lg border-2 border-slate-300 bg-white px-2 py-1 text-center text-base font-black"
                />
                <span>bao trừ 1 kg</span>
              </div>
            </label>

            <label
              className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 p-3 text-sm transition ${
                record.tareConfig.mode === 'kg_per_bag'
                  ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-950'
                  : 'border-slate-200 bg-white font-semibold text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="tareMode"
                checked={record.tareConfig.mode === 'kg_per_bag'}
                onChange={() => updateTareMode('kg_per_bag')}
                className="h-4 w-4 accent-emerald-700"
              />
              <div className="flex flex-1 items-center gap-1.5">
                <span>Mỗi bao</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={record.tareConfig.kgPerBag}
                  onChange={(e) =>
                    onChange({
                      ...record,
                      tareConfig: {
                        ...record.tareConfig,
                        mode: 'kg_per_bag',
                        kgPerBag: Math.max(0, Number(e.target.value) || 0),
                      },
                    })
                  }
                  className="w-16 rounded-lg border-2 border-slate-300 bg-white px-2 py-1 text-center text-base font-black"
                />
                <span>kg</span>
              </div>
            </label>

            <label
              className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 p-3 text-sm transition ${
                record.tareConfig.mode === 'manual_kg'
                  ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-950'
                  : 'border-slate-200 bg-white font-semibold text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="tareMode"
                checked={record.tareConfig.mode === 'manual_kg'}
                onChange={() => updateTareMode('manual_kg')}
                className="h-4 w-4 accent-emerald-700"
              />
              <div className="flex flex-1 items-center gap-1.5">
                <span>Nhập tay</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min="0"
                  value={record.tareConfig.manualTareKg}
                  onChange={(e) =>
                    onChange({
                      ...record,
                      tareConfig: {
                        ...record.tareConfig,
                        mode: 'manual_kg',
                        manualTareKg: Math.max(0, Number(e.target.value) || 0),
                      },
                    })
                  }
                  className="w-16 rounded-lg border-2 border-slate-300 bg-white px-2 py-1 text-center text-base font-black"
                />
                <span>kg</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Bảng nhập trọng lượng từng bao */}
      <WeighingGrid
        tables={record.tables}
        quickThreeDigitDecimal={quickThreeDigitDecimal}
        onToggleQuickThreeDigit={onToggleQuickThreeDigit}
        onChangeTables={(tables) => onChange({ ...record, tables })}
      />

      {/* Kết quả tính tiền & Ghi chú */}
      <div className="rounded-2xl border-2 border-emerald-700 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-4 shadow-sm">
        <h2 className="mb-3 text-base font-extrabold uppercase tracking-wide text-emerald-950">
          2. Tổng kết & Tính tiền lúa
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-white p-3.5 shadow-xs ring-1 ring-slate-200">
            <div className="text-xs font-bold text-slate-600">Tổng số bao</div>
            <div className="mt-1 text-2xl font-black text-slate-950 tabular-nums">
              {summary.bagCount} <span className="text-sm font-bold">bao</span>
            </div>
          </div>

          <div className="rounded-xl bg-white p-3.5 shadow-xs ring-1 ring-slate-200">
            <div className="text-xs font-bold text-slate-600">Tổng trọng lượng thô</div>
            <div className="mt-1 text-2xl font-black text-slate-950 tabular-nums">
              {formatWeight(summary.grossWeight)}{' '}
              <span className="text-sm font-bold">kg</span>
            </div>
          </div>

          <div className="rounded-xl bg-white p-3.5 shadow-xs ring-1 ring-slate-200">
            <div className="text-xs font-bold text-slate-600">Trừ bao</div>
            <div className="mt-1 text-2xl font-black text-rose-700 tabular-nums">
              -{formatWeight(summary.tareWeight)}{' '}
              <span className="text-sm font-bold">kg</span>
            </div>
          </div>

          <div className="rounded-xl bg-emerald-700 p-3.5 text-white shadow-sm">
            <div className="text-xs font-bold text-emerald-100">Số ký thực tính tiền</div>
            <div className="mt-1 text-2xl font-black tabular-nums">
              {formatWeight(summary.netWeight)}{' '}
              <span className="text-sm font-bold">kg</span>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-amber-100 p-3.5 ring-2 ring-amber-400">
            <div className="text-xs font-extrabold text-amber-950">
              Thành tiền ({formatWeight(summary.netWeight)} kg ×{' '}
              {formatCurrency(record.pricePerKg)})
            </div>
            <div className="mt-1 text-2xl sm:text-3xl font-black text-amber-950 tabular-nums">
              {formatCurrency(summary.totalAmount)}
            </div>
          </div>

          <div className="rounded-xl bg-white p-3.5 ring-1 ring-slate-200">
            <label className="text-xs font-bold text-slate-700">
              Tiền cọc / Đã trả trước (đ)
            </label>
            <input
              type="number"
              inputMode="numeric"
              step="10000"
              min="0"
              placeholder="0"
              value={record.deposit || ''}
              onChange={(e) =>
                onChange({
                  ...record,
                  deposit: Math.max(0, Number(e.target.value) || 0),
                })
              }
              className="mt-1.5 w-full rounded-xl border-2 border-slate-300 px-3 py-2 text-lg font-black text-slate-950 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="rounded-xl bg-white p-3.5 ring-1 ring-slate-200">
            <div className="text-xs font-bold text-slate-700">
              Còn lại phải thanh toán
            </div>
            <div
              className={`mt-1 text-2xl sm:text-3xl font-black tabular-nums ${
                summary.remainingAmount >= 0 ? 'text-emerald-800' : 'text-rose-700'
              }`}
            >
              {formatCurrency(summary.remainingAmount)}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <label className="mb-1.5 block text-sm font-bold text-slate-800">
            Ghi chú phiếu cân
          </label>
          <input
            type="text"
            placeholder="VD: Lúa đẹp, trừ ẩm 0%, giao tại bến..."
            value={record.notes}
            onChange={(e) => onChange({ ...record, notes: e.target.value })}
            className="w-full rounded-xl border-2 border-slate-300 bg-white px-3 py-2.5 text-base font-medium text-slate-900 focus:border-emerald-600 focus:outline-none"
          />
        </div>

        {/* Hiệu quả trung bình / 1 công đất */}
        {record.areaCong && record.areaCong > 0 ? (
          <div className="mt-4 rounded-xl border-2 border-emerald-300 bg-white p-3.5">
            <div className="mb-2 text-sm font-extrabold text-emerald-900">
              Trung bình trên 1 công đất ({record.areaCong} công)
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <div className="rounded-lg bg-emerald-50 p-2.5">
                <div className="text-xs font-bold text-slate-600">Bao / công</div>
                <div className="text-xl font-black text-emerald-900">
                  {summary.bagsPerCong !== null ? formatWeight(summary.bagsPerCong) : '0'}
                </div>
              </div>
              <div className="rounded-lg bg-emerald-50 p-2.5">
                <div className="text-xs font-bold text-slate-600">Ký / công</div>
                <div className="text-xl font-black text-emerald-900">
                  {summary.kgPerCong !== null ? `${formatWeight(summary.kgPerCong)} kg` : '0'}
                </div>
              </div>
              <div className="rounded-lg bg-amber-50 p-2.5">
                <div className="text-xs font-bold text-slate-600">Tiền lúa / công</div>
                <div className="text-lg font-black text-amber-950">
                  {summary.amountPerCong !== null ? formatCurrency(summary.amountPerCong) : '0 đ'}
                </div>
              </div>
              <div className="rounded-lg bg-slate-100 p-2.5">
                <div className="text-xs font-bold text-slate-600">Lợi nhuận / công</div>
                <div
                  className={`text-lg font-black ${
                    (summary.profitPerCong ?? 0) >= 0 ? 'text-emerald-800' : 'text-rose-700'
                  }`}
                >
                  {summary.profitPerCong !== null ? formatCurrency(summary.profitPerCong) : '0 đ'}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* 3. Chi phí & Tính lợi nhuận */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-base font-extrabold uppercase tracking-wide text-slate-800">
            <Wallet className="h-5 w-5 text-emerald-700" />
            3. Chi phí & Lợi nhuận
          </h2>
          <button
            type="button"
            onClick={() => handleAddExpense('')}
            className="no-print inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-slate-900 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Thêm khoản chi
          </button>
        </div>

        {/* Nút thêm nhanh các loại chi phí thường gặp */}
        <div className="no-print mb-3 flex flex-wrap gap-1.5">
          {EXPENSE_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handleAddExpense(preset)}
              className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-emerald-50 hover:border-emerald-400 active:scale-95"
            >
              + {preset}
            </button>
          ))}
        </div>

        {expenses.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-3 text-sm font-medium text-slate-500">
            Chưa có khoản chi phí nào. Bấm các nút phía trên để thêm chi phí giống, phân bón, công cắt... sau khi lưu phiếu.
          </p>
        ) : (
          <div className="space-y-2.5">
            {expenses.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5"
              >
                <input
                  type="text"
                  placeholder="Tên khoản chi (VD: Phân bón)..."
                  value={item.name}
                  onChange={(e) =>
                    handleUpdateExpense(item.id, 'name', e.target.value)
                  }
                  className="min-w-[160px] flex-1 rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-base font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
                <input
                  type="number"
                  inputMode="numeric"
                  step="10000"
                  min="0"
                  placeholder="Số tiền (đ)"
                  value={item.amount || ''}
                  onChange={(e) =>
                    handleUpdateExpense(item.id, 'amount', e.target.value)
                  }
                  className="w-40 rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-right text-base font-black text-rose-700 focus:border-emerald-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveExpense(item.id)}
                  className="no-print rounded-xl p-2.5 text-rose-600 hover:bg-rose-100"
                  title="Xóa khoản chi"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-100 p-3.5">
            <div className="text-xs font-bold text-slate-600">Tổng tiền lúa</div>
            <div className="mt-1 text-xl font-black text-slate-900 tabular-nums">
              {formatCurrency(summary.totalAmount)}
            </div>
          </div>
          <div className="rounded-xl bg-rose-50 p-3.5 ring-1 ring-rose-200">
            <div className="text-xs font-bold text-rose-800">Tổng chi phí</div>
            <div className="mt-1 text-xl font-black text-rose-700 tabular-nums">
              -{formatCurrency(summary.totalExpenses)}
            </div>
          </div>
          <div className="rounded-xl bg-emerald-700 p-3.5 text-white shadow-sm">
            <div className="text-xs font-bold text-emerald-100">Lợi nhuận thực</div>
            <div className="mt-1 text-2xl font-black tabular-nums">
              {formatCurrency(summary.profit)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

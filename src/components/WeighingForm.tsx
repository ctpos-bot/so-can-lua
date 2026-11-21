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
} from 'lucide-react';
import type { Plot, TareMode, WeighingRecord } from '../types/weighing';
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
        riceVariety: found.riceVariety || record.riceVariety,
        farmerName: found.owner || record.farmerName,
      });
    }
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

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onNewRecord}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95"
          >
            <FilePlus2 className="h-4 w-4" />
            Phiếu mới
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95"
          >
            <Printer className="h-4 w-4" />
            In phiếu
          </button>
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 active:scale-95"
          >
            <Save className="h-4 w-4" />
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
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600">
          1. Thông tin phiếu cân
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Ngày cân */}
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Calendar className="h-3.5 w-3.5 text-emerald-700" />
              Ngày cân
            </label>
            <input
              type="date"
              value={record.date}
              onChange={(e) => onChange({ ...record, date: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Khuông đất */}
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <MapPin className="h-3.5 w-3.5 text-emerald-700" />
              Khuông đất
            </label>
            <div className="flex gap-1.5">
              {plots.length > 0 && (
                <select
                  value={record.plotId || ''}
                  onChange={(e) => handlePlotSelect(e.target.value)}
                  className="w-2/5 rounded-xl border border-slate-300 bg-slate-50 px-2 py-2 text-xs font-medium text-slate-800 focus:border-emerald-600 focus:bg-white focus:outline-none"
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
                className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Người cân */}
          <div>
            <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <User className="h-3.5 w-3.5 text-emerald-700" />
              Người cân
            </label>
            <input
              type="text"
              placeholder="Tên người cân..."
              value={record.weigherName}
              onChange={(e) => onChange({ ...record, weigherName: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
            />
            {weighers.length > 0 && (
              <div className="no-print mt-1.5 flex flex-wrap gap-1">
                {weighers.slice(0, 5).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => onChange({ ...record, weigherName: w })}
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition ${
                      record.weigherName === w
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
            <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Coins className="h-3.5 w-3.5 text-amber-600" />
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
              className="w-full rounded-xl border border-amber-300 bg-amber-50/40 px-3 py-2 text-sm font-bold text-amber-900 focus:border-amber-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Giống lúa */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Giống lúa (tùy chọn)
            </label>
            <input
              type="text"
              placeholder="VD: OM 18, Đài Thơm 8, ST25..."
              value={record.riceVariety}
              onChange={(e) => onChange({ ...record, riceVariety: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Chủ ruộng */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Chủ ruộng / Thương lái (tùy chọn)
            </label>
            <input
              type="text"
              placeholder="Tên chủ ruộng..."
              value={record.farmerName}
              onChange={(e) => onChange({ ...record, farmerName: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Trừ bao => tính ký */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Scale className="h-4 w-4 text-emerald-700" />
              Cách trừ bao (quy ra ký thực)
            </span>
            <span className="text-xs font-semibold text-emerald-800">
              Đang trừ: <strong>{formatWeight(summary.tareWeight)} kg</strong> ({summary.bagCount} bao)
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <label
              className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-xs transition ${
                record.tareConfig.mode === 'bags_per_kg'
                  ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-900'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="tareMode"
                checked={record.tareConfig.mode === 'bags_per_kg'}
                onChange={() => updateTareMode('bags_per_kg')}
                className="accent-emerald-700"
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
                  className="w-12 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-center font-bold"
                />
                <span>bao trừ 1 kg</span>
              </div>
            </label>

            <label
              className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-xs transition ${
                record.tareConfig.mode === 'kg_per_bag'
                  ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-900'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="tareMode"
                checked={record.tareConfig.mode === 'kg_per_bag'}
                onChange={() => updateTareMode('kg_per_bag')}
                className="accent-emerald-700"
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
                  className="w-14 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-center font-bold"
                />
                <span>kg</span>
              </div>
            </label>

            <label
              className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-xs transition ${
                record.tareConfig.mode === 'manual_kg'
                  ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-900'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="tareMode"
                checked={record.tareConfig.mode === 'manual_kg'}
                onChange={() => updateTareMode('manual_kg')}
                className="accent-emerald-700"
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
                  className="w-16 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-center font-bold"
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
        onChangeTables={(tables) => onChange({ ...record, tables })}
      />

      {/* Kết quả tính tiền & Ghi chú */}
      <div className="rounded-2xl border-2 border-emerald-600 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-emerald-900">
          2. Tổng kết & Tính tiền lúa
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-white p-3 shadow-xs ring-1 ring-slate-200">
            <div className="text-xs text-slate-500">Tổng số bao</div>
            <div className="mt-0.5 text-xl font-extrabold text-slate-900 tabular-nums">
              {summary.bagCount} <span className="text-xs font-normal">bao</span>
            </div>
          </div>

          <div className="rounded-xl bg-white p-3 shadow-xs ring-1 ring-slate-200">
            <div className="text-xs text-slate-500">Tổng trọng lượng thô</div>
            <div className="mt-0.5 text-xl font-extrabold text-slate-900 tabular-nums">
              {formatWeight(summary.grossWeight)}{' '}
              <span className="text-xs font-normal">kg</span>
            </div>
          </div>

          <div className="rounded-xl bg-white p-3 shadow-xs ring-1 ring-slate-200">
            <div className="text-xs text-slate-500">Trừ bao</div>
            <div className="mt-0.5 text-xl font-extrabold text-rose-600 tabular-nums">
              -{formatWeight(summary.tareWeight)}{' '}
              <span className="text-xs font-normal">kg</span>
            </div>
          </div>

          <div className="rounded-xl bg-emerald-700 p-3 text-white shadow-sm">
            <div className="text-xs text-emerald-100">Số ký thực tính tiền</div>
            <div className="mt-0.5 text-xl font-extrabold tabular-nums">
              {formatWeight(summary.netWeight)}{' '}
              <span className="text-xs font-normal">kg</span>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-amber-100/80 p-3 ring-1 ring-amber-300">
            <div className="text-xs font-semibold text-amber-900">
              Thành tiền ({formatWeight(summary.netWeight)} kg ×{' '}
              {formatCurrency(record.pricePerKg)})
            </div>
            <div className="mt-1 text-2xl font-black text-amber-950 tabular-nums">
              {formatCurrency(summary.totalAmount)}
            </div>
          </div>

          <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
            <label className="text-xs font-semibold text-slate-600">
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
              className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-base font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
            <div className="text-xs font-semibold text-slate-600">
              Còn lại phải thanh toán
            </div>
            <div
              className={`mt-1 text-2xl font-black tabular-nums ${
                summary.remainingAmount >= 0 ? 'text-emerald-800' : 'text-rose-700'
              }`}
            >
              {formatCurrency(summary.remainingAmount)}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <label className="mb-1 block text-xs font-semibold text-slate-700">
            Ghi chú phiếu cân
          </label>
          <input
            type="text"
            placeholder="VD: Lúa đẹp, trừ ẩm 0%, giao tại bến..."
            value={record.notes}
            onChange={(e) => onChange({ ...record, notes: e.target.value })}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};

import React, { useMemo, useState } from 'react';
import {
  Search,
  Edit3,
  Trash2,
  Copy,
  MapPin,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import type { WeighingRecord } from '../types/weighing';
import {
  calcRecordSummary,
  formatCurrency,
  formatDateVN,
  formatWeight,
} from '../utils/calculations';

interface RecordsListProps {
  records: WeighingRecord[];
  onSelectRecord: (record: WeighingRecord) => void;
  onDuplicateRecord: (record: WeighingRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export const RecordsList: React.FC<RecordsListProps> = ({
  records,
  onSelectRecord,
  onDuplicateRecord,
  onDeleteRecord,
}) => {
  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterPlot, setFilterPlot] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const uniquePlots = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.plotName) set.add(r.plotName);
    });
    return Array.from(set);
  }, [records]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...records]
      .sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt - a.updatedAt)
      .filter((rec) => {
        if (filterDate && rec.date !== filterDate) return false;
        if (filterPlot && rec.plotName !== filterPlot) return false;
        if (!q) return true;
        return (
          rec.code.toLowerCase().includes(q) ||
          rec.plotName.toLowerCase().includes(q) ||
          rec.weigherName.toLowerCase().includes(q) ||
          rec.farmerName.toLowerCase().includes(q) ||
          rec.riceVariety.toLowerCase().includes(q)
        );
      });
  }, [records, search, filterDate, filterPlot]);

  const hasActiveFilter = Boolean(search || filterDate || filterPlot);

  return (
    <div className="space-y-3 pb-6">
      {/* Thanh tìm kiếm & bộ lọc thu gọn */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h2 className="text-lg font-black text-slate-900">
            Sổ cân ({filtered.length} phiếu)
          </h2>
          <div className="flex items-center gap-2">
            {hasActiveFilter && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setFilterDate('');
                  setFilterPlot('');
                }}
                className="text-sm font-bold text-rose-600 hover:underline"
              >
                Xóa lọc
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-bold transition ${
                showFilters || filterDate || filterPlot
                  ? 'bg-emerald-700 text-white'
                  : 'border border-slate-300 bg-slate-50 text-slate-800'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Lọc
            </button>
          </div>
        </div>

        <div className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm khuông đất, người cân, mã..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-w-0 rounded-xl border-2 border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-base font-bold text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
          />
        </div>

        {(showFilters || filterDate || filterPlot) && (
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="block w-full min-w-0 max-w-full rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 text-base font-bold text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
            />
            <select
              value={filterPlot}
              onChange={(e) => setFilterPlot(e.target.value)}
              className="w-full min-w-0 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 text-base font-bold text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
            >
              <option value="">Tất cả khuông đất</option>
              {uniquePlots.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-2 text-base font-bold text-slate-700">
            Chưa có phiếu cân nào
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Chuyển sang mục Cân Lúa để tạo phiếu mới.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((rec) => {
            const s = calcRecordSummary(rec);
            return (
              <div
                key={rec.id}
                className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs transition hover:border-emerald-400"
              >
                {/* Dòng 1: Mã phiếu, ngày, giống lúa */}
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-lg bg-emerald-100 px-2.5 py-0.5 text-xs font-extrabold text-emerald-900">
                      {rec.code}
                    </span>
                    <span className="text-sm font-bold text-slate-600">
                      {formatDateVN(rec.date)}
                    </span>
                    {rec.riceVariety && (
                      <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-xs font-extrabold text-amber-900">
                        {rec.riceVariety}
                      </span>
                    )}
                  </div>
                </div>

                {/* Dòng 2: Tên khuông đất + Thành tiền */}
                <div className="mt-1.5 flex items-baseline justify-between gap-2">
                  <h3 className="flex min-w-0 items-center gap-1.5 text-lg font-black text-slate-950">
                    <MapPin className="h-5 w-5 shrink-0 text-emerald-700" />
                    <span className="truncate">
                      {rec.plotName || 'Chưa ghi khuông'}
                    </span>
                  </h3>
                  <div className="shrink-0 text-right text-xl font-black text-emerald-800 tabular-nums">
                    {formatCurrency(s.totalAmount)}
                  </div>
                </div>

                {/* Dòng 3: Người cân, chủ ruộng, đơn giá */}
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm font-semibold text-slate-600">
                  <span>
                    Cân: <strong className="text-slate-900">{rec.weigherName || '—'}</strong>
                  </span>
                  {rec.farmerName && (
                    <span>
                      Chủ: <strong className="text-slate-900">{rec.farmerName}</strong>
                    </span>
                  )}
                  <span>
                    Giá: <strong className="text-amber-900">{formatCurrency(rec.pricePerKg)}/kg</strong>
                  </span>
                </div>

                {/* Dòng 4: 4 chỉ số thu gọn, chữ to */}
                <div className="mt-2.5 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-2.5 sm:grid-cols-4">
                  <div className="text-center">
                    <div className="text-xs font-bold text-slate-500">Số bao</div>
                    <div className="text-base font-black text-slate-900">
                      {s.bagCount} bao
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-slate-500">Ký thực</div>
                    <div className="text-base font-black text-emerald-800">
                      {formatWeight(s.netWeight)} kg
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-slate-500">Chi phí</div>
                    <div className="text-base font-black text-rose-700">
                      {formatCurrency(s.totalExpenses)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-slate-500">Lợi nhuận</div>
                    <div
                      className={`text-base font-black ${
                        s.profit >= 0 ? 'text-emerald-800' : 'text-rose-700'
                      }`}
                    >
                      {formatCurrency(s.profit)}
                    </div>
                  </div>
                </div>

                {/* Dòng 5: 3 nút nằm gọn 1 hàng */}
                <div className="mt-2.5 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => onDuplicateRecord(rec)}
                    className="inline-flex items-center justify-center gap-1 rounded-xl border-2 border-slate-200 py-2.5 text-sm font-extrabold text-slate-800 hover:bg-slate-50 active:scale-95"
                  >
                    <Copy className="h-4 w-4 shrink-0" />
                    Nhân bản
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteRecord(rec.id)}
                    className="inline-flex items-center justify-center gap-1 rounded-xl border-2 border-rose-200 py-2.5 text-sm font-extrabold text-rose-700 hover:bg-rose-50 active:scale-95"
                  >
                    <Trash2 className="h-4 w-4 shrink-0" />
                    Xóa
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectRecord(rec)}
                    className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-700 py-2.5 text-sm font-extrabold text-white hover:bg-emerald-800 active:scale-95"
                  >
                    <Edit3 className="h-4 w-4 shrink-0" />
                    Mở / Sửa
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

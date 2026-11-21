import React, { useMemo, useState } from 'react';
import {
  Search,
  Edit3,
  Trash2,
  Copy,
  Calendar,
  MapPin,
  User,
  FileText,
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

  return (
    <div className="space-y-4 pb-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-base font-bold text-slate-800">
          Sổ cân lúa ({filtered.length} phiếu)
        </h2>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm mã phiếu, khuông đất, người cân..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-emerald-600 focus:bg-white focus:outline-none"
            />
          </div>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-600 focus:bg-white focus:outline-none"
          />

          <select
            value={filterPlot}
            onChange={(e) => setFilterPlot(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-600 focus:bg-white focus:outline-none"
          >
            <option value="">Tất cả khuông đất</option>
            {uniquePlots.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {(search || filterDate || filterPlot) && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setFilterDate('');
              setFilterPlot('');
            }}
            className="mt-2 text-xs font-semibold text-emerald-700 hover:underline"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <FileText className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-2 text-sm font-semibold text-slate-600">
            Chưa có phiếu cân nào phù hợp
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Hãy chuyển sang mục Cân Lúa để tạo phiếu cân mới.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((rec) => {
            const s = calcRecordSummary(rec);
            return (
              <div
                key={rec.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-emerald-300"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                        {rec.code}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDateVN(rec.date)}
                      </span>
                      {rec.riceVariety && (
                        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                          {rec.riceVariety}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1.5 flex items-center gap-1.5 text-base font-bold text-slate-900">
                      <MapPin className="h-4 w-4 text-emerald-700" />
                      {rec.plotName || 'Chưa ghi khuông đất'}
                    </h3>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        Người cân: <strong>{rec.weigherName || 'Chưa rõ'}</strong>
                      </span>
                      {rec.farmerName && (
                        <span>
                          Chủ ruộng: <strong>{rec.farmerName}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-500">Thành tiền</div>
                    <div className="text-lg font-black text-emerald-800 tabular-nums">
                      {formatCurrency(s.totalAmount)}
                    </div>
                    <div className="text-xs font-medium text-slate-500">
                      Giá: {formatCurrency(rec.pricePerKg)}/kg
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-4 gap-2 rounded-xl bg-slate-50 p-2.5 text-center text-xs">
                  <div>
                    <div className="text-slate-500">Số bao</div>
                    <div className="font-bold text-slate-800">{s.bagCount}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">Tổng thô</div>
                    <div className="font-bold text-slate-800">
                      {formatWeight(s.grossWeight)} kg
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Trừ bao</div>
                    <div className="font-bold text-rose-600">
                      -{formatWeight(s.tareWeight)} kg
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Ký thực</div>
                    <div className="font-bold text-emerald-800">
                      {formatWeight(s.netWeight)} kg
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onDuplicateRecord(rec)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Nhân bản
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteRecord(rec.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Xóa
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectRecord(rec)}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
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

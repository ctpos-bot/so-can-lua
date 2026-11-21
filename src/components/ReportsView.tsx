import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Download,
  MapPin,
  User,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import type { Plot, WeighingRecord } from '../types/weighing';
import {
  calcRecordSummary,
  exportRecordsToCSV,
  formatCurrency,
  formatDateVN,
  formatWeight,
  getTodayISO,
} from '../utils/calculations';

interface ReportsViewProps {
  records: WeighingRecord[];
  plots: Plot[];
}

type RangePreset = 'all' | 'today' | '7days' | 'month' | 'custom';

export const ReportsView: React.FC<ReportsViewProps> = ({ records, plots }) => {
  const [preset, setPreset] = useState<RangePreset>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [plotFilter, setPlotFilter] = useState('');
  const [weigherFilter, setWeigherFilter] = useState('');

  const uniquePlots = useMemo(() => {
    const s = new Set<string>();
    records.forEach((r) => s.add(r.plotName || 'Chưa phân loại'));
    return Array.from(s);
  }, [records]);

  const uniqueWeighers = useMemo(() => {
    const s = new Set<string>();
    records.forEach((r) => {
      if (r.weigherName) s.add(r.weigherName);
    });
    return Array.from(s);
  }, [records]);

  const filteredRecords = useMemo(() => {
    const today = getTodayISO();
    const now = new Date();
    const d7 = new Date(now);
    d7.setDate(now.getDate() - 6);
    const d7ISO = d7.toISOString().slice(0, 10);
    const monthPrefix = today.slice(0, 7);

    return records.filter((rec) => {
      if (preset === 'today' && rec.date !== today) return false;
      if (preset === '7days' && rec.date < d7ISO) return false;
      if (preset === 'month' && !rec.date.startsWith(monthPrefix)) return false;
      if (preset === 'custom') {
        if (fromDate && rec.date < fromDate) return false;
        if (toDate && rec.date > toDate) return false;
      }
      const pName = rec.plotName || 'Chưa phân loại';
      if (plotFilter && pName !== plotFilter) return false;
      if (weigherFilter && rec.weigherName !== weigherFilter) return false;
      return true;
    });
  }, [records, preset, fromDate, toDate, plotFilter, weigherFilter]);

  const totals = useMemo(() => {
    let bagCount = 0;
    let grossWeight = 0;
    let tareWeight = 0;
    let netWeight = 0;
    let totalAmount = 0;

    for (const r of filteredRecords) {
      const s = calcRecordSummary(r);
      bagCount += s.bagCount;
      grossWeight += s.grossWeight;
      tareWeight += s.tareWeight;
      netWeight += s.netWeight;
      totalAmount += s.totalAmount;
    }

    const avgPrice = netWeight > 0 ? totalAmount / netWeight : 0;

    return {
      recordCount: filteredRecords.length,
      bagCount,
      grossWeight: Math.round(grossWeight * 100) / 100,
      tareWeight: Math.round(tareWeight * 100) / 100,
      netWeight: Math.round(netWeight * 100) / 100,
      totalAmount: Math.round(totalAmount),
      avgPrice: Math.round(avgPrice),
    };
  }, [filteredRecords]);

  const byPlot = useMemo(() => {
    const map = new Map<
      string,
      {
        plotName: string;
        records: number;
        bags: number;
        netKg: number;
        amount: number;
        areaCong?: number;
      }
    >();

    for (const r of filteredRecords) {
      const key = r.plotName || 'Chưa phân loại';
      const s = calcRecordSummary(r);
      const existing = map.get(key) || {
        plotName: key,
        records: 0,
        bags: 0,
        netKg: 0,
        amount: 0,
        areaCong: plots.find((p) => p.name === key)?.areaCong,
      };
      existing.records += 1;
      existing.bags += s.bagCount;
      existing.netKg = Math.round((existing.netKg + s.netWeight) * 100) / 100;
      existing.amount += s.totalAmount;
      map.set(key, existing);
    }

    return Array.from(map.values()).sort((a, b) => b.netKg - a.netKg);
  }, [filteredRecords, plots]);

  const byWeigher = useMemo(() => {
    const map = new Map<
      string,
      { name: string; records: number; bags: number; netKg: number; amount: number }
    >();
    for (const r of filteredRecords) {
      const key = r.weigherName || 'Chưa ghi tên';
      const s = calcRecordSummary(r);
      const existing = map.get(key) || {
        name: key,
        records: 0,
        bags: 0,
        netKg: 0,
        amount: 0,
      };
      existing.records += 1;
      existing.bags += s.bagCount;
      existing.netKg = Math.round((existing.netKg + s.netWeight) * 100) / 100;
      existing.amount += s.totalAmount;
      map.set(key, existing);
    }
    return Array.from(map.values()).sort((a, b) => b.netKg - a.netKg);
  }, [filteredRecords]);

  const byDate = useMemo(() => {
    const map = new Map<
      string,
      { date: string; records: number; bags: number; netKg: number; amount: number }
    >();
    for (const r of filteredRecords) {
      const s = calcRecordSummary(r);
      const existing = map.get(r.date) || {
        date: r.date,
        records: 0,
        bags: 0,
        netKg: 0,
        amount: 0,
      };
      existing.records += 1;
      existing.bags += s.bagCount;
      existing.netKg = Math.round((existing.netKg + s.netWeight) * 100) / 100;
      existing.amount += s.totalAmount;
      map.set(r.date, existing);
    }
    return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredRecords]);

  const maxPlotKg = byPlot[0]?.netKg || 1;
  const maxDateKg = Math.max(...byDate.map((d) => d.netKg), 1);

  return (
    <div className="space-y-4 pb-6">
      {/* Bộ lọc báo cáo */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-700" />
            <h2 className="text-base font-bold text-slate-800">
              Báo cáo số liệu cân lúa
            </h2>
          </div>
          <button
            type="button"
            disabled={filteredRecords.length === 0}
            onClick={() => exportRecordsToCSV(filteredRecords)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            Xuất Excel (CSV)
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(
            [
              ['all', 'Tất cả'],
              ['today', 'Hôm nay'],
              ['7days', '7 ngày qua'],
              ['month', 'Tháng này'],
              ['custom', 'Tùy chọn ngày'],
            ] as [RangePreset, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setPreset(key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                preset === key
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {preset === 'custom' && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-500">
                Từ ngày
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500">
                Đến ngày
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-sm"
              />
            </div>
          </div>
        )}

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <select
            value={plotFilter}
            onChange={(e) => setPlotFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800"
          >
            <option value="">Tất cả khuông đất</option>
            {uniquePlots.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            value={weigherFilter}
            onChange={(e) => setWeigherFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800"
          >
            <option value="">Tất cả người cân</option>
            {uniqueWeighers.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <div className="text-xs text-slate-500">Tổng số phiếu / bao</div>
          <div className="mt-1 text-xl font-black text-slate-900">
            {totals.recordCount}{' '}
            <span className="text-xs font-medium text-slate-500">
              phiếu • {totals.bagCount} bao
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <div className="text-xs text-slate-500">Tổng thô / Trừ bao</div>
          <div className="mt-1 text-lg font-extrabold text-slate-900">
            {formatWeight(totals.grossWeight)} kg
          </div>
          <div className="text-xs font-semibold text-rose-600">
            Trừ bao: -{formatWeight(totals.tareWeight)} kg
          </div>
        </div>

        <div className="rounded-2xl bg-emerald-700 p-3.5 text-white shadow-sm">
          <div className="text-xs text-emerald-100">Tổng ký thực</div>
          <div className="mt-1 text-xl font-black tabular-nums">
            {formatWeight(totals.netWeight)} kg
          </div>
          <div className="text-[11px] text-emerald-100">
            ≈ {formatWeight(totals.netWeight / 1000)} tấn
          </div>
        </div>

        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3.5 shadow-xs">
          <div className="text-xs font-semibold text-amber-900">Tổng thành tiền</div>
          <div className="mt-1 text-xl font-black text-amber-950 tabular-nums">
            {formatCurrency(totals.totalAmount)}
          </div>
          <div className="text-[11px] font-medium text-amber-800">
            Giá TB: {formatCurrency(totals.avgPrice)}/kg
          </div>
        </div>
      </div>

      {/* Theo khuông đất */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-slate-800">
          <MapPin className="h-4 w-4 text-emerald-700" />
          Sản lượng & Doanh thu theo Khuông đất
        </h3>
        {byPlot.length === 0 ? (
          <p className="text-xs text-slate-400">Chưa có dữ liệu</p>
        ) : (
          <div className="space-y-3">
            {byPlot.map((item) => {
              const pct = Math.round((item.netKg / maxPlotKg) * 100);
              return (
                <div key={item.plotName} className="space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      <strong className="text-sm text-slate-900">
                        {item.plotName}
                      </strong>
                      <span className="ml-2 text-slate-500">
                        ({item.records} phiếu • {item.bags} bao)
                      </span>
                      {item.areaCong ? (
                        <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                          {formatWeight(item.netKg / item.areaCong)} kg/công
                        </span>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-800">
                        {formatWeight(item.netKg)} kg
                      </span>
                      <span className="mx-1.5 text-slate-300">|</span>
                      <span className="font-bold text-amber-900">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Theo người cân & Theo ngày */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-slate-800">
            <User className="h-4 w-4 text-emerald-700" />
            Thống kê theo Người cân
          </h3>
          {byWeigher.length === 0 ? (
            <p className="text-xs text-slate-400">Chưa có dữ liệu</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {byWeigher.map((w) => (
                <div
                  key={w.name}
                  className="flex items-center justify-between py-2.5 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-800">{w.name}</div>
                    <div className="text-slate-500">
                      {w.records} phiếu • {w.bags} bao
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-800">
                      {formatWeight(w.netKg)} kg
                    </div>
                    <div className="text-slate-500">{formatCurrency(w.amount)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-slate-800">
            <Calendar className="h-4 w-4 text-emerald-700" />
            Thống kê theo Ngày cân
          </h3>
          {byDate.length === 0 ? (
            <p className="text-xs text-slate-400">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-2.5">
              {byDate.map((d) => {
                const pct = Math.round((d.netKg / maxDateKg) * 100);
                return (
                  <div key={d.date} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">
                        {formatDateVN(d.date)}{' '}
                        <span className="font-normal text-slate-500">
                          ({d.bags} bao)
                        </span>
                      </span>
                      <span className="font-bold text-emerald-800">
                        {formatWeight(d.netKg)} kg • {formatCurrency(d.amount)}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-amber-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs text-slate-600">
        <TrendingUp className="h-4 w-4 text-emerald-700" />
        Mẹo: Bấm "Xuất Excel (CSV)" để tải bảng kê chi tiết mở trực tiếp trên Excel điện thoại hoặc máy tính.
      </div>
    </div>
  );
};

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
    let totalExpenses = 0;
    let areaWithData = 0;
    let bagsWithArea = 0;
    let netKgWithArea = 0;
    let amountWithArea = 0;
    let profitWithArea = 0;

    for (const r of filteredRecords) {
      const s = calcRecordSummary(r);
      bagCount += s.bagCount;
      grossWeight += s.grossWeight;
      tareWeight += s.tareWeight;
      netWeight += s.netWeight;
      totalAmount += s.totalAmount;
      totalExpenses += s.totalExpenses;

      const area =
        r.areaCong && r.areaCong > 0
          ? r.areaCong
          : plots.find((p) => p.name === r.plotName)?.areaCong || 0;
      if (area > 0) {
        areaWithData += area;
        bagsWithArea += s.bagCount;
        netKgWithArea += s.netWeight;
        amountWithArea += s.totalAmount;
        profitWithArea += s.profit;
      }
    }

    const avgPrice = netWeight > 0 ? totalAmount / netWeight : 0;
    const totalProfit = totalAmount - totalExpenses;

    return {
      recordCount: filteredRecords.length,
      bagCount,
      grossWeight: Math.round(grossWeight * 100) / 100,
      tareWeight: Math.round(tareWeight * 100) / 100,
      netWeight: Math.round(netWeight * 100) / 100,
      totalAmount: Math.round(totalAmount),
      totalExpenses: Math.round(totalExpenses),
      totalProfit: Math.round(totalProfit),
      avgPrice: Math.round(avgPrice),
      areaWithData: Math.round(areaWithData * 100) / 100,
      avgBagsPerCong:
        areaWithData > 0 ? Math.round((bagsWithArea / areaWithData) * 100) / 100 : null,
      avgKgPerCong:
        areaWithData > 0 ? Math.round((netKgWithArea / areaWithData) * 100) / 100 : null,
      avgAmountPerCong:
        areaWithData > 0 ? Math.round(amountWithArea / areaWithData) : null,
      avgProfitPerCong:
        areaWithData > 0 ? Math.round(profitWithArea / areaWithData) : null,
    };
  }, [filteredRecords, plots]);

  const byPlot = useMemo(() => {
    const map = new Map<
      string,
      {
        plotName: string;
        records: number;
        bags: number;
        netKg: number;
        amount: number;
        expenses: number;
        profit: number;
        areaCong: number;
      }
    >();

    for (const r of filteredRecords) {
      const key = r.plotName || 'Chưa phân loại';
      const s = calcRecordSummary(r);
      const fallbackArea = plots.find((p) => p.name === key)?.areaCong || 0;
      const recArea = r.areaCong && r.areaCong > 0 ? r.areaCong : fallbackArea;
      const existing = map.get(key) || {
        plotName: key,
        records: 0,
        bags: 0,
        netKg: 0,
        amount: 0,
        expenses: 0,
        profit: 0,
        areaCong: 0,
      };
      existing.records += 1;
      existing.bags += s.bagCount;
      existing.netKg = Math.round((existing.netKg + s.netWeight) * 100) / 100;
      existing.amount += s.totalAmount;
      existing.expenses += s.totalExpenses;
      existing.profit += s.profit;
      existing.areaCong = Math.round((existing.areaCong + recArea) * 100) / 100;
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
          <div className="text-xs font-bold text-amber-900">Tổng thành tiền</div>
          <div className="mt-1 text-xl font-black text-amber-950 tabular-nums">
            {formatCurrency(totals.totalAmount)}
          </div>
          <div className="text-xs font-semibold text-amber-800">
            Giá TB: {formatCurrency(totals.avgPrice)}/kg
          </div>
        </div>
      </div>

      {/* Chi phí, Lợi nhuận & Trung bình / 1 công đất */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 shadow-xs">
          <div className="text-sm font-bold text-rose-900">Tổng chi phí đã nhập</div>
          <div className="mt-1 text-2xl font-black text-rose-700 tabular-nums">
            -{formatCurrency(totals.totalExpenses)}
          </div>
        </div>
        <div className="rounded-2xl border-2 border-emerald-600 bg-emerald-50 p-4 shadow-xs">
          <div className="text-sm font-bold text-emerald-900">
            Tổng lợi nhuận thực (Tiền lúa - Chi phí)
          </div>
          <div
            className={`mt-1 text-2xl font-black tabular-nums ${
              totals.totalProfit >= 0 ? 'text-emerald-800' : 'text-rose-700'
            }`}
          >
            {formatCurrency(totals.totalProfit)}
          </div>
        </div>
      </div>

      {totals.areaWithData > 0 && (
        <div className="rounded-2xl border-2 border-emerald-300 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-base font-extrabold text-emerald-950">
            Trung bình trên 1 công đất (Tổng {formatWeight(totals.areaWithData)} công)
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-emerald-50 p-3">
              <div className="text-xs font-bold text-slate-600">TB Bao / 1 công</div>
              <div className="mt-1 text-xl font-black text-emerald-900">
                {totals.avgBagsPerCong !== null ? formatWeight(totals.avgBagsPerCong) : '0'} bao
              </div>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3">
              <div className="text-xs font-bold text-slate-600">TB Ký / 1 công</div>
              <div className="mt-1 text-xl font-black text-emerald-900">
                {totals.avgKgPerCong !== null ? formatWeight(totals.avgKgPerCong) : '0'} kg
              </div>
            </div>
            <div className="rounded-xl bg-amber-50 p-3">
              <div className="text-xs font-bold text-slate-600">TB Tiền lúa / 1 công</div>
              <div className="mt-1 text-lg font-black text-amber-950">
                {totals.avgAmountPerCong !== null
                  ? formatCurrency(totals.avgAmountPerCong)
                  : '0 đ'}
              </div>
            </div>
            <div className="rounded-xl bg-slate-100 p-3">
              <div className="text-xs font-bold text-slate-600">TB Lợi nhuận / 1 công</div>
              <div
                className={`mt-1 text-lg font-black ${
                  (totals.avgProfitPerCong ?? 0) >= 0 ? 'text-emerald-800' : 'text-rose-700'
                }`}
              >
                {totals.avgProfitPerCong !== null
                  ? formatCurrency(totals.avgProfitPerCong)
                  : '0 đ'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bảng so sánh theo khuông đất */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 flex items-center gap-1.5 text-base font-extrabold text-slate-900">
          <MapPin className="h-5 w-5 text-emerald-700" />
          Báo cáo so sánh theo Khuông đất
        </h3>
        {byPlot.length === 0 ? (
          <p className="text-sm text-slate-400">Chưa có dữ liệu</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-100 text-xs font-extrabold text-slate-700">
                  <th className="py-2.5 px-2">Khuông đất</th>
                  <th className="py-2.5 px-2 text-right">Công</th>
                  <th className="py-2.5 px-2 text-right">Bao/công</th>
                  <th className="py-2.5 px-2 text-right">Ký/công</th>
                  <th className="py-2.5 px-2 text-right">Tiền/công</th>
                  <th className="py-2.5 px-2 text-right">Chi phí</th>
                  <th className="py-2.5 px-2 text-right">Lợi nhuận</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {byPlot.map((item) => {
                  const pct = Math.round((item.netKg / maxPlotKg) * 100);
                  const hasArea = item.areaCong > 0;
                  return (
                    <tr key={item.plotName} className="hover:bg-slate-50">
                      <td className="py-2.5 px-2">
                        <div className="font-extrabold text-slate-900">{item.plotName}</div>
                        <div className="text-xs text-slate-500">
                          {item.records} phiếu • {item.bags} bao • {formatWeight(item.netKg)} kg
                        </div>
                        <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-emerald-600"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-slate-700">
                        {hasArea ? formatWeight(item.areaCong) : '—'}
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-slate-800">
                        {hasArea ? formatWeight(item.bags / item.areaCong) : '—'}
                      </td>
                      <td className="py-2.5 px-2 text-right font-extrabold text-emerald-800">
                        {hasArea ? `${formatWeight(item.netKg / item.areaCong)} kg` : '—'}
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-amber-900">
                        {hasArea ? formatCurrency(item.amount / item.areaCong) : '—'}
                      </td>
                      <td className="py-2.5 px-2 text-right font-bold text-rose-700">
                        {formatCurrency(item.expenses)}
                      </td>
                      <td
                        className={`py-2.5 px-2 text-right font-black ${
                          item.profit >= 0 ? 'text-emerald-800' : 'text-rose-700'
                        }`}
                      >
                        {formatCurrency(item.profit)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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

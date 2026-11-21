import React, { useRef, useState } from 'react';
import {
  MapPin,
  User,
  Settings,
  Plus,
  Trash2,
  Download,
  Upload,
} from 'lucide-react';
import type { AppSettings, Plot, WeighingRecord } from '../types/weighing';

interface MasterDataViewProps {
  plots: Plot[];
  weighers: string[];
  settings: AppSettings;
  records: WeighingRecord[];
  onUpdatePlots: (plots: Plot[]) => void;
  onUpdateWeighers: (weighers: string[]) => void;
  onUpdateSettings: (settings: AppSettings) => void;
  onImportBackup: (data: {
    records?: WeighingRecord[];
    plots?: Plot[];
    weighers?: string[];
    settings?: AppSettings;
  }) => void;
}

export const MasterDataView: React.FC<MasterDataViewProps> = ({
  plots,
  weighers,
  settings,
  records,
  onUpdatePlots,
  onUpdateWeighers,
  onUpdateSettings,
  onImportBackup,
}) => {
  const [plotName, setPlotName] = useState('');
  const [plotArea, setPlotArea] = useState('');
  const [plotVariety, setPlotVariety] = useState('');
  const [plotOwner, setPlotOwner] = useState('');
  const [newWeigher, setNewWeigher] = useState('');
  const [backupMsg, setBackupMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAddPlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plotName.trim()) return;
    const item: Plot = {
      id: `plot-${Date.now()}`,
      name: plotName.trim(),
      areaCong: plotArea ? Number(plotArea) : undefined,
      riceVariety: plotVariety.trim() || undefined,
      owner: plotOwner.trim() || undefined,
    };
    onUpdatePlots([item, ...plots]);
    setPlotName('');
    setPlotArea('');
    setPlotVariety('');
    setPlotOwner('');
  };

  const handleAddWeigher = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newWeigher.trim();
    if (!trimmed) return;
    if (!weighers.includes(trimmed)) {
      onUpdateWeighers([trimmed, ...weighers]);
    }
    setNewWeigher('');
  };

  const handleExportBackup = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      records,
      plots,
      weighers,
      settings,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `so-can-lua-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setBackupMsg('Đã tải file sao lưu JSON thành công!');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        onImportBackup(parsed);
        setBackupMsg('Đã khôi phục dữ liệu từ file sao lưu!');
      } catch {
        setBackupMsg('File sao lưu không hợp lệ.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Danh mục Khuông đất */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-800">
          <MapPin className="h-5 w-5 text-emerald-700" />
          Danh sách Khuông đất
        </h2>

        <form onSubmit={handleAddPlot} className="grid grid-cols-1 gap-2 sm:grid-cols-5">
          <input
            type="text"
            placeholder="Tên khuông đất *"
            value={plotName}
            onChange={(e) => setPlotName(e.target.value)}
            required
            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm sm:col-span-2 focus:border-emerald-600 focus:bg-white focus:outline-none"
          />
          <input
            type="number"
            step="0.5"
            placeholder="Diện tích (công)"
            value={plotArea}
            onChange={(e) => setPlotArea(e.target.value)}
            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-600 focus:bg-white focus:outline-none"
          />
          <input
            type="text"
            placeholder="Giống lúa"
            value={plotVariety}
            onChange={(e) => setPlotVariety(e.target.value)}
            className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-600 focus:bg-white focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-700 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-800"
          >
            <Plus className="h-4 w-4" />
            Thêm
          </button>
        </form>

        <div className="mt-3 divide-y divide-slate-100">
          {plots.length === 0 ? (
            <p className="py-3 text-xs text-slate-400">Chưa có khuông đất nào.</p>
          ) : (
            plots.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between py-2.5 text-sm"
              >
                <div>
                  <div className="font-bold text-slate-800">{p.name}</div>
                  <div className="text-xs text-slate-500">
                    {p.areaCong ? `${p.areaCong} công` : 'Chưa ghi diện tích'}
                    {p.riceVariety ? ` • Giống: ${p.riceVariety}` : ''}
                    {p.owner ? ` • Chủ: ${p.owner}` : ''}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdatePlots(plots.filter((x) => x.id !== p.id))}
                  className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50"
                  title="Xóa khuông đất"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Danh sách Người cân */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-800">
          <User className="h-5 w-5 text-emerald-700" />
          Danh sách Người cân
        </h2>
        <form onSubmit={handleAddWeigher} className="flex gap-2">
          <input
            type="text"
            placeholder="Nhập tên người cân..."
            value={newWeigher}
            onChange={(e) => setNewWeigher(e.target.value)}
            className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-600 focus:bg-white focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1 rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-800"
          >
            <Plus className="h-4 w-4" />
            Thêm
          </button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {weighers.map((w) => (
            <span
              key={w}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
            >
              {w}
              <button
                type="button"
                onClick={() => onUpdateWeighers(weighers.filter((x) => x !== w))}
                className="text-rose-500 hover:text-rose-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Cài đặt mặc định */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-slate-800">
          <Settings className="h-5 w-5 text-emerald-700" />
          Cài đặt mặc định cho phiếu mới
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Giá lúa mặc định (đ/kg)
            </label>
            <input
              type="number"
              step="100"
              value={settings.defaultPricePerKg}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  defaultPricePerKg: Number(e.target.value) || 0,
                })
              }
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Số bao trừ 1 kg mặc định
            </label>
            <input
              type="number"
              min="1"
              value={settings.defaultTareConfig.bagsPerKg}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  defaultTareConfig: {
                    ...settings.defaultTareConfig,
                    bagsPerKg: Math.max(1, Number(e.target.value) || 8),
                  },
                })
              }
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Người cân mặc định
            </label>
            <input
              type="text"
              value={settings.defaultWeigherName}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  defaultWeigherName: e.target.value,
                })
              }
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold"
            />
          </div>
        </div>
      </div>

      {/* Sao lưu & Khôi phục */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-1 text-base font-bold text-slate-800">
          Sao lưu & Khôi phục dữ liệu
        </h2>
        <p className="mb-3 text-xs text-slate-500">
          Dữ liệu được lưu trực tiếp trên máy (hoạt động không cần mạng). Hãy sao lưu định kỳ để tránh mất sổ khi đổi điện thoại.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExportBackup}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-900"
          >
            <Download className="h-4 w-4" />
            Tải file sao lưu (JSON)
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <Upload className="h-4 w-4" />
            Khôi phục từ file
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>
        {backupMsg && (
          <p className="mt-2 text-xs font-semibold text-emerald-700">{backupMsg}</p>
        )}
      </div>
    </div>
  );
};

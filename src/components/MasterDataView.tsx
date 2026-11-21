import React, { useRef, useState } from 'react';
import {
  MapPin,
  User,
  Settings,
  Plus,
  Trash2,
  Download,
  Upload,
  Info,
  RefreshCw,
  Cloud,
  LogIn,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import type { AppSettings, Plot, WeighingRecord } from '../types/weighing';
import { isFirebaseConfigured } from '../services/firebase';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

interface MasterDataViewProps {
  plots: Plot[];
  weighers: string[];
  settings: AppSettings;
  records: WeighingRecord[];
  user: FirebaseUser | null;
  syncStatus: SyncStatus;
  authError: string;
  onSignInGoogle: () => void;
  onSignOut: () => void;
  onSyncNow: () => void;
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
  user,
  syncStatus,
  authError,
  onSignInGoogle,
  onSignOut,
  onSyncNow,
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
  const [updateMsg, setUpdateMsg] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCheckUpdate = async () => {
    setIsUpdating(true);
    setUpdateMsg('Đang kiểm tra và tải bản cập nhật mới nhất...');
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          await reg.update();
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      setTimeout(() => {
        window.location.reload();
      }, 400);
    } catch {
      window.location.reload();
    }
  };

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
      {/* Tài khoản & Đồng bộ Gmail (Tùy chọn) */}
      <div className="rounded-2xl border-2 border-emerald-300 bg-white p-4 shadow-sm">
        <h2 className="mb-2 flex items-center gap-2 text-lg font-extrabold text-slate-900">
          <Cloud className="h-5 w-5 text-emerald-700" />
          Tài khoản & Lưu trữ theo Gmail
        </h2>

        {user ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 p-3">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="h-11 w-11 rounded-full border-2 border-emerald-600"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-700 text-lg font-black text-white">
                    {(user.email || 'G')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-base font-extrabold text-slate-900">
                    {user.displayName || 'Tài khoản Google'}
                  </div>
                  <div className="text-sm font-semibold text-emerald-800">
                    {user.email}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-sm font-bold">
                {syncStatus === 'syncing' && (
                  <span className="text-amber-700">Đang đồng bộ...</span>
                )}
                {syncStatus === 'synced' && (
                  <span className="inline-flex items-center gap-1 text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Đã lưu trên Gmail
                  </span>
                )}
                {syncStatus === 'error' && (
                  <span className="text-rose-700">Lỗi đồng bộ (vẫn lưu trên máy)</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onSyncNow}
                disabled={syncStatus === 'syncing'}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-extrabold text-white hover:bg-emerald-800 active:scale-95 disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`}
                />
                Đồng bộ ngay
              </button>
              <button
                type="button"
                onClick={onSignOut}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-5 py-3 text-sm font-extrabold text-slate-800 hover:bg-slate-50 active:scale-95"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-600">
              Mặc định sổ cân được <strong>lưu cục bộ trên máy này</strong> (không cần đăng nhập). Nếu muốn lưu trữ lên đám mây theo Gmail để đổi máy không mất dữ liệu, hãy đăng nhập bên dưới:
            </p>
            <button
              type="button"
              disabled={!isFirebaseConfigured}
              onClick={onSignInGoogle}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-base font-extrabold text-white shadow-sm hover:bg-emerald-800 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
            >
              <LogIn className="h-5 w-5" />
              Đăng nhập bằng Google (Gmail)
            </button>
            {!isFirebaseConfigured && (
              <p className="rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-900">
                Chưa gắn cấu hình Firebase (biến môi trường <code>VITE_FIREBASE_*</code>). Hiện tại ứng dụng đang lưu dữ liệu cục bộ trên máy bình thường.
              </p>
            )}
          </div>
        )}

        {authError && (
          <p className="mt-2 text-sm font-bold text-rose-700">{authError}</p>
        )}
      </div>

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
            <label className="mb-1.5 block text-sm font-bold text-slate-700">
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
              className="w-full rounded-xl border-2 border-slate-300 px-3 py-2.5 text-base font-bold"
            />
          </div>
        </div>

        {/* Bật / tắt nhập nhanh 555 => 55,5 */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-slate-200 bg-slate-50 p-3.5">
          <div>
            <div className="text-base font-extrabold text-slate-900">
              Nhập nhanh 3 số thành số lẻ (555 → 55,5)
            </div>
            <div className="text-sm font-medium text-slate-600">
              Khi bật, gõ 555 tự đổi thành 55,5 kg; gõ 495 tự thành 49,5 kg.
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              onUpdateSettings({
                ...settings,
                quickThreeDigitDecimal: !settings.quickThreeDigitDecimal,
              })
            }
            className={`min-w-[130px] rounded-xl px-5 py-3 text-base font-black transition active:scale-95 ${
              settings.quickThreeDigitDecimal
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'border-2 border-slate-300 bg-white text-slate-700'
            }`}
          >
            {settings.quickThreeDigitDecimal ? 'ĐANG BẬT' : 'ĐANG TẮT'}
          </button>
        </div>
      </div>

      {/* Sao lưu & Khôi phục */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-1 text-lg font-extrabold text-slate-900">
          Sao lưu & Khôi phục dữ liệu
        </h2>
        <p className="mb-3 text-sm font-medium text-slate-600">
          Dữ liệu được lưu trực tiếp trên máy (hoạt động không cần mạng). Hãy sao lưu định kỳ để tránh mất sổ khi đổi điện thoại.
        </p>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleExportBackup}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-3 text-sm font-extrabold text-white hover:bg-slate-900 active:scale-95"
          >
            <Download className="h-5 w-5" />
            Tải file sao lưu (JSON)
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-5 py-3 text-sm font-extrabold text-slate-800 hover:bg-slate-50 active:scale-95"
          >
            <Upload className="h-5 w-5" />
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
          <p className="mt-2.5 text-sm font-bold text-emerald-700">{backupMsg}</p>
        )}
      </div>

      {/* Thông tin ứng dụng */}
      <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-4 shadow-sm">
        <h2 className="mb-2 flex items-center gap-2 text-lg font-extrabold text-emerald-950">
          <Info className="h-5 w-5 text-emerald-700" />
          Thông tin ứng dụng
        </h2>
        <div className="space-y-1.5 text-base text-slate-800">
          <div>
            Tên ứng dụng: <strong className="font-black text-emerald-900">Sổ Cân Lúa</strong>
          </div>
          <div>
            Phiên bản: <span className="rounded-lg bg-emerald-700 px-2.5 py-0.5 text-sm font-black text-white">v1.0.0</span>
          </div>
          <div className="text-sm font-medium text-slate-600">
            Hỗ trợ cân lúa ghi sổ 5×5, trừ bao quy ký, tính tiền, chi phí & lợi nhuận, quản lý khuông đất, người cân và báo cáo số liệu offline trên WebApp & Android APK.
          </div>
          <div className="pt-2">
            <button
              type="button"
              disabled={isUpdating}
              onClick={handleCheckUpdate}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-base font-extrabold text-white shadow-sm hover:bg-emerald-800 active:scale-95 disabled:opacity-60"
            >
              <RefreshCw className={`h-5 w-5 ${isUpdating ? 'animate-spin' : ''}`} />
              {isUpdating ? 'Đang cập nhật...' : 'Cập nhật phiên bản mới'}
            </button>
            {updateMsg && (
              <p className="mt-2 text-sm font-bold text-emerald-800">{updateMsg}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

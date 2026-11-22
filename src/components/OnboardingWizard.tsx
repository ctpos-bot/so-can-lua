import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cloud,
  LogIn,
  MapPin,
  Scale,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import type { AppSettings, Plot } from '../types/weighing';
import { isFirebaseConfigured } from '../services/firebase';

interface OnboardingWizardProps {
  settings: AppSettings;
  user: FirebaseUser | null;
  onSignInGoogle: () => void;
  onUpdateSettings: (settings: AppSettings) => void;
  onAddFirstPlot: (plot: Plot) => void;
  onComplete: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  settings,
  user,
  onSignInGoogle,
  onUpdateSettings,
  onAddFirstPlot,
  onComplete,
}) => {
  const [step, setStep] = useState(0);
  const [plotName, setPlotName] = useState('');
  const [plotArea, setPlotArea] = useState('');
  const [plotVariety, setPlotVariety] = useState('');
  const [plotAddedMsg, setPlotAddedMsg] = useState('');

  const totalSteps = 4;

  const handleSavePlotAndNext = () => {
    if (plotName.trim()) {
      onAddFirstPlot({
        id: `plot-${Date.now()}`,
        name: plotName.trim(),
        areaCong: plotArea ? Number(plotArea) : undefined,
        riceVariety: plotVariety.trim() || undefined,
      });
      setPlotAddedMsg(`Đã thêm "${plotName.trim()}"!`);
      setPlotName('');
      setPlotArea('');
      setPlotVariety('');
    }
    setStep((s) => Math.min(totalSteps - 1, s + 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-xs">
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-emerald-700 px-5 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <img
              src="./app-logo.png"
              alt="Sổ Cân Lúa"
              className="h-9 w-9 rounded-xl object-cover"
            />
            <div>
              <div className="text-base font-black">Thiết lập & Hướng dẫn</div>
              <div className="text-xs font-semibold text-emerald-100">
                Bước {step + 1} / {totalSteps}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onComplete}
            className="rounded-xl bg-emerald-600 p-2 text-white hover:bg-emerald-800"
            title="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress dots */}
        <div className="grid grid-cols-4 gap-1.5 bg-emerald-50 px-5 py-2.5">
          {Array.from({ length: totalSteps }, (_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition ${
                idx <= step ? 'bg-emerald-700' : 'bg-emerald-200'
              }`}
            />
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-black text-slate-900">
                <Cloud className="h-6 w-6 text-emerald-700" />
                1. Chọn cách lưu sổ cân
              </div>
              <p className="text-base font-medium leading-relaxed text-slate-700">
                Ứng dụng hoạt động <strong>100% không cần mạng</strong> ngoài ruộng. Anh có 2 lựa chọn:
              </p>
              <div className="space-y-2.5">
                <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/70 p-3.5">
                  <div className="text-base font-extrabold text-emerald-950">
                    • Dùng ngay (Lưu trên máy này)
                  </div>
                  <div className="text-sm text-slate-700">
                    Không cần đăng nhập, bấm Tiếp tục là cân lúa được ngay.
                  </div>
                </div>
                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-3.5">
                  <div className="text-base font-extrabold text-slate-900">
                    • Lưu trữ theo Gmail (Đổi máy không mất sổ)
                  </div>
                  <div className="mt-2">
                    {user ? (
                      <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-100 px-3 py-2 text-sm font-bold text-emerald-900">
                        <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                        Đã đăng nhập: {user.email}
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={!isFirebaseConfigured}
                        onClick={onSignInGoogle}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-emerald-800 disabled:bg-slate-300"
                      >
                        <LogIn className="h-4 w-4" />
                        Đăng nhập bằng Google (Gmail)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-black text-slate-900">
                <Settings className="h-6 w-6 text-emerald-700" />
                2. Cài đặt mặc định khi cân
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-bold text-slate-800">
                    Tên người cân mặc định
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Anh Ba, Chú Tư..."
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-bold text-slate-800">
                      Giá lúa (đ/kg)
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      step="100"
                      value={settings.defaultPricePerKg || ''}
                      onChange={(e) =>
                        onUpdateSettings({
                          ...settings,
                          defaultPricePerKg: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full rounded-xl border-2 border-slate-300 px-3 py-2.5 text-base font-bold"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-bold text-slate-800">
                      Số bao trừ 1 kg
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
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
                      className="w-full rounded-xl border-2 border-slate-300 px-3 py-2.5 text-base font-bold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 p-3">
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">
                      Nhập nhanh 555 → 55,5
                    </div>
                    <div className="text-xs text-slate-600">
                      Gõ 3 số tự động chia 10 khỏi bấm dấu phẩy
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
                    className={`rounded-xl px-4 py-2 text-sm font-black ${
                      settings.quickThreeDigitDecimal
                        ? 'bg-emerald-700 text-white'
                        : 'border-2 border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    {settings.quickThreeDigitDecimal ? 'BẬT' : 'TẮT'}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 p-3">
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">
                      Đọc giọng nói xác nhận số
                    </div>
                    <div className="text-xs text-slate-600">
                      Đọc to số ký vừa nhập khi bấm Tiếp
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSettings({
                        ...settings,
                        voiceFeedback: !settings.voiceFeedback,
                      })
                    }
                    className={`rounded-xl px-4 py-2 text-sm font-black ${
                      settings.voiceFeedback
                        ? 'bg-sky-700 text-white'
                        : 'border-2 border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    {settings.voiceFeedback ? 'BẬT' : 'TẮT'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-black text-slate-900">
                <MapPin className="h-6 w-6 text-emerald-700" />
                3. Thêm Khuông đất đầu tiên
              </div>
              <p className="text-sm font-medium text-slate-600">
                Lưu sẵn tên khuông đất và số công để sau này chọn 1 chạm là tự tính năng suất (bao/công, ký/công). Anh có thể bỏ qua nếu muốn nhập sau.
              </p>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Tên khuông đất (VD: Khuông Bảy Xã)"
                  value={plotName}
                  onChange={(e) => setPlotName(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-300 px-3 py-2.5 text-base font-bold"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Số công (VD: 5)"
                    value={plotArea}
                    onChange={(e) => setPlotArea(e.target.value)}
                    className="w-full rounded-xl border-2 border-slate-300 px-3 py-2.5 text-base font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Giống lúa (VD: OM 18)"
                    value={plotVariety}
                    onChange={(e) => setPlotVariety(e.target.value)}
                    className="w-full rounded-xl border-2 border-slate-300 px-3 py-2.5 text-base font-bold"
                  />
                </div>
                {plotAddedMsg && (
                  <p className="text-sm font-bold text-emerald-700">{plotAddedMsg}</p>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-black text-slate-900">
                <Scale className="h-6 w-6 text-emerald-700" />
                4. Hướng dẫn cân nhanh 3 bước
              </div>
              <div className="space-y-2.5 text-sm font-medium text-slate-700">
                <div className="rounded-xl bg-emerald-50 p-3">
                  <strong className="text-base text-emerald-900">Bước 1: Nhập bao lúa</strong>
                  <p className="mt-0.5">
                    Bấm vào ô trên bảng 5×5, gõ trọng lượng (VD <code>555</code> → <code>55,5</code>), bấm <strong>Enter / Tiếp</strong> để tự nhảy xuống ô dưới. Hết 25 bao bấm <strong>+ Thêm bảng cân mới</strong>.
                  </p>
                </div>
                <div className="rounded-xl bg-sky-50 p-3">
                  <strong className="text-base text-sky-900">Bước 2: Lưu & Gửi Zalo</strong>
                  <p className="mt-0.5">
                    Bấm <strong>Lưu phiếu</strong> để lưu vào <strong>Sổ Cân</strong>, sau đó bấm <strong>Gửi Zalo</strong> để xuất ảnh phiếu cân gửi ngay cho chủ ruộng / thương lái.
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50 p-3">
                  <strong className="text-base text-amber-950">Bước 3: Chi phí & Báo cáo</strong>
                  <p className="mt-0.5">
                    Nhập thêm chi phí giống, phân bón, công cắt ở cuối phiếu để xem <strong>Lợi nhuận thực</strong> và đối chiếu năng suất trong mục <strong>Báo Cáo</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3.5">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="inline-flex items-center gap-1 rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </button>
          ) : (
            <button
              type="button"
              onClick={onComplete}
              className="rounded-xl px-3 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800"
            >
              Bỏ qua
            </button>
          )}

          {step < totalSteps - 1 ? (
            <button
              type="button"
              onClick={
                step === 2
                  ? handleSavePlotAndNext
                  : () => setStep((s) => Math.min(totalSteps - 1, s + 1))
              }
              className="inline-flex items-center gap-1 rounded-xl bg-emerald-700 px-5 py-2.5 text-base font-black text-white hover:bg-emerald-800"
            >
              Tiếp tục
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onComplete}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-5 py-2.5 text-base font-black text-white hover:bg-emerald-800"
            >
              <Sparkles className="h-5 w-5" />
              Bắt đầu cân lúa
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

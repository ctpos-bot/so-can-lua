import React, { useRef, useState } from 'react';
import { Download, HelpCircle, Upload } from 'lucide-react';
import type { CaiDat, CoChuApp, LanCan, PhieuCan } from '../../types';
import { BigButton } from '../ui/BigButton';

interface SettingsScreenProps {
  caiDat: CaiDat;
  danhSachPhieu: PhieuCan[];
  tatCaLanCan: LanCan[];
  onDoiCoChu: (coChu: CoChuApp) => Promise<void>;
  onMoHuongDan: () => void;
  onKhoiPhuc: (duLieu: { phieuCan: PhieuCan[]; lanCan: LanCan[] }) => Promise<void>;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  caiDat,
  danhSachPhieu,
  tatCaLanCan,
  onDoiCoChu,
  onMoHuongDan,
  onKhoiPhuc,
}) => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [thongBao, setThongBao] = useState('');
  const [loi, setLoi] = useState('');

  const handleSaoLuu = () => {
    setLoi('');
    const payload = {
      ngaySaoLuu: new Date().toISOString(),
      phieuCan: danhSachPhieu,
      lanCan: tatCaLanCan,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `so-can-lua-saoluu-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setThongBao('Đã tải file sao lưu JSON về máy!');
  };

  const handleChonFileKhoiPhuc = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoi('');
    setThongBao('');
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed.phieuCan) || !Array.isArray(parsed.lanCan)) {
          setLoi('File sao lưu không đúng định dạng.');
          return;
        }
        await onKhoiPhuc({
          phieuCan: parsed.phieuCan,
          lanCan: parsed.lanCan,
        });
        setThongBao('Đã khôi phục dữ liệu thành công!');
      } catch {
        setLoi('Không đọc được file sao lưu.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-5 pb-28">
      {/* Cỡ chữ */}
      <section className="space-y-3 rounded-2xl border-2 border-[#111111] bg-white p-4">
        <h2 className="text-title font-extrabold text-[#111111]">
          Cỡ chữ hiển thị
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => void onDoiCoChu('lon')}
            className={`min-h-[64px] rounded-2xl border-2 px-3 text-body font-extrabold ${
              caiDat.coChu === 'lon'
                ? 'border-[#1B5E20] bg-[#1B5E20] text-white'
                : 'border-[#111111] bg-white text-[#111111]'
            }`}
          >
            Lớn
          </button>
          <button
            type="button"
            onClick={() => void onDoiCoChu('rat_lon')}
            className={`min-h-[64px] rounded-2xl border-2 px-3 text-body font-extrabold ${
              caiDat.coChu === 'rat_lon'
                ? 'border-[#1B5E20] bg-[#1B5E20] text-white'
                : 'border-[#111111] bg-white text-[#111111]'
            }`}
          >
            Rất lớn
          </button>
        </div>
      </section>

      {/* Sao lưu & Khôi phục */}
      <section className="space-y-3 rounded-2xl border-2 border-[#111111] bg-white p-4">
        <h2 className="text-title font-extrabold text-[#111111]">
          Sao lưu & Khôi phục
        </h2>
        <p className="text-body font-semibold text-[#111111]">
          Dữ liệu lưu ngay trên máy, tắt mạng vẫn cân được. Nên sao lưu định kỳ ra file JSON.
        </p>

        <BigButton
          variant="primary"
          onClick={handleSaoLuu}
          icon={<Download className="h-7 w-7" />}
        >
          Sao lưu ra file JSON
        </BigButton>

        <BigButton
          variant="secondary"
          onClick={() => fileRef.current?.click()}
          icon={<Upload className="h-7 w-7" />}
        >
          Khôi phục từ file JSON
        </BigButton>

        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          onChange={handleChonFileKhoiPhuc}
          className="hidden"
        />

        {thongBao && (
          <p className="rounded-xl bg-[#e8f5e9] p-3 text-body font-extrabold text-[#1B5E20]">
            {thongBao}
          </p>
        )}
        {loi && (
          <p className="rounded-xl bg-[#fff5f5] p-3 text-body font-extrabold text-[#C62828]">
            {loi}
          </p>
        )}
      </section>

      {/* Hướng dẫn */}
      <BigButton
        variant="accent"
        onClick={onMoHuongDan}
        icon={<HelpCircle className="h-7 w-7" />}
      >
        Xem lại hướng dẫn sử dụng
      </BigButton>
    </div>
  );
};

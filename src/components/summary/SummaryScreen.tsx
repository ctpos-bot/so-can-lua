import React, { useMemo, useState } from 'react';
import { Share2 } from 'lucide-react';
import type { LanCan, PhieuCan, TrangThaiPhieu } from '../../types';
import {
  dinhDangKy,
  dinhDangTien,
  tinhTongKetPhieu,
} from '../../utils/format';
import { BigButton } from '../ui/BigButton';
import { BigInput } from '../ui/BigInput';

interface SummaryScreenProps {
  phieu: PhieuCan;
  danhSachLanCan: LanCan[];
  onCapNhatPhieu: (capNhat: Partial<PhieuCan>) => Promise<void>;
  onMoChiaSe: () => void;
}

export const SummaryScreen: React.FC<SummaryScreenProps> = ({
  phieu,
  danhSachLanCan,
  onCapNhatPhieu,
  onMoChiaSe,
}) => {
  const [daUngText, setDaUngText] = useState(
    phieu.daUng ? String(phieu.daUng) : ''
  );

  const kq = useMemo(
    () => tinhTongKetPhieu(phieu, danhSachLanCan),
    [phieu, danhSachLanCan]
  );

  const handleDoiDaUng = (val: string) => {
    setDaUngText(val);
    const so = Math.max(0, Math.round(Number(val.replace(/[^\d]/g, '')) || 0));
    const trangThaiMoi: TrangThaiPhieu =
      kq.thanhTien - so > 0 ? 'con_no' : 'da_xong';
    void onCapNhatPhieu({ daUng: so, trangThai: trangThaiMoi });
  };

  const handleChonTrangThai = (tt: TrangThaiPhieu) => {
    void onCapNhatPhieu({ trangThai: tt });
  };

  return (
    <div className="space-y-4 pb-28">
      <div className="rounded-2xl border-2 border-[#111111] bg-white p-4 space-y-3">
        <div className="border-b-2 border-[#111111] pb-2">
          <h2 className="text-title font-extrabold text-[#111111]">
            {phieu.tenKhach}
          </h2>
          <p className="text-body font-bold text-[#111111]">
            {kq.soBao} bao • {phieu.giongLua || 'Lúa'}
          </p>
        </div>

        <div className="space-y-2.5 text-body font-bold text-[#111111]">
          <div className="flex items-center justify-between gap-2">
            <span>Tổng ký ({kq.soBao} bao)</span>
            <span className="font-extrabold">{dinhDangKy(kq.tongKy)}</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span>Trừ bì ({phieu.truBiMoiBao} kg/bao)</span>
            <span className="font-extrabold text-[#C62828]">
              -{dinhDangKy(kq.truBi)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span>Trừ hao ({phieu.truHaoPhanTram}%)</span>
            <span className="font-extrabold text-[#C62828]">
              -{dinhDangKy(kq.truHao)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 border-t-2 border-[#111111] pt-2">
            <span className="font-extrabold">Ký thực</span>
            <span className="text-[26px] font-extrabold text-[#1B5E20]">
              {dinhDangKy(kq.kyThuc)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span>× Đơn giá</span>
            <span className="font-extrabold">{dinhDangTien(phieu.donGia)}/kg</span>
          </div>

          <div className="flex items-center justify-between gap-2 border-t-2 border-[#111111] pt-2">
            <span className="font-extrabold">Thành tiền</span>
            <span className="text-[26px] font-extrabold text-[#111111]">
              {dinhDangTien(kq.thanhTien)}
            </span>
          </div>
        </div>

        <div className="pt-1">
          <BigInput
            label="Đã ứng trước (đ)"
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={daUngText}
            onChange={(e) => handleDoiDaUng(e.target.value)}
          />
        </div>

        <div className="rounded-2xl border-2 border-[#111111] bg-[#F9A825] p-4 text-[#111111]">
          <div className="text-body font-extrabold">CÒN LẠI PHẢI TRẢ</div>
          <div className="mt-1 text-metric font-extrabold leading-tight">
            {dinhDangTien(kq.conLai)}
          </div>
        </div>
      </div>

      {/* Trạng thái phiếu */}
      <div className="rounded-2xl border-2 border-[#111111] bg-white p-4 space-y-2">
        <p className="text-body font-extrabold text-[#111111]">
          Trạng thái phiếu:
        </p>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ['dang_can', 'Đang cân'],
              ['con_no', 'Còn nợ'],
              ['da_xong', 'Đã xong'],
            ] as [TrangThaiPhieu, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleChonTrangThai(key)}
              className={`min-h-[64px] rounded-xl border-2 px-2 text-body font-extrabold ${
                phieu.trangThai === key
                  ? 'border-[#1B5E20] bg-[#1B5E20] text-white'
                  : 'border-[#111111] bg-white text-[#111111]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <BigButton
        variant="primary"
        onClick={onMoChiaSe}
        icon={<Share2 className="h-7 w-7" />}
      >
        Xuất phiếu & Gửi Zalo
      </BigButton>
    </div>
  );
};

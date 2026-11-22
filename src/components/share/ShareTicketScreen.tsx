import React, { useMemo, useRef, useState } from 'react';
import { Download, Printer, Share2 } from 'lucide-react';
import type { LanCan, PhieuCan } from '../../types';
import {
  dinhDangKy,
  dinhDangNgay,
  dinhDangSo,
  dinhDangTien,
  tinhTongKetPhieu,
} from '../../utils/format';
import { guiZaloPhieu, luuAnhPhieu } from '../../utils/share';
import { BigButton } from '../ui/BigButton';

interface ShareTicketScreenProps {
  phieu: PhieuCan;
  danhSachLanCan: LanCan[];
}

export const ShareTicketScreen: React.FC<ShareTicketScreenProps> = ({
  phieu,
  danhSachLanCan,
}) => {
  const receiptRef = useRef<HTMLDivElement | null>(null);
  const [thongBao, setThongBao] = useState('');

  const sapXep = useMemo(
    () => [...danhSachLanCan].sort((a, b) => a.thuTu - b.thuTu),
    [danhSachLanCan]
  );

  const kq = useMemo(
    () => tinhTongKetPhieu(phieu, sapXep),
    [phieu, sapXep]
  );

  const cacDay = useMemo(() => {
    const groups: { thuTuDay: number; items: LanCan[]; tongDay: number }[] = [];
    for (let i = 0; i < sapXep.length; i += 5) {
      const items = sapXep.slice(i, i + 5);
      const tongDay =
        Math.round(items.reduce((s, item) => s + item.soKy, 0) * 100) / 100;
      groups.push({
        thuTuDay: Math.floor(i / 5) + 1,
        items,
        tongDay,
      });
    }
    return groups;
  }, [sapXep]);

  const handleGuiZalo = async () => {
    if (!receiptRef.current) return;
    try {
      const kqGui = await guiZaloPhieu(
        receiptRef.current,
        `phieu-can-${phieu.tenKhach}.png`,
        `Phiếu cân lúa - ${phieu.tenKhach}`,
        `${phieu.tenKhach}: ${kq.soBao} bao, ${dinhDangKy(kq.kyThuc)}, Còn lại ${dinhDangTien(kq.conLai)}`
      );
      setThongBao(
        kqGui === 'shared'
          ? 'Đã mở chia sẻ qua Zalo!'
          : 'Đã tải ảnh phiếu về máy!'
      );
    } catch {
      setThongBao('Đã hủy chia sẻ.');
    }
  };

  const handleLuuAnh = async () => {
    if (!receiptRef.current) return;
    await luuAnhPhieu(receiptRef.current, `phieu-can-${phieu.tenKhach}.png`);
    setThongBao('Đã lưu ảnh phiếu về máy!');
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Bản xem trước dạng hóa đơn */}
      <div
        ref={receiptRef}
        className="rounded-2xl border-2 border-[#111111] bg-white p-4 text-[#111111]"
      >
        <div className="border-b-2 border-[#111111] pb-3 text-center">
          <h2 className="text-title font-extrabold text-[#1B5E20]">
            PHIẾU CÂN LÚA
          </h2>
          <p className="text-body font-bold">
            Ngày: {dinhDangNgay(phieu.ngayTao)}
          </p>
        </div>

        <div className="mt-3 space-y-1 text-body font-bold">
          <div>
            Chủ ruộng: <span className="font-extrabold">{phieu.tenKhach}</span>
          </div>
          {phieu.soDienThoai && <div>SĐT: {phieu.soDienThoai}</div>}
          <div>
            Giống lúa: {phieu.giongLua || '—'} • Vụ: {phieu.vuMua}
          </div>
          <div>Đơn giá: {dinhDangTien(phieu.donGia)}/kg</div>
        </div>

        <div className="mt-3 space-y-2 border-t-2 border-[#111111] pt-3">
          {cacDay.map((day) => (
            <div
              key={day.thuTuDay}
              className="rounded-xl border border-[#111111] p-2"
            >
              <div className="flex justify-between text-[20px] font-extrabold">
                <span>Dãy {day.thuTuDay}</span>
                <span>{dinhDangSo(day.tongDay, 2)} kg</span>
              </div>
              <div className="mt-1 grid grid-cols-5 gap-1 text-center text-[20px] font-bold">
                {day.items.map((l) => (
                  <span key={l.id} className="rounded bg-[#f5f5f5] py-1">
                    {dinhDangSo(l.soKy, 2)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1.5 border-t-2 border-[#111111] pt-3 text-body font-bold">
          <div className="flex justify-between">
            <span>Tổng ký ({kq.soBao} bao):</span>
            <span>{dinhDangKy(kq.tongKy)}</span>
          </div>
          <div className="flex justify-between">
            <span>Trừ bì ({phieu.truBiMoiBao} kg/bao):</span>
            <span>-{dinhDangKy(kq.truBi)}</span>
          </div>
          <div className="flex justify-between">
            <span>Trừ hao ({phieu.truHaoPhanTram}%):</span>
            <span>-{dinhDangKy(kq.truHao)}</span>
          </div>
          <div className="flex justify-between text-[22px] font-extrabold text-[#1B5E20]">
            <span>Ký thực:</span>
            <span>{dinhDangKy(kq.kyThuc)}</span>
          </div>
          <div className="flex justify-between">
            <span>Thành tiền:</span>
            <span>{dinhDangTien(kq.thanhTien)}</span>
          </div>
          <div className="flex justify-between">
            <span>Đã ứng:</span>
            <span>-{dinhDangTien(kq.daUng)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between rounded-xl bg-[#F9A825] p-3 text-[24px] font-extrabold">
            <span>CÒN LẠI:</span>
            <span>{dinhDangTien(kq.conLai)}</span>
          </div>
        </div>
      </div>

      {thongBao && (
        <p className="rounded-xl bg-[#e8f5e9] p-3 text-center text-body font-extrabold text-[#1B5E20]">
          {thongBao}
        </p>
      )}

      <div className="no-print space-y-3">
        <BigButton
          variant="primary"
          onClick={() => void handleGuiZalo()}
          icon={<Share2 className="h-7 w-7" />}
        >
          Gửi Zalo
        </BigButton>

        <BigButton
          variant="secondary"
          onClick={() => void handleLuuAnh()}
          icon={<Download className="h-7 w-7" />}
        >
          Lưu ảnh phiếu
        </BigButton>

        <BigButton
          variant="secondary"
          onClick={() => window.print()}
          icon={<Printer className="h-7 w-7" />}
        >
          In
        </BigButton>
      </div>
    </div>
  );
};

import React from 'react';
import { Plus, FileText } from 'lucide-react';
import type { LanCan, PhieuCan } from '../../types';
import {
  dinhDangKy,
  dinhDangNgay,
  dinhDangTien,
  nhanTrangThai,
  tinhTongKetPhieu,
} from '../../utils/format';
import { BigButton } from '../ui/BigButton';

interface HomeScreenProps {
  danhSachPhieu: PhieuCan[];
  tatCaLanCan: LanCan[];
  onCanMoi: () => void;
  onMoPhieu: (phieu: PhieuCan) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  danhSachPhieu,
  tatCaLanCan,
  onCanMoi,
  onMoPhieu,
}) => {
  const ganDay = [...danhSachPhieu]
    .sort((a, b) => b.ngayCapNhat - a.ngayCapNhat)
    .slice(0, 10);

  return (
    <div className="space-y-6 pb-28">
      <BigButton
        variant="primary"
        onClick={onCanMoi}
        icon={<Plus className="h-8 w-8" />}
        className="min-h-[76px] text-[24px]"
      >
        + CÂN MỚI
      </BigButton>

      <section className="space-y-3">
        <h2 className="text-title font-extrabold text-[#111111]">
          Phiếu gần đây
        </h2>

        {ganDay.length === 0 ? (
          <div className="rounded-2xl border-2 border-[#111111] bg-white p-6 text-center">
            <FileText className="mx-auto h-12 w-12 text-[#1B5E20]" />
            <p className="mt-3 text-body font-bold text-[#111111]">
              Chưa có phiếu cân nào.
            </p>
            <p className="mt-1 text-body font-semibold text-[#111111]">
              Bấm nút "+ CÂN MỚI" ở trên để bắt đầu.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {ganDay.map((phieu) => {
              const lanCuaPhieu = tatCaLanCan.filter(
                (l) => l.phieuId === phieu.id
              );
              const kq = tinhTongKetPhieu(phieu, lanCuaPhieu);
              const mauTrangThai =
                phieu.trangThai === 'da_xong'
                  ? 'bg-[#1B5E20] text-white'
                  : phieu.trangThai === 'con_no'
                    ? 'bg-[#F9A825] text-[#111111]'
                    : 'bg-white text-[#111111] border-2 border-[#111111]';

              return (
                <button
                  key={phieu.id}
                  type="button"
                  onClick={() => onMoPhieu(phieu)}
                  className="block w-full rounded-2xl border-2 border-[#111111] bg-white p-4 text-left transition active:bg-[#f0f7f0]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-title font-extrabold text-[#111111]">
                      {phieu.tenKhach}
                    </span>
                    <span
                      className={`rounded-xl px-3 py-1 text-[20px] font-extrabold ${mauTrangThai}`}
                    >
                      {nhanTrangThai(phieu.trangThai)}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-body font-bold text-[#111111]">
                    <span>
                      {dinhDangNgay(phieu.ngayTao)}
                      {phieu.giongLua ? ` • ${phieu.giongLua}` : ''}
                    </span>
                    <span>{kq.soBao} bao</span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 rounded-xl bg-[#f5f5f5] p-3">
                    <span className="text-body font-extrabold text-[#111111]">
                      {dinhDangKy(kq.kyThuc)}
                    </span>
                    <span className="rounded-lg bg-[#F9A825] px-2.5 py-1 text-[24px] font-extrabold text-[#111111]">
                      {dinhDangTien(kq.thanhTien)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

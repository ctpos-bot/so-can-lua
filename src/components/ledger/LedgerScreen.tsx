import React, { useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { LanCan, PhieuCan } from '../../types';
import {
  dinhDangKy,
  dinhDangNgay,
  dinhDangTien,
  ngayISO,
  nhanTrangThai,
  tinhTongKetPhieu,
} from '../../utils/format';
import { BigInput } from '../ui/BigInput';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface LedgerScreenProps {
  danhSachPhieu: PhieuCan[];
  tatCaLanCan: LanCan[];
  onMoPhieu: (phieu: PhieuCan) => void;
  onXoaPhieu: (phieu: PhieuCan) => Promise<void>;
}

export const LedgerScreen: React.FC<LedgerScreenProps> = ({
  danhSachPhieu,
  tatCaLanCan,
  onMoPhieu,
  onXoaPhieu,
}) => {
  const [tuKhoa, setTuKhoa] = useState('');
  const [locNgay, setLocNgay] = useState('');
  const [locVu, setLocVu] = useState('');
  const [phieuChoXoa, setPhieuChoXoa] = useState<PhieuCan | null>(null);

  const danhSachVu = useMemo(() => {
    const set = new Set<string>();
    danhSachPhieu.forEach((p) => {
      if (p.vuMua) set.add(p.vuMua);
    });
    return Array.from(set);
  }, [danhSachPhieu]);

  const daLoc = useMemo(() => {
    const q = tuKhoa.trim().toLowerCase();
    return [...danhSachPhieu]
      .sort((a, b) => b.ngayCapNhat - a.ngayCapNhat)
      .filter((p) => {
        if (q && !p.tenKhach.toLowerCase().includes(q)) return false;
        if (locNgay && ngayISO(p.ngayTao) !== locNgay) return false;
        if (locVu && p.vuMua !== locVu) return false;
        return true;
      });
  }, [danhSachPhieu, tuKhoa, locNgay, locVu]);

  const tongTheoVu = useMemo(() => {
    const map = new Map<
      string,
      { vu: string; soPhieu: number; soBao: number; kyThuc: number; thanhTien: number }
    >();
    for (const p of daLoc) {
      const lan = tatCaLanCan.filter((l) => l.phieuId === p.id);
      const kq = tinhTongKetPhieu(p, lan);
      const key = p.vuMua || 'Vụ khác';
      const cur = map.get(key) || {
        vu: key,
        soPhieu: 0,
        soBao: 0,
        kyThuc: 0,
        thanhTien: 0,
      };
      cur.soPhieu += 1;
      cur.soBao += kq.soBao;
      cur.kyThuc = Math.round((cur.kyThuc + kq.kyThuc) * 100) / 100;
      cur.thanhTien += kq.thanhTien;
      map.set(key, cur);
    }
    return Array.from(map.values());
  }, [daLoc, tatCaLanCan]);

  return (
    <div className="space-y-5 pb-28">
      {/* Tìm kiếm & Lọc */}
      <div className="space-y-3 rounded-2xl border-2 border-[#111111] bg-white p-4">
        <BigInput
          label="Tìm theo tên chủ ruộng"
          placeholder="Nhập tên cần tìm..."
          value={tuKhoa}
          onChange={(e) => setTuKhoa(e.target.value)}
        />

        <BigInput
          label="Lọc theo ngày"
          type="date"
          value={locNgay}
          onChange={(e) => setLocNgay(e.target.value)}
        />

        <div className="space-y-2">
          <label
            htmlFor="loc-vu"
            className="block text-body font-bold text-[#111111]"
          >
            Lọc theo vụ
          </label>
          <select
            id="loc-vu"
            value={locVu}
            onChange={(e) => setLocVu(e.target.value)}
            className="min-h-[64px] w-full rounded-2xl border-2 border-[#111111] bg-white px-4 py-3 text-body font-bold text-[#111111]"
          >
            <option value="">Tất cả các vụ</option>
            {danhSachVu.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        {(tuKhoa || locNgay || locVu) && (
          <button
            type="button"
            onClick={() => {
              setTuKhoa('');
              setLocNgay('');
              setLocVu('');
            }}
            className="min-h-[64px] w-full rounded-2xl border-2 border-[#111111] bg-white text-body font-extrabold text-[#111111]"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Tổng theo vụ */}
      {tongTheoVu.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-title font-extrabold text-[#111111]">
            Tổng theo vụ
          </h2>
          {tongTheoVu.map((item) => (
            <div
              key={item.vu}
              className="rounded-2xl border-2 border-[#111111] bg-[#f5f5f5] p-4"
            >
              <div className="text-title font-extrabold text-[#1B5E20]">
                {item.vu}
              </div>
              <div className="mt-1 text-body font-bold text-[#111111]">
                {item.soPhieu} phiếu • {item.soBao} bao • {dinhDangKy(item.kyThuc)}
              </div>
              <div className="mt-2 inline-block rounded-xl bg-[#F9A825] px-3 py-1 text-[24px] font-extrabold text-[#111111]">
                {dinhDangTien(item.thanhTien)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Danh sách phiếu */}
      <div className="space-y-3">
        <h2 className="text-title font-extrabold text-[#111111]">
          Danh sách phiếu ({daLoc.length})
        </h2>

        {daLoc.length === 0 ? (
          <div className="rounded-2xl border-2 border-[#111111] bg-white p-6 text-center text-body font-bold">
            Không tìm thấy phiếu nào.
          </div>
        ) : (
          daLoc.map((p) => {
            const lan = tatCaLanCan.filter((l) => l.phieuId === p.id);
            const kq = tinhTongKetPhieu(p, lan);
            return (
              <div
                key={p.id}
                className="rounded-2xl border-2 border-[#111111] bg-white p-4 space-y-3"
              >
                <button
                  type="button"
                  onClick={() => onMoPhieu(p)}
                  className="block w-full text-left"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-title font-extrabold text-[#111111]">
                      {p.tenKhach}
                    </span>
                    <span className="rounded-xl bg-[#F9A825] px-3 py-1 text-[20px] font-extrabold text-[#111111]">
                      {nhanTrangThai(p.trangThai)}
                    </span>
                  </div>
                  <div className="mt-1 text-body font-bold text-[#111111]">
                    {dinhDangNgay(p.ngayTao)} • {p.vuMua}
                  </div>
                  <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-body font-extrabold text-[#1B5E20]">
                      {kq.soBao} bao • {dinhDangKy(kq.kyThuc)}
                    </span>
                    <span className="text-[24px] font-extrabold text-[#111111]">
                      {dinhDangTien(kq.thanhTien)}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPhieuChoXoa(p)}
                  className="inline-flex min-h-[64px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#C62828] bg-white text-body font-extrabold text-[#C62828]"
                >
                  <Trash2 className="h-6 w-6" />
                  <span>Xóa phiếu này</span>
                </button>
              </div>
            );
          })
        )}
      </div>

      <ConfirmDialog
        open={phieuChoXoa !== null}
        title="Xóa phiếu cân này?"
        message={
          phieuChoXoa
            ? `Anh có chắc muốn xóa phiếu của "${phieuChoXoa.tenKhach}" không?`
            : ''
        }
        confirmLabel="Xóa phiếu"
        danger
        onConfirm={() => {
          const target = phieuChoXoa;
          setPhieuChoXoa(null);
          if (target) void onXoaPhieu(target);
        }}
        onCancel={() => setPhieuChoXoa(null)}
      />
    </div>
  );
};

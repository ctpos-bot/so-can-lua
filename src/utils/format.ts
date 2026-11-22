import type { LanCan, PhieuCan, TongKetPhieu, TrangThaiPhieu } from '../types';

export function dinhDangSo(giaTri: number, soThapPhan = 1): string {
  const lamTron = Math.round(giaTri * 100) / 100;
  return lamTron.toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: soThapPhan,
  });
}

export function dinhDangKy(giaTri: number): string {
  return `${dinhDangSo(giaTri, 2)} kg`;
}

export function dinhDangTien(giaTri: number): string {
  return `${Math.round(giaTri).toLocaleString('vi-VN')} đ`;
}

export function dinhDangNgay(timestamp: number): string {
  const d = new Date(timestamp);
  const ngay = String(d.getDate()).padStart(2, '0');
  const thang = String(d.getMonth() + 1).padStart(2, '0');
  const nam = d.getFullYear();
  return `${ngay}/${thang}/${nam}`;
}

export function ngayISO(timestamp: number): string {
  const d = new Date(timestamp);
  const nam = d.getFullYear();
  const thang = String(d.getMonth() + 1).padStart(2, '0');
  const ngay = String(d.getDate()).padStart(2, '0');
  return `${nam}-${thang}-${ngay}`;
}

export function nhanTrangThai(trangThai: TrangThaiPhieu): string {
  if (trangThai === 'dang_can') return 'Đang cân';
  if (trangThai === 'con_no') return 'Còn nợ';
  return 'Đã xong';
}

export function tinhTongKetPhieu(phieu: PhieuCan, danhSachLanCan: LanCan[]): TongKetPhieu {
  const soBao = danhSachLanCan.length;
  const tongKy = Math.round(
    danhSachLanCan.reduce((tong, lan) => tong + (lan.soKy || 0), 0) * 100
  ) / 100;

  const truBi = Math.round(soBao * (phieu.truBiMoiBao || 0) * 100) / 100;
  const sauTruBi = Math.max(0, tongKy - truBi);
  const truHao = Math.round(sauTruBi * ((phieu.truHaoPhanTram || 0) / 100) * 100) / 100;
  const kyThuc = Math.max(0, Math.round((sauTruBi - truHao) * 100) / 100);
  const thanhTien = Math.round(kyThuc * (phieu.donGia || 0));
  const daUng = Math.round(phieu.daUng || 0);
  const conLai = thanhTien - daUng;

  return {
    soBao,
    tongKy,
    truBi,
    truHao,
    kyThuc,
    thanhTien,
    daUng,
    conLai,
  };
}

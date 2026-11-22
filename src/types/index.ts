export type TrangThaiPhieu = 'dang_can' | 'da_xong' | 'con_no';
export type CoChuApp = 'lon' | 'rat_lon';
export type TabChinh = 'can_lua' | 'so_can' | 'cai_dat';

export interface PhieuCan {
  id: string;
  tenKhach: string;
  soDienThoai: string;
  giongLua: string;
  vuMua: string;
  donGia: number;
  truBiMoiBao: number;
  truHaoPhanTram: number;
  daUng: number;
  trangThai: TrangThaiPhieu;
  ngayTao: number;
  ngayCapNhat: number;
}

export interface LanCan {
  id: string;
  phieuId: string;
  thuTu: number;
  soKy: number;
  ngayTao: number;
}

export interface CaiDat {
  id: 'default';
  coChu: CoChuApp;
  daXemHuongDan: boolean;
}

export interface TongKetPhieu {
  soBao: number;
  tongKy: number;
  truBi: number;
  truHao: number;
  kyThuc: number;
  thanhTien: number;
  daUng: number;
  conLai: number;
}

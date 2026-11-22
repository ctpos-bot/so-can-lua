import type { LanCan, PhieuCan } from '../types';
import { db } from './database';

const SAMPLE_WEIGHTS_48: number[] = [
  52.5, 54.0, 51.5, 53.0, 55.0,
  50.5, 52.0, 53.5, 54.5, 51.0,
  52.0, 53.0, 54.0, 52.5, 51.5,
  55.5, 53.0, 52.0, 54.0, 50.0,
  51.5, 53.5, 52.5, 54.0, 53.0,
  52.0, 51.0, 55.0, 53.5, 52.5,
  54.0, 52.0, 53.0, 51.5, 54.5,
  53.0, 52.5, 50.5, 54.0, 53.5,
  52.0, 53.0, 54.5, 51.5, 52.5,
  53.5, 52.0, 54.0,
];

export async function khoiTaoDuLieuMauNeuTrong(): Promise<void> {
  const count = await db.phieuCan.count();
  if (count > 0) return;

  const now = Date.now();
  const phieuMauId = 'phieu-mau-chu-ba-hung';

  const phieuMau: PhieuCan = {
    id: phieuMauId,
    tenKhach: 'Chú Ba Hùng',
    soDienThoai: '0918 234 567',
    giongLua: 'OM18',
    vuMua: 'Đông Xuân 2026',
    donGia: 7200,
    truBiMoiBao: 0.2,
    truHaoPhanTram: 0,
    daUng: 5000000,
    trangThai: 'con_no',
    ngayTao: now - 3600_000,
    ngayCapNhat: now - 3600_000,
  };

  const danhSachLanCan: LanCan[] = SAMPLE_WEIGHTS_48.map((soKy, idx) => ({
    id: `lan-mau-${idx + 1}`,
    phieuId: phieuMauId,
    thuTu: idx + 1,
    soKy,
    ngayTao: now - 3600_000 + idx * 1000,
  }));

  await db.transaction('rw', db.phieuCan, db.lanCan, async () => {
    await db.phieuCan.put(phieuMau);
    await db.lanCan.bulkPut(danhSachLanCan);
  });
}

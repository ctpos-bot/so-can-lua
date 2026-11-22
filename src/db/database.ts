import Dexie, { type Table } from 'dexie';
import type { CaiDat, LanCan, PhieuCan } from '../types';

export class SoCanLuaDB extends Dexie {
  phieuCan!: Table<PhieuCan, string>;
  lanCan!: Table<LanCan, string>;
  caiDat!: Table<CaiDat, string>;

  constructor() {
    super('SoCanLuaOfflineDB');
    this.version(1).stores({
      phieuCan: 'id, tenKhach, vuMua, trangThai, ngayTao, ngayCapNhat',
      lanCan: 'id, phieuId, thuTu',
      caiDat: 'id',
    });
  }
}

export const db = new SoCanLuaDB();

export async function layHoacTaoCaiDat(): Promise<CaiDat> {
  const existing = await db.caiDat.get('default');
  if (existing) return existing;
  const macDinh: CaiDat = {
    id: 'default',
    coChu: 'lon',
    daXemHuongDan: false,
  };
  await db.caiDat.put(macDinh);
  return macDinh;
}

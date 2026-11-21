export type TareMode = 'bags_per_kg' | 'kg_per_bag' | 'manual_kg';

export interface TareConfig {
  mode: TareMode;
  /** Ví dụ: 8 bao trừ 1 kg */
  bagsPerKg: number;
  /** Ví dụ: 0.12 kg/bao */
  kgPerBag: number;
  /** Nhập trực tiếp tổng số kg trừ bao */
  manualTareKg: number;
}

/**
 * Mỗi bảng cân gồm 5 cột x 5 dòng = 25 bao (theo đúng mẫu sổ cân lúa truyền thống).
 * cells[colIndex][rowIndex] với colIndex 0..4, rowIndex 0..4
 */
export interface WeighingTable {
  id: string;
  name: string;
  cells: (number | null)[][];
}

export interface WeighingRecord {
  id: string;
  code: string;
  /** Định dạng YYYY-MM-DD */
  date: string;
  plotId?: string;
  plotName: string;
  riceVariety: string;
  weigherName: string;
  farmerName: string;
  pricePerKg: number;
  tareConfig: TareConfig;
  tables: WeighingTable[];
  deposit: number;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface Plot {
  id: string;
  name: string;
  areaCong?: number;
  riceVariety?: string;
  owner?: string;
  notes?: string;
}

export interface AppSettings {
  defaultPricePerKg: number;
  defaultTareConfig: TareConfig;
  defaultWeigherName: string;
  /** Tự động đổi 3 chữ số liền thành số lẻ (VD: 555 => 55,5) */
  quickThreeDigitDecimal: boolean;
}

export interface RecordSummary {
  bagCount: number;
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  totalAmount: number;
  remainingAmount: number;
}

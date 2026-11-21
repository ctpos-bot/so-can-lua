import type {
  RecordSummary,
  TareConfig,
  WeighingRecord,
  WeighingTable,
} from '../types/weighing';

export const COLS_PER_TABLE = 5;
export const ROWS_PER_TABLE = 5;

export function createEmptyTable(index: number): WeighingTable {
  const cells: (number | null)[][] = Array.from({ length: COLS_PER_TABLE }, () =>
    Array.from({ length: ROWS_PER_TABLE }, () => null)
  );
  return {
    id: `tbl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: `Bảng ${index}`,
    cells,
  };
}

export function parseWeightInput(
  raw: string,
  quickThreeDigitDecimal = true
): number | null {
  const cleaned = raw.trim().replace(/,/g, '.').replace(/\s+/g, '');
  if (!cleaned) return null;

  // Nhập nhanh 3 chữ số không cần dấu phẩy: 555 => 55.5, 495 => 49.5
  if (quickThreeDigitDecimal && /^\d{3}$/.test(cleaned)) {
    const num = Number(cleaned) / 10;
    return num > 0 ? Math.round(num * 100) / 100 : null;
  }

  const num = Number(cleaned);
  if (!Number.isFinite(num) || num <= 0) return null;
  return Math.round(num * 100) / 100;
}

export function formatWeight(val: number): string {
  const rounded = Math.round(val * 100) / 100;
  return rounded.toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatCurrency(val: number): string {
  return `${Math.round(val).toLocaleString('vi-VN')} đ`;
}

export function calcTableColumnTotals(table: WeighingTable): number[] {
  return table.cells.map((col) => {
    const sum = col.reduce<number>((acc, v) => acc + (v ?? 0), 0);
    return Math.round(sum * 100) / 100;
  });
}

export function calcTableTotal(table: WeighingTable): {
  bagCount: number;
  grossWeight: number;
} {
  let bagCount = 0;
  let grossWeight = 0;
  for (const col of table.cells) {
    for (const val of col) {
      if (val !== null && val > 0) {
        bagCount += 1;
        grossWeight += val;
      }
    }
  }
  return {
    bagCount,
    grossWeight: Math.round(grossWeight * 100) / 100,
  };
}

export function calcTareWeight(bagCount: number, tareConfig: TareConfig): number {
  if (bagCount <= 0 && tareConfig.mode !== 'manual_kg') return 0;
  let tare = 0;
  if (tareConfig.mode === 'bags_per_kg') {
    const divisor = tareConfig.bagsPerKg > 0 ? tareConfig.bagsPerKg : 8;
    tare = bagCount / divisor;
  } else if (tareConfig.mode === 'kg_per_bag') {
    tare = bagCount * Math.max(0, tareConfig.kgPerBag);
  } else {
    tare = Math.max(0, tareConfig.manualTareKg);
  }
  return Math.round(tare * 100) / 100;
}

export function calcRecordSummary(record: WeighingRecord): RecordSummary {
  let bagCount = 0;
  let grossWeight = 0;

  for (const table of record.tables) {
    const t = calcTableTotal(table);
    bagCount += t.bagCount;
    grossWeight += t.grossWeight;
  }

  grossWeight = Math.round(grossWeight * 100) / 100;
  const tareWeight = calcTareWeight(bagCount, record.tareConfig);
  const netWeight = Math.max(0, Math.round((grossWeight - tareWeight) * 100) / 100);
  const totalAmount = Math.round(netWeight * (record.pricePerKg || 0));
  const remainingAmount = totalAmount - (record.deposit || 0);

  return {
    bagCount,
    grossWeight,
    tareWeight,
    netWeight,
    totalAmount,
    remainingAmount,
  };
}

export function formatDateVN(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function generateRecordCode(dateStr: string, existingCount: number): string {
  const compact = dateStr.replace(/-/g, '');
  const seq = String(existingCount + 1).padStart(2, '0');
  return `CL-${compact}-${seq}`;
}

export function exportRecordsToCSV(records: WeighingRecord[]): void {
  const headers = [
    'Mã phiếu',
    'Ngày cân',
    'Khuông đất',
    'Giống lúa',
    'Người cân',
    'Chủ ruộng',
    'Số bao',
    'Tổng thô (kg)',
    'Trừ bao (kg)',
    'Số ký thực (kg)',
    'Đơn giá (đ/kg)',
    'Thành tiền (đ)',
    'Đã cọc (đ)',
    'Còn lại (đ)',
    'Ghi chú',
  ];

  const escapeCsv = (v: string | number) => {
    const str = String(v ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = records.map((rec) => {
    const s = calcRecordSummary(rec);
    return [
      rec.code,
      formatDateVN(rec.date),
      rec.plotName || 'Chưa phân loại',
      rec.riceVariety,
      rec.weigherName || '',
      rec.farmerName || '',
      s.bagCount,
      s.grossWeight,
      s.tareWeight,
      s.netWeight,
      rec.pricePerKg,
      s.totalAmount,
      rec.deposit,
      s.remainingAmount,
      rec.notes || '',
    ]
      .map(escapeCsv)
      .join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `bao-cao-can-lua-${getTodayISO()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

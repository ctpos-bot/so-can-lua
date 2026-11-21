import type { AppSettings, Plot, WeighingRecord } from '../types/weighing';
import { getTodayISO } from './calculations';

const KEYS = {
  RECORDS: 'canlua_records_v1',
  PLOTS: 'canlua_plots_v1',
  WEIGHERS: 'canlua_weighers_v1',
  SETTINGS: 'canlua_settings_v1',
  ACTIVE_DRAFT: 'canlua_active_draft_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  defaultPricePerKg: 7500,
  defaultTareConfig: {
    mode: 'bags_per_kg',
    bagsPerKg: 8,
    kgPerBag: 0.125,
    manualTareKg: 0,
  },
  defaultWeigherName: 'Anh Ba',
  quickThreeDigitDecimal: true,
};

export const SAMPLE_PLOTS: Plot[] = [
  {
    id: 'plot-1',
    name: 'Khuông Bảy Xã',
    areaCong: 5,
    riceVariety: 'OM 18',
    owner: 'Chú Tư',
    notes: 'Đất gò, lúa khô ráo',
  },
  {
    id: 'plot-2',
    name: 'Ruộng Kênh 3',
    areaCong: 8,
    riceVariety: 'Đài Thơm 8',
    owner: 'Anh Năm',
    notes: '',
  },
];

export const SAMPLE_WEIGHERS: string[] = ['Anh Ba', 'Tư Lùn', 'Hai Hùng'];

export function createSampleRecords(): WeighingRecord[] {
  const today = getTodayISO();
  const now = Date.now();
  return [
    {
      id: 'rec-sample-1',
      code: `CL-${today.replace(/-/g, '')}-01`,
      date: today,
      plotId: 'plot-1',
      plotName: 'Khuông Bảy Xã',
      areaCong: 5,
      riceVariety: 'OM 18',
      weigherName: 'Anh Ba',
      farmerName: 'Chú Tư',
      pricePerKg: 7800,
      tareConfig: {
        mode: 'bags_per_kg',
        bagsPerKg: 8,
        kgPerBag: 0.125,
        manualTareKg: 0,
      },
      tables: [
        {
          id: 'tbl-sample-1',
          name: 'Bảng 1',
          cells: [
            [39.5, 40.5, 50, 49, 56],
            [39.5, 40.5, 53, 49, 56],
            [39.5, 40.5, 50, 54, 56],
            [39.5, 40.5, 50, 49, 60],
            [39.5, 40.5, 50, 53, 50],
          ],
        },
      ],
      deposit: 2000000,
      expenses: [
        { id: 'exp-1', name: 'Tiền giống & Phân bón', amount: 2500000 },
        { id: 'exp-2', name: 'Công cắt & Vận chuyển', amount: 1200000 },
      ],
      notes: 'Phiếu mẫu theo bảng cân 5x5 (25 bao)',
      createdAt: now - 3600000,
      updatedAt: now - 3600000,
    },
  ];
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadRecords(): WeighingRecord[] {
  const raw = localStorage.getItem(KEYS.RECORDS);
  if (raw === null) {
    const samples = createSampleRecords();
    saveRecords(samples);
    return samples;
  }
  return safeParse<WeighingRecord[]>(raw, []);
}

export function saveRecords(records: WeighingRecord[]): void {
  localStorage.setItem(KEYS.RECORDS, JSON.stringify(records));
}

export function loadPlots(): Plot[] {
  const raw = localStorage.getItem(KEYS.PLOTS);
  if (raw === null) {
    savePlots(SAMPLE_PLOTS);
    return SAMPLE_PLOTS;
  }
  return safeParse<Plot[]>(raw, []);
}

export function savePlots(plots: Plot[]): void {
  localStorage.setItem(KEYS.PLOTS, JSON.stringify(plots));
}

export function loadWeighers(): string[] {
  const raw = localStorage.getItem(KEYS.WEIGHERS);
  if (raw === null) {
    saveWeighers(SAMPLE_WEIGHERS);
    return SAMPLE_WEIGHERS;
  }
  return safeParse<string[]>(raw, []);
}

export function saveWeighers(weighers: string[]): void {
  localStorage.setItem(KEYS.WEIGHERS, JSON.stringify(weighers));
}

export function loadSettings(): AppSettings {
  const parsed = safeParse<Partial<AppSettings>>(
    localStorage.getItem(KEYS.SETTINGS),
    {}
  );
  return {
    ...DEFAULT_SETTINGS,
    ...parsed,
    defaultTareConfig: {
      ...DEFAULT_SETTINGS.defaultTareConfig,
      ...(parsed.defaultTareConfig || {}),
    },
  };
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export function loadDraft(): WeighingRecord | null {
  return safeParse<WeighingRecord | null>(localStorage.getItem(KEYS.ACTIVE_DRAFT), null);
}

export function saveDraft(draft: WeighingRecord | null): void {
  if (!draft) {
    localStorage.removeItem(KEYS.ACTIVE_DRAFT);
  } else {
    localStorage.setItem(KEYS.ACTIVE_DRAFT, JSON.stringify(draft));
  }
}

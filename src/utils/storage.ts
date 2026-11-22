import type { AppSettings, Plot, WeighingRecord } from '../types/weighing';

const KEYS = {
  RECORDS: 'canlua_records_v1',
  PLOTS: 'canlua_plots_v1',
  WEIGHERS: 'canlua_weighers_v1',
  SETTINGS: 'canlua_settings_v1',
  ACTIVE_DRAFT: 'canlua_active_draft_v1',
  ONBOARDING_DONE: 'canlua_onboarding_done_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  defaultPricePerKg: 7500,
  defaultTareConfig: {
    mode: 'bags_per_kg',
    bagsPerKg: 8,
    kgPerBag: 0.125,
    manualTareKg: 0,
  },
  defaultWeigherName: '',
  quickThreeDigitDecimal: true,
  voiceFeedback: false,
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadRecords(): WeighingRecord[] {
  return safeParse<WeighingRecord[]>(localStorage.getItem(KEYS.RECORDS), []);
}

export function saveRecords(records: WeighingRecord[]): void {
  localStorage.setItem(KEYS.RECORDS, JSON.stringify(records));
}

export function loadPlots(): Plot[] {
  return safeParse<Plot[]>(localStorage.getItem(KEYS.PLOTS), []);
}

export function savePlots(plots: Plot[]): void {
  localStorage.setItem(KEYS.PLOTS, JSON.stringify(plots));
}

export function loadWeighers(): string[] {
  return safeParse<string[]>(localStorage.getItem(KEYS.WEIGHERS), []);
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

export function isOnboardingDone(): boolean {
  return localStorage.getItem(KEYS.ONBOARDING_DONE) === '1';
}

export function markOnboardingDone(): void {
  localStorage.setItem(KEYS.ONBOARDING_DONE, '1');
}

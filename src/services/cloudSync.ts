import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { AppSettings, Plot, WeighingRecord } from '../types/weighing';
import { db } from './firebase';

export interface CloudUserData {
  records: WeighingRecord[];
  plots: Plot[];
  weighers: string[];
  settings: AppSettings;
  updatedAt: number;
}

interface FirestoreUserDoc {
  recordsJson?: string;
  plotsJson?: string;
  weighers?: string[];
  settingsJson?: string;
  recordCount?: number;
  updatedAt?: number;
}

function mergeRecords(
  local: WeighingRecord[],
  cloud: WeighingRecord[]
): WeighingRecord[] {
  const map = new Map<string, WeighingRecord>();
  for (const r of cloud) map.set(r.id, r);
  for (const r of local) {
    const existing = map.get(r.id);
    if (!existing || r.updatedAt > existing.updatedAt) {
      map.set(r.id, r);
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => b.date.localeCompare(a.date) || b.updatedAt - a.updatedAt
  );
}

function mergePlots(local: Plot[], cloud: Plot[]): Plot[] {
  const map = new Map<string, Plot>();
  for (const p of cloud) map.set(p.id, p);
  for (const p of local) {
    if (!map.has(p.id)) map.set(p.id, p);
  }
  return Array.from(map.values());
}

function mergeWeighers(local: string[], cloud: string[]): string[] {
  return Array.from(new Set([...local, ...cloud]));
}

function safeJsonParse<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function toFirestoreDoc(data: CloudUserData): FirestoreUserDoc {
  return {
    recordsJson: JSON.stringify(data.records),
    plotsJson: JSON.stringify(data.plots),
    weighers: data.weighers,
    settingsJson: JSON.stringify(data.settings),
    recordCount: data.records.length,
    updatedAt: data.updatedAt,
  };
}

export async function syncWithCloud(
  uid: string,
  localData: Omit<CloudUserData, 'updatedAt'>
): Promise<CloudUserData> {
  if (!db) {
    return { ...localData, updatedAt: Date.now() };
  }

  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);

  let merged: CloudUserData;
  if (snap.exists()) {
    const cloudDoc = snap.data() as FirestoreUserDoc;
    const cloudRecords = safeJsonParse<WeighingRecord[]>(cloudDoc.recordsJson, []);
    const cloudPlots = safeJsonParse<Plot[]>(cloudDoc.plotsJson, []);
    const cloudSettings = safeJsonParse<AppSettings | null>(
      cloudDoc.settingsJson,
      null
    );

    merged = {
      records: mergeRecords(localData.records, cloudRecords),
      plots: mergePlots(localData.plots, cloudPlots),
      weighers: mergeWeighers(localData.weighers, cloudDoc.weighers || []),
      settings: cloudSettings || localData.settings,
      updatedAt: Date.now(),
    };
  } else {
    merged = {
      ...localData,
      updatedAt: Date.now(),
    };
  }

  await setDoc(ref, toFirestoreDoc(merged), { merge: true });
  return merged;
}

export async function pushToCloud(
  uid: string,
  data: Omit<CloudUserData, 'updatedAt'>
): Promise<void> {
  if (!db) return;
  const ref = doc(db, 'users', uid);
  await setDoc(
    ref,
    toFirestoreDoc({
      ...data,
      updatedAt: Date.now(),
    }),
    { merge: true }
  );
}

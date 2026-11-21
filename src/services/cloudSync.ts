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
    const cloud = snap.data() as Partial<CloudUserData>;
    merged = {
      records: mergeRecords(localData.records, cloud.records || []),
      plots: mergePlots(localData.plots, cloud.plots || []),
      weighers: mergeWeighers(localData.weighers, cloud.weighers || []),
      settings: cloud.settings || localData.settings,
      updatedAt: Date.now(),
    };
  } else {
    merged = {
      ...localData,
      updatedAt: Date.now(),
    };
  }

  await setDoc(ref, merged, { merge: true });
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
    {
      ...data,
      updatedAt: Date.now(),
    },
    { merge: true }
  );
}

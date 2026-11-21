import { useEffect, useState } from 'react';
import {
  Scale,
  BookOpen,
  BarChart3,
  FolderCog,
  Wheat,
} from 'lucide-react';
import type { AppSettings, Plot, WeighingRecord } from './types/weighing';
import {
  calcRecordSummary,
  createEmptyTable,
  formatCurrency,
  formatWeight,
  generateRecordCode,
  getTodayISO,
} from './utils/calculations';
import {
  loadDraft,
  loadPlots,
  loadRecords,
  loadSettings,
  loadWeighers,
  saveDraft,
  savePlots,
  saveRecords,
  saveSettings,
  saveWeighers,
} from './utils/storage';
import { WeighingForm } from './components/WeighingForm';
import { RecordsList } from './components/RecordsList';
import { ReportsView } from './components/ReportsView';
import { MasterDataView } from './components/MasterDataView';

type TabKey = 'weigh' | 'records' | 'reports' | 'settings';

function createNewRecord(
  settings: AppSettings,
  existingRecords: WeighingRecord[]
): WeighingRecord {
  const today = getTodayISO();
  const sameDayCount = existingRecords.filter((r) => r.date === today).length;
  const now = Date.now();
  return {
    id: `rec-${now}`,
    code: generateRecordCode(today, sameDayCount),
    date: today,
    plotName: '',
    riceVariety: '',
    weigherName: settings.defaultWeigherName || '',
    farmerName: '',
    pricePerKg: settings.defaultPricePerKg || 7500,
    tareConfig: { ...settings.defaultTareConfig },
    tables: [createEmptyTable(1)],
    deposit: 0,
    notes: '',
    createdAt: now,
    updatedAt: now,
  };
}

export function App() {
  const [tab, setTab] = useState<TabKey>('weigh');
  const [records, setRecords] = useState<WeighingRecord[]>(() => loadRecords());
  const [plots, setPlots] = useState<Plot[]>(() => loadPlots());
  const [weighers, setWeighers] = useState<string[]>(() => loadWeighers());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  const [activeRecord, setActiveRecord] = useState<WeighingRecord>(() => {
    const draft = loadDraft();
    if (draft) return draft;
    const initialRecords = loadRecords();
    if (initialRecords.length > 0) return initialRecords[0];
    return createNewRecord(loadSettings(), initialRecords);
  });

  const [savedBanner, setSavedBanner] = useState(false);

  useEffect(() => {
    saveRecords(records);
  }, [records]);

  useEffect(() => {
    savePlots(plots);
  }, [plots]);

  useEffect(() => {
    saveWeighers(weighers);
  }, [weighers]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveDraft(activeRecord);
  }, [activeRecord]);

  const isEditingExisting = records.some((r) => r.id === activeRecord.id);
  const activeSummary = calcRecordSummary(activeRecord);

  const handleSaveActive = () => {
    const now = Date.now();
    const updatedRec: WeighingRecord = {
      ...activeRecord,
      updatedAt: now,
    };

    setRecords((prev) => {
      const exists = prev.some((r) => r.id === updatedRec.id);
      if (exists) {
        return prev.map((r) => (r.id === updatedRec.id ? updatedRec : r));
      }
      return [updatedRec, ...prev];
    });

    const trimmedWeigher = updatedRec.weigherName.trim();
    if (trimmedWeigher && !weighers.includes(trimmedWeigher)) {
      setWeighers((prev) => [trimmedWeigher, ...prev]);
    }

    setActiveRecord(updatedRec);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  const handleNewRecord = () => {
    const fresh = createNewRecord(settings, records);
    setActiveRecord(fresh);
    setSavedBanner(false);
    setTab('weigh');
  };

  const handleSelectRecord = (rec: WeighingRecord) => {
    setActiveRecord(rec);
    setSavedBanner(false);
    setTab('weigh');
  };

  const handleDuplicateRecord = (rec: WeighingRecord) => {
    const today = getTodayISO();
    const sameDayCount = records.filter((r) => r.date === today).length;
    const now = Date.now();
    const copy: WeighingRecord = {
      ...JSON.parse(JSON.stringify(rec)),
      id: `rec-${now}`,
      code: generateRecordCode(today, sameDayCount),
      date: today,
      createdAt: now,
      updatedAt: now,
    };
    setActiveRecord(copy);
    setTab('weigh');
  };

  const handleDeleteRecord = (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa phiếu cân này không?')) return;
    const remaining = records.filter((r) => r.id !== id);
    setRecords(remaining);
    if (activeRecord.id === id) {
      setActiveRecord(createNewRecord(settings, remaining));
    }
  };

  const handleImportBackup = (data: {
    records?: WeighingRecord[];
    plots?: Plot[];
    weighers?: string[];
    settings?: AppSettings;
  }) => {
    if (Array.isArray(data.records)) setRecords(data.records);
    if (Array.isArray(data.plots)) setPlots(data.plots);
    if (Array.isArray(data.weighers)) setWeighers(data.weighers);
    if (data.settings) setSettings(data.settings);
  };

  const navItems: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'weigh', label: 'Cân Lúa', icon: <Scale className="h-6 w-6" /> },
    { key: 'records', label: 'Sổ Cân', icon: <BookOpen className="h-6 w-6" /> },
    { key: 'reports', label: 'Báo Cáo', icon: <BarChart3 className="h-6 w-6" /> },
    { key: 'settings', label: 'Danh Mục', icon: <FolderCog className="h-6 w-6" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-8">
      {/* Top App Bar */}
      <header className="no-print sticky top-0 z-30 border-b border-emerald-800/20 bg-emerald-700 text-white shadow-sm pt-safe">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-emerald-950 shadow-xs">
              <Wheat className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold leading-tight tracking-tight">
                Sổ Cân Lúa
              </h1>
              <p className="text-[11px] text-emerald-100">
                Ghi mã cân • Trừ bao • Tính tiền • Báo cáo
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                  tab === item.key
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-emerald-50 hover:bg-emerald-600'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/* Quick live pill on mobile when weighing */}
          {tab === 'weigh' && (
            <div className="text-right md:hidden">
              <div className="text-xs font-bold text-emerald-100">
                {activeSummary.bagCount} bao • {formatWeight(activeSummary.netWeight)} kg
              </div>
              <div className="text-base font-black text-amber-300 tabular-nums">
                {formatCurrency(activeSummary.totalAmount)}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-3 pt-4 sm:px-4">
        {tab === 'weigh' && (
          <WeighingForm
            record={activeRecord}
            plots={plots}
            weighers={weighers}
            isEditingExisting={isEditingExisting}
            savedBanner={savedBanner}
            onChange={setActiveRecord}
            onSave={handleSaveActive}
            onNewRecord={handleNewRecord}
            onPrint={() => window.print()}
          />
        )}

        {tab === 'records' && (
          <RecordsList
            records={records}
            onSelectRecord={handleSelectRecord}
            onDuplicateRecord={handleDuplicateRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        )}

        {tab === 'reports' && <ReportsView records={records} plots={plots} />}

        {tab === 'settings' && (
          <MasterDataView
            plots={plots}
            weighers={weighers}
            settings={settings}
            records={records}
            onUpdatePlots={setPlots}
            onUpdateWeighers={setWeighers}
            onUpdateSettings={setSettings}
            onImportBackup={handleImportBackup}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="no-print fixed bottom-0 left-0 right-0 z-40 border-t-2 border-slate-200 bg-white/95 backdrop-blur pb-safe md:hidden">
        <div className="grid grid-cols-4">
          {navItems.map((item) => {
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-extrabold transition ${
                  active ? 'text-emerald-800' : 'text-slate-600'
                }`}
              >
                <div
                  className={`rounded-full px-3.5 py-1 transition ${
                    active ? 'bg-emerald-100 text-emerald-900' : ''
                  }`}
                >
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default App;

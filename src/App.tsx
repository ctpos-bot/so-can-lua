import { useEffect, useRef, useState } from 'react';
import type { CaiDat, CoChuApp, LanCan, PhieuCan, TabChinh } from './types';
import { db, layHoacTaoCaiDat } from './db/database';
import { khoiTaoDuLieuMauNeuTrong } from './db/seedSample';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { FirstRunGuide } from './components/onboarding/FirstRunGuide';
import { HomeScreen } from './components/home/HomeScreen';
import { CreateTicketScreen } from './components/create/CreateTicketScreen';
import { WeighScreen } from './components/weigh/WeighScreen';
import { SummaryScreen } from './components/summary/SummaryScreen';
import { ShareTicketScreen } from './components/share/ShareTicketScreen';
import { LedgerScreen } from './components/ledger/LedgerScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { UndoToast } from './components/ui/UndoToast';

type ManHinhCanLua = 'home' | 'create' | 'weigh' | 'summary' | 'share';

type UndoPayload =
  | { loai: 'lan'; lan: LanCan; message: string }
  | { loai: 'phieu'; phieu: PhieuCan; cacLan: LanCan[]; message: string };

export function App() {
  const [tab, setTab] = useState<TabChinh>('can_lua');
  const [manHinh, setManHinh] = useState<ManHinhCanLua>('home');
  const [phieuDangMoId, setPhieuDangMoId] = useState<string | null>(null);

  const [danhSachPhieu, setDanhSachPhieu] = useState<PhieuCan[]>([]);
  const [tatCaLanCan, setTatCaLanCan] = useState<LanCan[]>([]);
  const [caiDat, setCaiDat] = useState<CaiDat>({
    id: 'default',
    coChu: 'lon',
    daXemHuongDan: true,
  });
  const [dangTai, setDangTai] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [undoItem, setUndoItem] = useState<UndoPayload | null>(null);
  const undoTimerRef = useRef<number | null>(null);

  const taiDuLieu = async () => {
    await khoiTaoDuLieuMauNeuTrong();
    const [phieu, lan, cd] = await Promise.all([
      db.phieuCan.toArray(),
      db.lanCan.toArray(),
      layHoacTaoCaiDat(),
    ]);
    setDanhSachPhieu(phieu);
    setTatCaLanCan(lan);
    setCaiDat(cd);
    setDangTai(false);
  };

  useEffect(() => {
    void taiDuLieu();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (caiDat.coChu === 'rat_lon') {
      root.classList.add('co-chu-rat-lon');
    } else {
      root.classList.remove('co-chu-rat-lon');
    }
  }, [caiDat.coChu]);

  const danhDauDaLuu = () => {
    setSaveStatus('saved');
    window.setTimeout(() => setSaveStatus('idle'), 1500);
  };

  const datUndoToast = (payload: UndoPayload) => {
    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);
    setUndoItem(payload);
    undoTimerRef.current = window.setTimeout(() => {
      setUndoItem(null);
    }, 5000);
  };

  const hoanTatHuongDan = async () => {
    const capNhat: CaiDat = { ...caiDat, daXemHuongDan: true };
    await db.caiDat.put(capNhat);
    setCaiDat(capNhat);
  };

  const handleTaoPhieu = async (
    duLieu: Omit<PhieuCan, 'id' | 'ngayTao' | 'ngayCapNhat'>
  ) => {
    setSaveStatus('saving');
    const now = Date.now();
    const phieuMoi: PhieuCan = {
      ...duLieu,
      id: `phieu-${now}`,
      ngayTao: now,
      ngayCapNhat: now,
    };
    await db.phieuCan.put(phieuMoi);
    setDanhSachPhieu((prev) => [phieuMoi, ...prev]);
    setPhieuDangMoId(phieuMoi.id);
    setManHinh('weigh');
    danhDauDaLuu();
  };

  const handleCapNhatPhieu = async (capNhat: Partial<PhieuCan>) => {
    if (!phieuDangMoId) return;
    setSaveStatus('saving');
    const now = Date.now();
    await db.phieuCan.update(phieuDangMoId, { ...capNhat, ngayCapNhat: now });
    setDanhSachPhieu((prev) =>
      prev.map((p) =>
        p.id === phieuDangMoId ? { ...p, ...capNhat, ngayCapNhat: now } : p
      )
    );
    danhDauDaLuu();
  };

  const handleThemLanCan = async (soKy: number): Promise<string> => {
    if (!phieuDangMoId) return '';
    setSaveStatus('saving');
    const lanCuaPhieu = tatCaLanCan.filter((l) => l.phieuId === phieuDangMoId);
    const maxThuTu = lanCuaPhieu.reduce((m, l) => Math.max(m, l.thuTu), 0);
    const now = Date.now();
    const lanMoi: LanCan = {
      id: `lan-${now}-${Math.random().toString(36).slice(2, 6)}`,
      phieuId: phieuDangMoId,
      thuTu: maxThuTu + 1,
      soKy,
      ngayTao: now,
    };
    await db.lanCan.put(lanMoi);
    await db.phieuCan.update(phieuDangMoId, { ngayCapNhat: now });
    setTatCaLanCan((prev) => [...prev, lanMoi]);
    setDanhSachPhieu((prev) =>
      prev.map((p) => (p.id === phieuDangMoId ? { ...p, ngayCapNhat: now } : p))
    );
    danhDauDaLuu();
    return lanMoi.id;
  };

  const handleSuaLanCan = async (lanId: string, soKy: number) => {
    if (!phieuDangMoId) return;
    setSaveStatus('saving');
    const now = Date.now();
    await db.lanCan.update(lanId, { soKy });
    await db.phieuCan.update(phieuDangMoId, { ngayCapNhat: now });
    setTatCaLanCan((prev) =>
      prev.map((l) => (l.id === lanId ? { ...l, soKy } : l))
    );
    danhDauDaLuu();
  };

  const handleXoaLanCan = async (lan: LanCan) => {
    setSaveStatus('saving');
    await db.lanCan.delete(lan.id);
    setTatCaLanCan((prev) => prev.filter((l) => l.id !== lan.id));
    danhDauDaLuu();
    datUndoToast({ loai: 'lan', lan, message: `Đã xóa bao #${lan.thuTu}` });
  };

  const handleXoaPhieu = async (phieu: PhieuCan) => {
    setSaveStatus('saving');
    const cacLan = tatCaLanCan.filter((l) => l.phieuId === phieu.id);
    await db.transaction('rw', db.phieuCan, db.lanCan, async () => {
      await db.phieuCan.delete(phieu.id);
      await db.lanCan.where('phieuId').equals(phieu.id).delete();
    });
    setDanhSachPhieu((prev) => prev.filter((p) => p.id !== phieu.id));
    setTatCaLanCan((prev) => prev.filter((l) => l.phieuId !== phieu.id));
    if (phieuDangMoId === phieu.id) {
      setPhieuDangMoId(null);
      setManHinh('home');
    }
    danhDauDaLuu();
    datUndoToast({
      loai: 'phieu',
      phieu,
      cacLan,
      message: `Đã xóa phiếu ${phieu.tenKhach}`,
    });
  };

  const handleHoanTac = async () => {
    if (!undoItem) return;
    if (undoTimerRef.current) window.clearTimeout(undoTimerRef.current);

    if (undoItem.loai === 'lan') {
      await db.lanCan.put(undoItem.lan);
      setTatCaLanCan((prev) => [...prev, undoItem.lan]);
    } else {
      await db.transaction('rw', db.phieuCan, db.lanCan, async () => {
        await db.phieuCan.put(undoItem.phieu);
        if (undoItem.cacLan.length > 0) {
          await db.lanCan.bulkPut(undoItem.cacLan);
        }
      });
      setDanhSachPhieu((prev) => [undoItem.phieu, ...prev]);
      setTatCaLanCan((prev) => [...prev, ...undoItem.cacLan]);
    }

    setUndoItem(null);
    danhDauDaLuu();
  };

  const handleDoiCoChu = async (coChu: CoChuApp) => {
    const capNhat: CaiDat = { ...caiDat, coChu };
    await db.caiDat.put(capNhat);
    setCaiDat(capNhat);
    danhDauDaLuu();
  };

  const handleKhoiPhuc = async (duLieu: {
    phieuCan: PhieuCan[];
    lanCan: LanCan[];
  }) => {
    await db.transaction('rw', db.phieuCan, db.lanCan, async () => {
      await db.phieuCan.clear();
      await db.lanCan.clear();
      await db.phieuCan.bulkPut(duLieu.phieuCan);
      await db.lanCan.bulkPut(duLieu.lanCan);
    });
    setDanhSachPhieu(duLieu.phieuCan);
    setTatCaLanCan(duLieu.lanCan);
    setPhieuDangMoId(null);
    setManHinh('home');
    danhDauDaLuu();
  };

  const phieuDangMo =
    danhSachPhieu.find((p) => p.id === phieuDangMoId) || null;
  const lanCuaPhieuDangMo = phieuDangMo
    ? tatCaLanCan.filter((l) => l.phieuId === phieuDangMo.id)
    : [];

  const getHeaderTitle = () => {
    if (tab === 'so_can') return 'Sổ cân';
    if (tab === 'cai_dat') return 'Cài đặt';
    if (manHinh === 'create') return 'Tạo phiếu mới';
    if (manHinh === 'weigh') return 'Cân lúa';
    if (manHinh === 'summary') return 'Tổng kết';
    if (manHinh === 'share') return 'Phiếu cân';
    return 'Sổ Cân Lúa';
  };

  const handleBack = () => {
    if (manHinh === 'share') setManHinh('summary');
    else if (manHinh === 'summary') setManHinh('weigh');
    else if (manHinh === 'weigh' || manHinh === 'create') setManHinh('home');
  };

  return (
    <div className="min-h-screen bg-white text-[#111111]">
      <Header
        title={getHeaderTitle()}
        onBack={tab === 'can_lua' && manHinh !== 'home' ? handleBack : undefined}
        saveStatus={saveStatus}
      />

      <main className="mx-auto max-w-lg px-3 pt-4">
        {dangTai ? (
          <p className="py-10 text-center text-body font-bold">
            Đang tải sổ cân...
          </p>
        ) : tab === 'can_lua' ? (
          <>
            {manHinh === 'home' && (
              <HomeScreen
                danhSachPhieu={danhSachPhieu}
                tatCaLanCan={tatCaLanCan}
                onCanMoi={() => setManHinh('create')}
                onMoPhieu={(phieu) => {
                  setPhieuDangMoId(phieu.id);
                  setManHinh('weigh');
                }}
              />
            )}

            {manHinh === 'create' && (
              <CreateTicketScreen
                danhSachPhieuCu={danhSachPhieu}
                onTaoPhieu={(duLieu) => void handleTaoPhieu(duLieu)}
              />
            )}

            {manHinh === 'weigh' && phieuDangMo && (
              <WeighScreen
                phieu={phieuDangMo}
                danhSachLanCan={lanCuaPhieuDangMo}
                onThemLanCan={handleThemLanCan}
                onSuaLanCan={handleSuaLanCan}
                onXoaLanCan={handleXoaLanCan}
                onMoTongKet={() => setManHinh('summary')}
              />
            )}

            {manHinh === 'summary' && phieuDangMo && (
              <SummaryScreen
                phieu={phieuDangMo}
                danhSachLanCan={lanCuaPhieuDangMo}
                onCapNhatPhieu={handleCapNhatPhieu}
                onMoChiaSe={() => setManHinh('share')}
              />
            )}

            {manHinh === 'share' && phieuDangMo && (
              <ShareTicketScreen
                phieu={phieuDangMo}
                danhSachLanCan={lanCuaPhieuDangMo}
              />
            )}
          </>
        ) : tab === 'so_can' ? (
          <LedgerScreen
            danhSachPhieu={danhSachPhieu}
            tatCaLanCan={tatCaLanCan}
            onMoPhieu={(phieu) => {
              setPhieuDangMoId(phieu.id);
              setTab('can_lua');
              setManHinh('weigh');
            }}
            onXoaPhieu={handleXoaPhieu}
          />
        ) : (
          <SettingsScreen
            caiDat={caiDat}
            danhSachPhieu={danhSachPhieu}
            tatCaLanCan={tatCaLanCan}
            onDoiCoChu={handleDoiCoChu}
            onMoHuongDan={() =>
              setCaiDat((prev) => ({ ...prev, daXemHuongDan: false }))
            }
            onKhoiPhuc={handleKhoiPhuc}
          />
        )}
      </main>

      <UndoToast
        visible={undoItem !== null}
        message={undoItem?.message || ''}
        onUndo={() => void handleHoanTac()}
      />

      <BottomNav
        activeTab={tab}
        onSelectTab={(nextTab) => {
          setTab(nextTab);
          if (nextTab === 'can_lua' && manHinh !== 'home' && !phieuDangMo) {
            setManHinh('home');
          }
        }}
      />

      <FirstRunGuide
        open={!dangTai && !caiDat.daXemHuongDan}
        onFinish={() => void hoanTatHuongDan()}
      />
    </div>
  );
}

export default App;

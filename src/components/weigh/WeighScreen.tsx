import React, { useMemo, useState } from 'react';
import { Calculator, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import type { LanCan, PhieuCan } from '../../types';
import { dinhDangSo, tinhTongKetPhieu } from '../../utils/format';
import { BigButton } from '../ui/BigButton';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { NumberPad } from '../ui/NumberPad';

interface WeighScreenProps {
  phieu: PhieuCan;
  danhSachLanCan: LanCan[];
  onThemLanCan: (soKy: number) => Promise<string>;
  onSuaLanCan: (lanId: string, soKy: number) => Promise<void>;
  onXoaLanCan: (lan: LanCan) => Promise<void>;
  onMoTongKet: () => void;
}

export const WeighScreen: React.FC<WeighScreenProps> = ({
  phieu,
  danhSachLanCan,
  onThemLanCan,
  onSuaLanCan,
  onXoaLanCan,
  onMoTongKet,
}) => {
  const [chuoiNhap, setChuoiNhap] = useState('');
  const [dangSuaLanId, setDangSuaLanId] = useState<string | null>(null);
  const [oVuaGhiId, setOVuaGhiId] = useState<string | null>(null);
  const [loiNhap, setLoiNhap] = useState('');
  const [choXacNhanSoLon, setChoXacNhanSoLon] = useState<number | null>(null);
  const [choXacNhanXoa, setChoXacNhanXoa] = useState<LanCan | null>(null);
  const [moBanPhim, setMoBanPhim] = useState(true);

  const sapXep = useMemo(
    () => [...danhSachLanCan].sort((a, b) => a.thuTu - b.thuTu),
    [danhSachLanCan]
  );

  const tongKet = useMemo(
    () => tinhTongKetPhieu(phieu, sapXep),
    [phieu, sapXep]
  );

  const cacDay = useMemo(() => {
    const groups: { thuTuDay: number; items: LanCan[]; tongDay: number }[] = [];
    for (let i = 0; i < sapXep.length; i += 5) {
      const items = sapXep.slice(i, i + 5);
      const tongDay =
        Math.round(items.reduce((s, item) => s + item.soKy, 0) * 100) / 100;
      groups.push({
        thuTuDay: Math.floor(i / 5) + 1,
        items,
        tongDay,
      });
    }
    return groups;
  }, [sapXep]);

  const thucHienGhi = async (soKy: number) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(35);
    }

    if (dangSuaLanId) {
      await onSuaLanCan(dangSuaLanId, soKy);
      setOVuaGhiId(dangSuaLanId);
      setDangSuaLanId(null);
    } else {
      const newId = await onThemLanCan(soKy);
      setOVuaGhiId(newId);
    }

    setChuoiNhap('');
    setLoiNhap('');
    setTimeout(() => {
      setOVuaGhiId((prev) => prev);
      setTimeout(() => setOVuaGhiId(null), 1400);
    }, 50);
  };

  const handleBamGhi = async () => {
    const so = Number(chuoiNhap.replace(/,/g, '.'));
    if (!chuoiNhap || !Number.isFinite(so) || so <= 0) {
      setLoiNhap('Hãy nhập số ký lớn hơn 0');
      return;
    }

    const lamTron = Math.round(so * 100) / 100;
    if (lamTron > 100) {
      setChoXacNhanSoLon(lamTron);
      return;
    }

    await thucHienGhi(lamTron);
  };

  const handleChonO = (lan: LanCan) => {
    setDangSuaLanId(lan.id);
    setChuoiNhap(String(lan.soKy).replace('.', ','));
    setLoiNhap('');
    setMoBanPhim(true);
  };

  const lanDangSua = sapXep.find((l) => l.id === dangSuaLanId) || null;

  return (
    <div className={`space-y-4 ${moBanPhim ? 'pb-[430px]' : 'pb-44'}`}>
      {/* Trên cùng: TỔNG KÝ và SỐ BAO luôn hiển thị to */}
      <div className="sticky top-[68px] z-20 rounded-2xl border-2 border-[#111111] bg-[#1B5E20] p-4 text-white shadow-md">
        <div className="flex items-center justify-between gap-2 text-body font-bold">
          <span className="truncate">{phieu.tenKhach}</span>
          <span>{phieu.giongLua || 'Lúa'}</span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-3 rounded-xl bg-white p-3 text-[#111111]">
          <div>
            <div className="text-[20px] font-bold">TỔNG KÝ</div>
            <div className="text-metric font-extrabold leading-none text-[#1B5E20]">
              {dinhDangSo(tongKet.tongKy, 2)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[20px] font-bold">SỐ BAO</div>
            <div className="text-metric font-extrabold leading-none text-[#111111]">
              {tongKet.soBao}
            </div>
          </div>
        </div>
      </div>

      {/* Ở giữa: Lưới lần cân chia theo dãy 5 bao */}
      <div className="space-y-3">
        {cacDay.length === 0 ? (
          <div className="rounded-2xl border-2 border-[#111111] bg-white p-5 text-center text-body font-bold text-[#111111]">
            Chưa có bao nào. Hãy bấm số ký bên dưới rồi bấm GHI.
          </div>
        ) : (
          cacDay.map((day) => (
            <div
              key={day.thuTuDay}
              className="rounded-2xl border-2 border-[#111111] bg-white p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-2 border-b-2 border-[#111111] pb-2">
                <span className="text-body font-extrabold text-[#111111]">
                  Dãy {day.thuTuDay} ({day.items.length} bao)
                </span>
                <span className="rounded-xl bg-[#F9A825] px-3 py-1 text-body font-extrabold text-[#111111]">
                  Tổng: {dinhDangSo(day.tongDay, 2)} kg
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {day.items.map((lan) => {
                  const dangChon = dangSuaLanId === lan.id;
                  const vuaGhi = oVuaGhiId === lan.id;
                  return (
                    <button
                      key={lan.id}
                      type="button"
                      onClick={() => handleChonO(lan)}
                      className={`flex min-h-[64px] flex-col items-center justify-center rounded-xl border-2 px-1 py-2 transition ${
                        dangChon
                          ? 'border-[#1B5E20] bg-[#F9A825] text-[#111111]'
                          : vuaGhi
                            ? 'border-[#1B5E20] bg-[#c8e6c9] text-[#111111]'
                            : 'border-[#111111] bg-white text-[#111111]'
                      }`}
                    >
                      <span className="text-[20px] font-bold leading-none">#{lan.thuTu}</span>
                      <span className="mt-1 text-[20px] font-extrabold leading-none">
                        {dinhDangSo(lan.soKy, 2)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Nút chuyển sang Tổng kết */}
      <BigButton
        variant="accent"
        onClick={onMoTongKet}
        icon={<Calculator className="h-7 w-7" />}
      >
        Xem Tổng kết & Tính tiền
      </BigButton>

      {/* Bàn phím số nổi cố định phía trên thanh điều hướng dưới */}
      <div className="fixed bottom-[82px] left-0 right-0 z-30 mx-auto max-w-lg px-2">
        <div className="rounded-t-3xl border-2 border-[#111111] bg-white p-3 shadow-2xl">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-body font-extrabold text-[#111111]">
              {lanDangSua
                ? `Sửa bao #${lanDangSua.thuTu}`
                : `Ghi bao #${sapXep.length + 1}`}
            </span>

            <div className="flex items-center gap-2">
              {lanDangSua && (
                <button
                  type="button"
                  onClick={() => setChoXacNhanXoa(lanDangSua)}
                  className="inline-flex min-h-[64px] items-center gap-1.5 rounded-xl border-2 border-[#C62828] bg-white px-3 text-body font-extrabold text-[#C62828]"
                >
                  <Trash2 className="h-5 w-5" />
                  <span>Xóa lần cân này</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setMoBanPhim((v) => !v)}
                className="inline-flex min-h-[64px] items-center gap-1.5 rounded-xl border-2 border-[#111111] bg-[#f5f5f5] px-3 text-body font-extrabold text-[#111111]"
              >
                {moBanPhim ? (
                  <>
                    <ChevronDown className="h-6 w-6" />
                    <span>Thu gọn</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="h-6 w-6" />
                    <span>Mở phím</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {moBanPhim && (
            <>
              <div className="mb-2 flex min-h-[64px] items-center justify-between rounded-2xl border-2 border-[#111111] bg-[#f5f5f5] px-4">
                <span className="text-body font-bold text-[#111111]">Số ký:</span>
                <span className="text-metric font-extrabold text-[#1B5E20]">
                  {chuoiNhap || '0'} kg
                </span>
              </div>

              {loiNhap && (
                <p className="mb-2 text-body font-bold text-[#C62828]">{loiNhap}</p>
              )}

              <NumberPad
                onDigit={(d) => {
                  setLoiNhap('');
                  setChuoiNhap((prev) => (prev.length >= 6 ? prev : prev + d));
                }}
                onComma={() => {
                  setLoiNhap('');
                  setChuoiNhap((prev) => {
                    if (prev.includes(',')) return prev;
                    return prev ? `${prev},` : '0,';
                  });
                }}
                onBackspace={() => {
                  setLoiNhap('');
                  setChuoiNhap((prev) => prev.slice(0, -1));
                }}
                onSubmit={() => void handleBamGhi()}
                submitLabel={lanDangSua ? 'LƯU' : 'GHI'}
              />
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={choXacNhanSoLon !== null}
        title="Số này đúng không?"
        message={`Anh vừa nhập ${choXacNhanSoLon ? dinhDangSo(choXacNhanSoLon, 2) : ''} kg cho 1 bao (lớn hơn 100 kg). Số này đúng không?`}
        confirmLabel="Đúng, ghi số này"
        cancelLabel="Không, nhập lại"
        onConfirm={() => {
          const val = choXacNhanSoLon;
          setChoXacNhanSoLon(null);
          if (val !== null) void thucHienGhi(val);
        }}
        onCancel={() => setChoXacNhanSoLon(null)}
      />

      <ConfirmDialog
        open={choXacNhanXoa !== null}
        title="Xóa lần cân này?"
        message={
          choXacNhanXoa
            ? `Anh có chắc muốn xóa bao #${choXacNhanXoa.thuTu} (${dinhDangSo(choXacNhanXoa.soKy, 2)} kg) không?`
            : ''
        }
        confirmLabel="Xóa lần cân này"
        danger
        onConfirm={() => {
          const target = choXacNhanXoa;
          setChoXacNhanXoa(null);
          if (target) {
            setDangSuaLanId(null);
            setChuoiNhap('');
            void onXoaLanCan(target);
          }
        }}
        onCancel={() => setChoXacNhanXoa(null)}
      />
    </div>
  );
};

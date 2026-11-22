import React, { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import type { PhieuCan } from '../../types';
import { BigButton } from '../ui/BigButton';
import { BigInput } from '../ui/BigInput';

interface CreateTicketScreenProps {
  danhSachPhieuCu: PhieuCan[];
  onTaoPhieu: (duLieu: Omit<PhieuCan, 'id' | 'ngayTao' | 'ngayCapNhat'>) => void;
}

export const CreateTicketScreen: React.FC<CreateTicketScreenProps> = ({
  danhSachPhieuCu,
  onTaoPhieu,
}) => {
  const [tenKhach, setTenKhach] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [giongLua, setGiongLua] = useState('');
  const [vuMua, setVuMua] = useState('Đông Xuân 2026');
  const [donGia, setDonGia] = useState('');
  const [truBiMoiBao, setTruBiMoiBao] = useState('0.2');
  const [truHaoPhanTram, setTruHaoPhanTram] = useState('0');
  const [loiTen, setLoiTen] = useState('');
  const [loiGia, setLoiGia] = useState('');

  const khachCu = useMemo(() => {
    const map = new Map<string, PhieuCan>();
    for (const p of danhSachPhieuCu) {
      if (p.tenKhach && !map.has(p.tenKhach)) {
        map.set(p.tenKhach, p);
      }
    }
    return Array.from(map.values()).slice(0, 6);
  }, [danhSachPhieuCu]);

  const chonKhachCu = (p: PhieuCan) => {
    setTenKhach(p.tenKhach);
    setSoDienThoai(p.soDienThoai || '');
    if (p.giongLua) setGiongLua(p.giongLua);
    setLoiTen('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hopLe = true;

    if (!tenKhach.trim()) {
      setLoiTen('Vui lòng nhập tên chủ ruộng');
      hopLe = false;
    } else {
      setLoiTen('');
    }

    const giaSo = Number(donGia.replace(/,/g, '.'));
    if (!Number.isFinite(giaSo) || giaSo <= 0) {
      setLoiGia('Vui lòng nhập đơn giá lớn hơn 0');
      hopLe = false;
    } else {
      setLoiGia('');
    }

    if (!hopLe) return;

    const truBi = Math.max(0, Number(truBiMoiBao.replace(/,/g, '.')) || 0);
    const truHao = Math.max(0, Number(truHaoPhanTram.replace(/,/g, '.')) || 0);

    onTaoPhieu({
      tenKhach: tenKhach.trim(),
      soDienThoai: soDienThoai.trim(),
      giongLua: giongLua.trim(),
      vuMua: vuMua.trim() || 'Vụ khác',
      donGia: Math.round(giaSo),
      truBiMoiBao: truBi,
      truHaoPhanTram: truHao,
      daUng: 0,
      trangThai: 'dang_can',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-28">
      {khachCu.length > 0 && (
        <div className="space-y-2">
          <p className="text-body font-bold text-[#111111]">Chọn nhanh khách cũ:</p>
          <div className="flex flex-wrap gap-3">
            {khachCu.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => chonKhachCu(p)}
                className="min-h-[64px] rounded-2xl border-2 border-[#111111] bg-white px-4 py-2 text-body font-extrabold text-[#111111] active:bg-[#e8f5e9]"
              >
                {p.tenKhach}
              </button>
            ))}
          </div>
        </div>
      )}

      <BigInput
        label="Tên chủ ruộng"
        requiredMark
        placeholder="VD: Chú Ba Hùng"
        value={tenKhach}
        onChange={(e) => {
          setTenKhach(e.target.value);
          if (loiTen) setLoiTen('');
        }}
        error={loiTen}
      />

      <BigInput
        label="Đơn giá (đ/kg)"
        requiredMark
        type="number"
        inputMode="numeric"
        placeholder="VD: 7200"
        value={donGia}
        onChange={(e) => {
          setDonGia(e.target.value);
          if (loiGia) setLoiGia('');
        }}
        error={loiGia}
      />

      <BigInput
        label="Số điện thoại"
        type="tel"
        inputMode="tel"
        placeholder="VD: 0918 234 567"
        value={soDienThoai}
        onChange={(e) => setSoDienThoai(e.target.value)}
      />

      <BigInput
        label="Giống lúa"
        placeholder="VD: OM18, Đài Thơm 8, ST25"
        value={giongLua}
        onChange={(e) => setGiongLua(e.target.value)}
      />

      <BigInput
        label="Vụ mùa"
        placeholder="VD: Đông Xuân 2026"
        value={vuMua}
        onChange={(e) => setVuMua(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-3">
        <BigInput
          label="Trừ bì / bao (kg)"
          type="text"
          inputMode="decimal"
          value={truBiMoiBao}
          onChange={(e) => setTruBiMoiBao(e.target.value)}
        />
        <BigInput
          label="Trừ hao (%)"
          type="text"
          inputMode="decimal"
          value={truHaoPhanTram}
          onChange={(e) => setTruHaoPhanTram(e.target.value)}
        />
      </div>

      <div className="pt-2">
        <BigButton type="submit" icon={<Check className="h-7 w-7" />}>
          Bắt đầu cân
        </BigButton>
      </div>
    </form>
  );
};

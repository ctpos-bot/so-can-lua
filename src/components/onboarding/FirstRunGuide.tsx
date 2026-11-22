import React, { useState } from 'react';
import { BigButton } from '../ui/BigButton';

interface FirstRunGuideProps {
  open: boolean;
  onFinish: () => void;
}

const BUOC_HUONG_DAN = [
  {
    tieuDe: 'Bước 1: Tạo phiếu cân',
    noiDung:
      'Bấm nút "+ CÂN MỚI" màu xanh lớn, nhập tên chủ ruộng và giá lúa rồi bấm Bắt đầu cân.',
  },
  {
    tieuDe: 'Bước 2: Ghi từng bao',
    noiDung:
      'Bấm số ký trên bàn phím to của app rồi bấm "GHI". Số tự cộng dồn và tự lưu ngay.',
  },
  {
    tieuDe: 'Bước 3: Xem tiền & Gửi Zalo',
    noiDung:
      'Cân xong bấm Tổng kết để xem tiền phải trả, rồi bấm "Gửi Zalo" cho chủ ruộng.',
  },
];

export const FirstRunGuide: React.FC<FirstRunGuideProps> = ({
  open,
  onFinish,
}) => {
  const [buoc, setBuoc] = useState(0);
  if (!open) return null;

  const item = BUOC_HUONG_DAN[buoc];
  const laBuocCuoi = buoc === BUOC_HUONG_DAN.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md space-y-5 rounded-3xl border-2 border-[#111111] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-xl bg-[#F9A825] px-3 py-1 text-[20px] font-extrabold text-[#111111]">
            Hướng dẫn {buoc + 1}/3
          </span>
          <button
            type="button"
            onClick={onFinish}
            className="min-h-[64px] rounded-xl border-2 border-[#111111] bg-white px-4 text-[20px] font-extrabold text-[#111111]"
          >
            Bỏ qua
          </button>
        </div>

        <h2 className="text-title font-extrabold text-[#1B5E20]">
          {item.tieuDe}
        </h2>
        <p className="text-body font-semibold text-[#111111]">{item.noiDung}</p>

        <div className="pt-2">
          {laBuocCuoi ? (
            <BigButton onClick={onFinish}>Bắt đầu dùng ngay</BigButton>
          ) : (
            <BigButton onClick={() => setBuoc((b) => b + 1)}>Tiếp theo</BigButton>
          )}
        </div>
      </div>
    </div>
  );
};

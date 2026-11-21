import type { RecordSummary, WeighingRecord } from '../types/weighing';
import {
  COLS_PER_TABLE,
  ROWS_PER_TABLE,
  calcTableColumnTotals,
  formatCurrency,
  formatDateVN,
  formatWeight,
} from './calculations';

export async function generateReceiptImageBlob(
  record: WeighingRecord,
  summary: RecordSummary
): Promise<Blob> {
  const width = 900;
  const padding = 36;
  const tableHeight = 320;
  const headerHeight = 255;
  const summaryHeight = 270;
  const height =
    headerHeight + record.tables.length * (tableHeight + 24) + summaryHeight + 60;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Không tạo được ảnh phiếu cân.');

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Top banner
  ctx.fillStyle = '#047857';
  ctx.fillRect(0, 0, width, 96);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText('PHIẾU CÂN LÚA', padding, 52);

  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(record.code, width - padding, 50);
  ctx.textAlign = 'left';

  ctx.fillStyle = '#d1fae5';
  ctx.font = '18px sans-serif';
  ctx.fillText(
    `Ngày cân: ${formatDateVN(record.date)}${record.season ? `  •  Vụ: ${record.season}` : ''}`,
    padding,
    80
  );

  // Info block
  let y = 128;
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(`Khuông đất: ${record.plotName || 'Chưa ghi'}`, padding, y);

  y += 32;
  ctx.font = '20px sans-serif';
  ctx.fillStyle = '#334155';
  ctx.fillText(
    `Người cân: ${record.weigherName || '—'}    •    Chủ ruộng: ${record.farmerName || '—'}`,
    padding,
    y
  );

  y += 30;
  ctx.fillText(
    `Giống lúa: ${record.riceVariety || '—'}${record.areaCong ? `    •    Diện tích: ${record.areaCong} công` : ''}`,
    padding,
    y
  );

  y += 30;
  ctx.fillStyle = '#b45309';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(`Đơn giá: ${formatCurrency(record.pricePerKg)} / kg`, padding, y);

  y += 28;

  // Tables
  const tableWidth = width - padding * 2;
  const labelColW = 100;
  const dataColW = (tableWidth - labelColW) / COLS_PER_TABLE;
  const rowH = 42;

  for (const table of record.tables) {
    // Table title
    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(table.name, padding, y + 20);
    y += 30;

    // Header row
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(padding, y, tableWidth, rowH);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(padding, y, tableWidth, rowH * (ROWS_PER_TABLE + 2));

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Dòng', padding + labelColW / 2, y + 27);
    for (let c = 0; c < COLS_PER_TABLE; c++) {
      const cx = padding + labelColW + c * dataColW + dataColW / 2;
      ctx.fillText(`Cột ${c + 1}`, cx, y + 27);
    }

    // Data rows
    for (let r = 0; r < ROWS_PER_TABLE; r++) {
      const ry = y + (r + 1) * rowH;
      ctx.beginPath();
      ctx.moveTo(padding, ry);
      ctx.lineTo(padding + tableWidth, ry);
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(padding, ry, labelColW, rowH);

      ctx.fillStyle = '#475569';
      ctx.font = 'bold 17px sans-serif';
      ctx.fillText(`D${r + 1}`, padding + labelColW / 2, ry + 27);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 20px sans-serif';
      for (let c = 0; c < COLS_PER_TABLE; c++) {
        const val = table.cells[c]?.[r];
        const cx = padding + labelColW + c * dataColW + dataColW / 2;
        ctx.fillText(val ? formatWeight(val) : '—', cx, ry + 28);
      }
    }

    // Totals row
    const ty = y + (ROWS_PER_TABLE + 1) * rowH;
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(padding, ty, tableWidth, rowH);
    ctx.beginPath();
    ctx.moveTo(padding, ty);
    ctx.lineTo(padding + tableWidth, ty);
    ctx.stroke();

    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('Tổng', padding + labelColW / 2, ty + 27);

    const colTotals = calcTableColumnTotals(table);
    ctx.font = 'bold 20px sans-serif';
    for (let c = 0; c < COLS_PER_TABLE; c++) {
      const cx = padding + labelColW + c * dataColW + dataColW / 2;
      ctx.fillText(
        colTotals[c] > 0 ? formatWeight(colTotals[c]) : '0',
        cx,
        ty + 28
      );
    }

    // Vertical borders
    for (let c = 0; c <= COLS_PER_TABLE; c++) {
      const vx = padding + labelColW + c * dataColW;
      ctx.beginPath();
      ctx.moveTo(vx, y);
      ctx.lineTo(vx, y + rowH * (ROWS_PER_TABLE + 2));
      ctx.stroke();
    }

    y += rowH * (ROWS_PER_TABLE + 2) + 24;
  }

  // Summary box
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ecfdf5';
  ctx.fillRect(padding, y, tableWidth, 215);
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(padding, y, tableWidth, 215);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(`• Tổng số bao: ${summary.bagCount} bao`, padding + 20, y + 40);
  ctx.fillText(
    `• Tổng trọng lượng thô: ${formatWeight(summary.grossWeight)} kg`,
    padding + 20,
    y + 74
  );
  ctx.fillStyle = '#be123c';
  ctx.fillText(
    `• Trừ bao: -${formatWeight(summary.tareWeight)} kg`,
    padding + 20,
    y + 108
  );

  ctx.fillStyle = '#065f46';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(
    `• Số ký thực tính tiền: ${formatWeight(summary.netWeight)} kg`,
    padding + 20,
    y + 148
  );

  ctx.fillStyle = '#92400e';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText(
    `THÀNH TIỀN: ${formatCurrency(summary.totalAmount)}`,
    padding + 20,
    y + 190
  );

  if (record.deposit > 0) {
    ctx.textAlign = 'right';
    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(
      `Đã cọc: ${formatCurrency(record.deposit)} | Còn lại: ${formatCurrency(summary.remainingAmount)}`,
      width - padding - 20,
      y + 190
    );
    ctx.textAlign = 'left';
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Không xuất được ảnh PNG.'));
    }, 'image/png');
  });
}

export async function shareOrDownloadReceipt(
  record: WeighingRecord,
  summary: RecordSummary
): Promise<'shared' | 'downloaded'> {
  const blob = await generateReceiptImageBlob(record, summary);
  const fileName = `phieu-can-lua-${record.code}.png`;
  const file = new File([blob], fileName, { type: 'image/png' });

  if (
    typeof navigator !== 'undefined' &&
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    await navigator.share({
      title: `Phiếu cân lúa ${record.code}`,
      text: `${record.plotName || 'Phiếu cân lúa'} - ${formatWeight(summary.netWeight)} kg - ${formatCurrency(summary.totalAmount)}`,
      files: [file],
    });
    return 'shared';
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return 'downloaded';
}

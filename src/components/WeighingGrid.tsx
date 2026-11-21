import React, { useRef, useState } from 'react';
import { Plus, Trash2, Calculator, Delete, CornerDownLeft } from 'lucide-react';
import type { WeighingTable } from '../types/weighing';
import {
  COLS_PER_TABLE,
  ROWS_PER_TABLE,
  calcTableColumnTotals,
  calcTableTotal,
  formatWeight,
  parseWeightInput,
} from '../utils/calculations';

interface WeighingGridProps {
  tables: WeighingTable[];
  onChangeTables: (tables: WeighingTable[]) => void;
}

interface ActiveCell {
  tableIndex: number;
  col: number;
  row: number;
}

export const WeighingGrid: React.FC<WeighingGridProps> = ({
  tables,
  onChangeTables,
}) => {
  const [activeCell, setActiveCell] = useState<ActiveCell | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [useCustomNumpad, setUseCustomNumpad] = useState<boolean>(false);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const getCellKey = (tIdx: number, col: number, row: number) =>
    `${tIdx}-${col}-${row}`;

  const commitCell = (tIdx: number, col: number, row: number, raw: string) => {
    const parsed = parseWeightInput(raw);
    const updated = tables.map((tbl, idx) => {
      if (idx !== tIdx) return tbl;
      const newCells = tbl.cells.map((c, cIdx) =>
        cIdx === col ? c.map((r, rIdx) => (rIdx === row ? parsed : r)) : c
      );
      return { ...tbl, cells: newCells };
    });
    onChangeTables(updated);
  };

  const focusCell = (tIdx: number, col: number, row: number) => {
    setActiveCell({ tableIndex: tIdx, col, row });
    const currentVal = tables[tIdx]?.cells[col]?.[row];
    setEditingText(
      currentVal !== null && currentVal !== undefined
        ? String(currentVal).replace('.', ',')
        : ''
    );
    if (!useCustomNumpad) {
      const el = inputRefs.current[getCellKey(tIdx, col, row)];
      if (el) {
        el.focus();
        el.select();
      }
    }
  };

  const moveToNextCell = (tIdx: number, col: number, row: number) => {
    let nextRow = row + 1;
    let nextCol = col;
    let nextTable = tIdx;

    if (nextRow >= ROWS_PER_TABLE) {
      nextRow = 0;
      nextCol += 1;
    }
    if (nextCol >= COLS_PER_TABLE) {
      nextCol = 0;
      nextTable += 1;
    }

    if (nextTable < tables.length) {
      focusCell(nextTable, nextCol, nextRow);
    } else {
      setActiveCell(null);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    tIdx: number,
    col: number,
    row: number
  ) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      commitCell(tIdx, col, row, editingText);
      moveToNextCell(tIdx, col, row);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      commitCell(tIdx, col, row, editingText);
      if (row + 1 < ROWS_PER_TABLE) focusCell(tIdx, col, row + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      commitCell(tIdx, col, row, editingText);
      if (row - 1 >= 0) focusCell(tIdx, col, row - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      commitCell(tIdx, col, row, editingText);
      if (col + 1 < COLS_PER_TABLE) focusCell(tIdx, col + 1, row);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      commitCell(tIdx, col, row, editingText);
      if (col - 1 >= 0) focusCell(tIdx, col - 1, row);
    }
  };

  const handleAddTable = () => {
    const newIndex = tables.length + 1;
    const newTable: WeighingTable = {
      id: `tbl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: `Bảng ${newIndex}`,
      cells: Array.from({ length: COLS_PER_TABLE }, () =>
        Array.from({ length: ROWS_PER_TABLE }, () => null)
      ),
    };
    const nextTables = [...tables, newTable];
    onChangeTables(nextTables);
    setTimeout(() => {
      setActiveCell({ tableIndex: nextTables.length - 1, col: 0, row: 0 });
      setEditingText('');
      if (!useCustomNumpad) {
        const el = inputRefs.current[getCellKey(nextTables.length - 1, 0, 0)];
        el?.focus();
      }
    }, 50);
  };

  const handleRemoveTable = (tIdx: number) => {
    if (tables.length <= 1) return;
    const next = tables
      .filter((_, idx) => idx !== tIdx)
      .map((tbl, idx) => ({ ...tbl, name: `Bảng ${idx + 1}` }));
    onChangeTables(next);
    setActiveCell(null);
  };

  const handleNumpadPress = (key: string) => {
    if (!activeCell) return;
    const { tableIndex, col, row } = activeCell;

    if (key === 'NEXT') {
      commitCell(tableIndex, col, row, editingText);
      moveToNextCell(tableIndex, col, row);
      return;
    }

    if (key === 'BACK') {
      const nextText = editingText.slice(0, -1);
      setEditingText(nextText);
      commitCell(tableIndex, col, row, nextText);
      return;
    }

    if (key === 'CLEAR') {
      setEditingText('');
      commitCell(tableIndex, col, row, '');
      return;
    }

    if (key === ',' && (editingText.includes(',') || editingText.includes('.'))) {
      return;
    }

    const nextText = editingText + key;
    setEditingText(nextText);
    commitCell(tableIndex, col, row, nextText);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900">
            Bảng ghi trọng lượng từng bao (kg)
          </h3>
          <p className="text-sm font-medium text-slate-600">
            Mỗi bảng 5 cột × 5 dòng (25 bao). Nhập nhanh 3 số tự chia 10 (VD: <strong>555 → 55,5</strong>; <strong>495 → 49,5</strong>).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setUseCustomNumpad((prev) => !prev)}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
            useCustomNumpad
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'border-2 border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Calculator className="h-4 w-4" />
          {useCustomNumpad ? 'Đang bật phím số nhanh' : 'Bật phím số nhanh'}
        </button>
      </div>

      {tables.map((table, tIdx) => {
        const colTotals = calcTableColumnTotals(table);
        const tableSummary = calcTableTotal(table);

        return (
          <div
            key={table.id}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-emerald-100/80 px-3.5 py-2.5">
              <div className="flex items-center gap-2.5">
                <span className="rounded-lg bg-emerald-800 px-2.5 py-1 text-sm font-extrabold text-white">
                  {table.name}
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  {tableSummary.bagCount} bao •{' '}
                  <strong className="text-base font-black text-emerald-900">
                    {formatWeight(tableSummary.grossWeight)} kg
                  </strong>
                </span>
              </div>
              {tables.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveTable(tIdx)}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
                  title="Xóa bảng này"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa bảng
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[340px] border-collapse text-center">
                <thead>
                  <tr className="bg-slate-200/70 text-xs sm:text-sm font-extrabold text-slate-800">
                    <th className="w-16 border-b border-r border-slate-300 py-2.5 px-1">
                      Dòng
                    </th>
                    {Array.from({ length: COLS_PER_TABLE }, (_, cIdx) => (
                      <th
                        key={cIdx}
                        className="border-b border-r border-slate-300 py-2.5 px-1 last:border-r-0"
                      >
                        Cột {cIdx + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: ROWS_PER_TABLE }, (_, rIdx) => (
                    <tr key={rIdx} className="border-b border-slate-200">
                      <td className="border-r border-slate-200 bg-slate-100 py-2 px-1 text-xs sm:text-sm font-bold text-slate-700">
                        D{rIdx + 1}
                      </td>
                      {Array.from({ length: COLS_PER_TABLE }, (_, cIdx) => {
                        const isActive =
                          activeCell?.tableIndex === tIdx &&
                          activeCell?.col === cIdx &&
                          activeCell?.row === rIdx;
                        const cellVal = table.cells[cIdx]?.[rIdx];
                        const displayVal = isActive
                          ? editingText
                          : cellVal !== null && cellVal !== undefined
                            ? String(cellVal).replace('.', ',')
                            : '';

                        return (
                          <td
                            key={cIdx}
                            className={`border-r border-slate-200 p-0 last:border-r-0 ${
                              isActive ? 'bg-amber-50 ring-2 ring-inset ring-emerald-700' : ''
                            }`}
                          >
                            {useCustomNumpad ? (
                              <button
                                type="button"
                                onClick={() => focusCell(tIdx, cIdx, rIdx)}
                                className={`h-13 w-full px-1 text-center text-base font-extrabold tabular-nums transition ${
                                  displayVal
                                    ? 'text-slate-950'
                                    : 'text-slate-300'
                                }`}
                              >
                                {displayVal || '—'}
                              </button>
                            ) : (
                              <input
                                ref={(el) => {
                                  inputRefs.current[getCellKey(tIdx, cIdx, rIdx)] = el;
                                }}
                                type="text"
                                inputMode="decimal"
                                value={displayVal}
                                placeholder="—"
                                onFocus={() => focusCell(tIdx, cIdx, rIdx)}
                                onChange={(e) => {
                                  setEditingText(e.target.value);
                                  commitCell(tIdx, cIdx, rIdx, e.target.value);
                                }}
                                onBlur={() => {
                                  commitCell(tIdx, cIdx, rIdx, editingText);
                                  setActiveCell((prev) =>
                                    prev &&
                                    prev.tableIndex === tIdx &&
                                    prev.col === cIdx &&
                                    prev.row === rIdx
                                      ? null
                                      : prev
                                  );
                                }}
                                onKeyDown={(e) => handleKeyDown(e, tIdx, cIdx, rIdx)}
                                className="h-13 w-full bg-transparent px-1 text-center text-base font-extrabold text-slate-950 tabular-nums placeholder:text-slate-300 focus:outline-none"
                              />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-amber-100 font-black text-emerald-950">
                    <td className="border-r border-slate-300 py-2.5 px-1 text-xs sm:text-sm font-extrabold text-slate-800">
                      Tổng
                    </td>
                    {colTotals.map((total, cIdx) => (
                      <td
                        key={cIdx}
                        className="border-r border-slate-300 py-2.5 px-1 text-base font-black tabular-nums last:border-r-0"
                      >
                        {total > 0 ? formatWeight(total) : '0'}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={handleAddTable}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-500 bg-emerald-50/70 py-4 text-base font-extrabold text-emerald-900 transition hover:bg-emerald-100/80 active:scale-[0.99]"
      >
        <Plus className="h-5 w-5" />
        Thêm bảng cân mới (25 bao tiếp theo)
      </button>

      {/* Bàn phím số nhanh tích hợp cho thao tác 1 tay ngoài đồng */}
      {useCustomNumpad && activeCell && (
        <div className="sticky bottom-18 z-30 rounded-2xl border-2 border-emerald-300 bg-white p-3.5 shadow-2xl">
          <div className="mb-2.5 flex items-center justify-between text-sm text-slate-700">
            <span>
              Đang nhập:{' '}
              <strong className="font-extrabold text-emerald-900">
                Bảng {activeCell.tableIndex + 1} • Cột {activeCell.col + 1} • Dòng{' '}
                {activeCell.row + 1}
              </strong>
            </span>
            <span className="rounded-lg bg-amber-100 px-2.5 py-1 font-mono text-base font-black text-amber-950">
              {editingText || '0'} kg
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {['7', '8', '9'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleNumpadPress(k)}
                className="h-14 rounded-xl bg-slate-100 text-xl font-black text-slate-900 active:bg-slate-300"
              >
                {k}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleNumpadPress('BACK')}
              className="flex h-14 items-center justify-center rounded-xl bg-rose-100 text-rose-800 active:bg-rose-200"
              title="Xóa 1 ký tự"
            >
              <Delete className="h-6 w-6" />
            </button>

            {['4', '5', '6'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleNumpadPress(k)}
                className="h-14 rounded-xl bg-slate-100 text-xl font-black text-slate-900 active:bg-slate-300"
              >
                {k}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleNumpadPress('CLEAR')}
              className="h-14 rounded-xl bg-amber-100 text-sm font-extrabold text-amber-900 active:bg-amber-200"
            >
              Xóa ô
            </button>

            {['1', '2', '3'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleNumpadPress(k)}
                className="h-14 rounded-xl bg-slate-100 text-xl font-black text-slate-900 active:bg-slate-300"
              >
                {k}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleNumpadPress('NEXT')}
              className="row-span-2 flex flex-col items-center justify-center gap-1 rounded-xl bg-emerald-700 text-base font-extrabold text-white shadow-sm active:bg-emerald-800"
            >
              <CornerDownLeft className="h-6 w-6" />
              Tiếp
            </button>

            <button
              type="button"
              onClick={() => handleNumpadPress('0')}
              className="col-span-2 h-14 rounded-xl bg-slate-100 text-xl font-black text-slate-900 active:bg-slate-300"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => handleNumpadPress(',')}
              className="h-14 rounded-xl bg-slate-100 text-2xl font-black text-slate-900 active:bg-slate-300"
            >
              ,
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

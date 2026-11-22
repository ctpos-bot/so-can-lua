import { toBlob, toPng } from 'html-to-image';

export async function luuAnhPhieu(
  element: HTMLElement,
  tenFile: string
): Promise<void> {
  const dataUrl = await toPng(element, {
    backgroundColor: '#ffffff',
    pixelRatio: 2,
  });
  const link = document.createElement('a');
  link.download = tenFile;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function guiZaloPhieu(
  element: HTMLElement,
  tenFile: string,
  tieuDe: string,
  noiDung: string
): Promise<'shared' | 'downloaded'> {
  const blob = await toBlob(element, {
    backgroundColor: '#ffffff',
    pixelRatio: 2,
  });
  if (!blob) {
    throw new Error('Không tạo được ảnh phiếu');
  }

  const file = new File([blob], tenFile, { type: 'image/png' });
  if (
    typeof navigator !== 'undefined' &&
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    await navigator.share({
      title: tieuDe,
      text: noiDung,
      files: [file],
    });
    return 'shared';
  }

  await luuAnhPhieu(element, tenFile);
  return 'downloaded';
}

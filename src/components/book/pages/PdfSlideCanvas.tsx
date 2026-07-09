import { useEffect, useRef, useState } from 'react';
import { useBookPageSize } from '../../../context/BookPageSizeContext';
import { usePdf, useRenderScale } from '../../../pdf/PdfContext';
import './pages.css';

interface Props {
  pageNumber: number;
  active?: boolean;
  className?: string;
  visible?: boolean;
}

/**
 * Векторный слайд из PDF. Размер берётся из контекста страницы книги
 * (не из ResizeObserver — на мобильных внутри flipbook он давал 0×0).
 */
export default function PdfSlideCanvas({
  pageNumber,
  active = true,
  className = '',
  visible = true,
}: Props) {
  const { doc, error } = usePdf();
  const { width, height } = useBookPageSize();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelScale = useRenderScale(width);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!doc || width < 2 || height < 2) return;
    let cancelled = false;

    async function draw() {
      setBusy(true);
      try {
        const page = await doc!.getPage(pageNumber);
        if (cancelled) return;

        const base = page.getViewport({ scale: 1 });
        const fit = Math.min(width / base.width, height / base.height);
        const viewport = page.getViewport({ scale: fit * pixelScale });

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({ canvasContext: ctx, viewport }).promise;

        if (!cancelled) setBusy(false);
      } catch (e) {
        console.error('PDF page render failed', pageNumber, e);
        if (!cancelled) setBusy(false);
      }
    }

    void draw();
    return () => {
      cancelled = true;
    };
  }, [doc, pageNumber, width, height, pixelScale]);

  return (
    <div
      className={`pdf-slide ${className} ${active ? 'is-active' : ''} ${visible ? '' : 'is-hidden'}`}
    >
      {error && <div className="pdf-slide__error">Не удалось загрузить презентацию</div>}
      <canvas
        ref={canvasRef}
        className="pdf-slide__canvas"
        style={{ opacity: busy ? 0.35 : 1 }}
      />
      {busy && !error && <div className="pdf-slide__loader" aria-hidden />}
    </div>
  );
}

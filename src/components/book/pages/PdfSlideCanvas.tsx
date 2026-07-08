import { useEffect, useRef, useState } from 'react';
import { usePdf, useRenderScale } from '../../../pdf/PdfContext';
import './pages.css';

interface Props {
  /** Номер страницы PDF / слайда 1..16 */
  pageNumber: number;
  active?: boolean;
  className?: string;
  /**
   * Если задан — рендерим с opacity (для анимации).
   * По умолчанию всегда виден, когда есть canvas.
   */
  visible?: boolean;
}

/**
 * Векторный слайд из PDF презентации.
 * PDF.js растеризует страницу на canvas с учётом devicePixelRatio и zoom —
 * при увеличении страницы перерисовывается в большем разрешении, текст остаётся чётким.
 */
export default function PdfSlideCanvas({
  pageNumber,
  active = true,
  className = '',
  visible = true,
}: Props) {
  const { doc, error } = usePdf();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cssSize, setCssSize] = useState({ w: 0, h: 0 });
  const pixelScale = useRenderScale(cssSize.w);
  const [busy, setBusy] = useState(true);

  // Следим за CSS-размером контейнера (книга меняет размер при resize).
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const measure = () => {
      const r = el.getBoundingClientRect();
      setCssSize({
        w: Math.max(1, Math.floor(r.width)),
        h: Math.max(1, Math.floor(r.height)),
      });
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!doc || !cssSize.w || !cssSize.h) return;
    let cancelled = false;

    async function draw() {
      setBusy(true);
      try {
        const page = await doc!.getPage(pageNumber);
        if (cancelled) return;

        const base = page.getViewport({ scale: 1 });
        // Вписываем страницу в CSS-размер страницы книги
        const fit = Math.min(cssSize.w / base.width, cssSize.h / base.height);
        const viewport = page.getViewport({ scale: fit * pixelScale });

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        // CSS-размер = отображаемый размер (логический)
        canvas.style.width = `${Math.floor(base.width * fit)}px`;
        canvas.style.height = `${Math.floor(base.height * fit)}px`;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: ctx,
          viewport,
        }).promise;

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
  }, [doc, pageNumber, cssSize.w, cssSize.h, pixelScale]);

  return (
    <div
      ref={wrapRef}
      className={`pdf-slide ${className} ${active ? 'is-active' : ''} ${visible ? '' : 'is-hidden'}`}
    >
      {error && <div className="pdf-slide__error">Не удалось загрузить презентацию</div>}
      <canvas
        ref={canvasRef}
        className="pdf-slide__canvas"
        style={{ opacity: busy ? 0.3 : 1 }}
      />
      {busy && !error && <div className="pdf-slide__loader" aria-hidden />}
    </div>
  );
}

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist';
// Worker как URL — Vite отдаёт его отдельным файлом.
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorker;

const PDF_URL = '/booklet-slides.pdf';

interface PdfCtx {
  doc: PDFDocumentProxy | null;
  ready: boolean;
  error: string | null;
}

const PdfContext = createContext<PdfCtx>({ doc: null, ready: false, error: null });

export function PdfProvider({ children }: { children: ReactNode }) {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const task = getDocument({
      url: PDF_URL,
      // векторные шрифты / формы сохраняются в PDF из PowerPoint
      disableFontFace: false,
    });

    task.promise
      .then((pdf) => {
        if (cancelled) {
          void pdf.destroy();
          return;
        }
        setDoc(pdf);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'PDF load failed');
      });

    return () => {
      cancelled = true;
      void task.destroy();
    };
  }, []);

  const value = useMemo(
    () => ({ doc, ready: !!doc, error }),
    [doc, error],
  );

  return <PdfContext.Provider value={value}>{children}</PdfContext.Provider>;
}

export function usePdf() {
  return useContext(PdfContext);
}

/** Текущий масштаб браузера × плотность пикселей — для чёткого canvas. */
export function useRenderScale(cssWidth: number) {
  const [scale, setScale] = useState(window.devicePixelRatio || 1);

  useEffect(() => {
    const update = () => {
      const dpr = window.devicePixelRatio || 1;
      // visualViewport.scale растёт при Ctrl+/pinch-zoom в Chrome
      const vz = window.visualViewport?.scale ?? 1;
      // запас 1.25× — текст остаётся острым чуть выше «достаточного» уровня
      setScale(Math.min(4, Math.max(1, dpr * vz * 1.25)));
    };
    update();
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);
    window.visualViewport?.addEventListener('scroll', update);
    return () => {
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('scroll', update);
    };
  }, [cssWidth]);

  return scale;
}

export { PDF_URL };

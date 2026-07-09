import { useEffect, useMemo, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  getBookletUrl,
  getSiteBase,
  isLocalHost,
  saveSiteBase,
} from '../utils/siteUrl';
import './QrPage.css';

/** Скачать SVG QR как PNG для печати на буклете. */
async function downloadQrPng(svgEl: SVGElement, filename = 'qr-booklet.png') {
  const xml = new XMLSerializer().serializeToString(svgEl);
  const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  const size = 1024;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(img, 0, 0, size, size);
  URL.revokeObjectURL(url);

  canvas.toBlob((png) => {
    if (!png) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(png);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }, 'image/png');
}

/**
 * Страница для печати QR на бумажный буклет.
 * Сканирование → открывается главная страница с буклетом.
 */
export default function QrPage() {
  const [base, setBase] = useState(getSiteBase);
  const frameRef = useRef<HTMLDivElement>(null);
  const bookletUrl = useMemo(() => getBookletUrl(base), [base]);
  const needsUrl = isLocalHost(base);

  useEffect(() => {
    saveSiteBase(base);
  }, [base]);

  return (
    <div className="qr-page">
      <main className="qr-page__card">
        <p className="qr-page__label">АО «ВНИИЖТ»</p>
        <h1 className="qr-page__title">QR-код на буклет</h1>
        <p className="qr-page__hint">
          Отсканируйте камерой телефона — откроется буклет, страницы листаются
          свайпом.
        </p>

        <div className="qr-page__frame" ref={frameRef}>
          <QRCodeSVG
            value={bookletUrl}
            size={280}
            level="M"
            bgColor="#ffffff"
            fgColor="#0b1f3a"
            marginSize={2}
          />
        </div>

        <p className="qr-page__url">{bookletUrl}</p>

        {needsUrl && (
          <p className="qr-page__warn">
            Укажите адрес опубликованного сайта — иначе с телефона не откроется.
          </p>
        )}

        <label className="qr-page__field">
          <span>Адрес сайта (после публикации)</span>
          <input
            value={base}
            onChange={(e) => setBase(e.target.value)}
            placeholder="https://ваш-сайт.ru"
            spellCheck={false}
          />
        </label>

        <div className="qr-page__actions">
          <button
            type="button"
            className="qr-page__btn qr-page__btn--primary"
            onClick={() => {
              const svg = frameRef.current?.querySelector('svg');
              if (svg) void downloadQrPng(svg);
            }}
          >
            Скачать QR для печати
          </button>
          <a className="qr-page__btn" href="/">
            Открыть буклет
          </a>
        </div>
      </main>
    </div>
  );
}

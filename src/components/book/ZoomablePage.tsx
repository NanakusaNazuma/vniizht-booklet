import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import './ZoomablePage.css';

interface Props {
  children: ReactNode;
  /** Сбросить зум при смене страницы */
  resetKey: number;
  enabled?: boolean;
}

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const STEP = 0.35;

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/**
 * Pinch-to-zoom и кнопки +/− для чтения мелкого текста на телефоне.
 */
export default function ZoomablePage({ children, resetKey, enabled = true }: Props) {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);
  const panRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);

  useEffect(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, [resetKey]);

  const zoomBy = useCallback((delta: number) => {
    setScale((s) => clamp(Number((s + delta).toFixed(2)), MIN_SCALE, MAX_SCALE));
    if (scale + delta <= 1) setPan({ x: 0, y: 0 });
  }, [scale]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (!enabled) return;
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current = { dist: Math.hypot(dx, dy), scale };
      panRef.current = null;
    } else if (e.touches.length === 1 && scale > 1) {
      panRef.current = {
        x: pan.x,
        y: pan.y,
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
      };
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!enabled) return;
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const next = clamp(
        pinchRef.current.scale * (dist / pinchRef.current.dist),
        MIN_SCALE,
        MAX_SCALE,
      );
      setScale(next);
      if (next <= 1) setPan({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && panRef.current && scale > 1) {
      e.preventDefault();
      const dx = e.touches[0].clientX - panRef.current.startX;
      const dy = e.touches[0].clientY - panRef.current.startY;
      setPan({
        x: panRef.current.x + dx,
        y: panRef.current.y + dy,
      });
    }
  };

  const onTouchEnd = () => {
    pinchRef.current = null;
    panRef.current = null;
  };

  const onDoubleClick = () => {
    if (!enabled) return;
    if (scale > 1) {
      setScale(1);
      setPan({ x: 0, y: 0 });
    } else {
      setScale(2);
    }
  };

  return (
    <div
      className="zoom-page"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      onDoubleClick={onDoubleClick}
    >
      <div
        className="zoom-page__inner"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
        }}
      >
        {children}
      </div>

      {enabled && (
        <div className="zoom-page__controls" onTouchStart={(e) => e.stopPropagation()}>
          <button type="button" aria-label="Уменьшить" onClick={() => zoomBy(-STEP)}>
            −
          </button>
          <span>{Math.round(scale * 100)}%</span>
          <button type="button" aria-label="Увеличить" onClick={() => zoomBy(STEP)}>
            +
          </button>
        </div>
      )}
    </div>
  );
}

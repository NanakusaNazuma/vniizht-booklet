import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useBookInteraction } from '../../context/BookInteractionContext';
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
const ZOOMED_THRESHOLD = 1.04;

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/**
 * Pinch-to-zoom и кнопки +/−. При зуме блокирует перелистывание flipbook.
 */
export default function ZoomablePage({ children, resetKey, enabled = true }: Props) {
  const { setPageZoomed, setPinching } = useBookInteraction();
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(1);
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);
  const panRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null);

  useEffect(() => {
    scaleRef.current = scale;
    setPageZoomed(enabled && scale > ZOOMED_THRESHOLD);
  }, [scale, enabled, setPageZoomed]);

  useEffect(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
    setPinching(false);
  }, [resetKey, setPinching]);

  useEffect(() => {
    if (!enabled) {
      setPageZoomed(false);
      setPinching(false);
    }
  }, [enabled, setPageZoomed, setPinching]);

  // Перехват щипка до react-pageflip (capture), иначе срабатывает перелистывание.
  useEffect(() => {
    if (!enabled) return;
    const el = rootRef.current;
    if (!el) return;

    const stopFlip = (e: TouchEvent) => {
      if (e.touches.length >= 2 || scaleRef.current > ZOOMED_THRESHOLD) {
        e.stopPropagation();
      }
    };

    el.addEventListener('touchstart', stopFlip, { capture: true });
    el.addEventListener('touchmove', stopFlip, { capture: true });
    return () => {
      el.removeEventListener('touchstart', stopFlip, { capture: true });
      el.removeEventListener('touchmove', stopFlip, { capture: true });
    };
  }, [enabled]);

  const zoomBy = useCallback((delta: number) => {
    setScale((s) => {
      const next = clamp(Number((s + delta).toFixed(2)), MIN_SCALE, MAX_SCALE);
      if (next <= 1) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    if (!enabled) return;
    if (e.touches.length === 2) {
      e.stopPropagation();
      setPinching(true);
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current = { dist: Math.hypot(dx, dy), scale: scaleRef.current };
      panRef.current = null;
    } else if (e.touches.length === 1 && scaleRef.current > ZOOMED_THRESHOLD) {
      e.stopPropagation();
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
      e.stopPropagation();
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
    } else if (e.touches.length === 1 && panRef.current && scaleRef.current > ZOOMED_THRESHOLD) {
      e.preventDefault();
      e.stopPropagation();
      const dx = e.touches[0].clientX - panRef.current.startX;
      const dy = e.touches[0].clientY - panRef.current.startY;
      setPan({
        x: panRef.current.x + dx,
        y: panRef.current.y + dy,
      });
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      setPinching(false);
      pinchRef.current = null;
    }
    if (e.touches.length === 0) {
      panRef.current = null;
    }
  };

  const onDoubleClick = () => {
    if (!enabled) return;
    if (scale > ZOOMED_THRESHOLD) {
      setScale(1);
      setPan({ x: 0, y: 0 });
    } else {
      setScale(2);
    }
  };

  return (
    <div
      ref={rootRef}
      className={`zoom-page${scale > ZOOMED_THRESHOLD ? ' zoom-page--zoomed' : ''}`}
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
        <div
          className="zoom-page__controls"
          onTouchStart={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
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

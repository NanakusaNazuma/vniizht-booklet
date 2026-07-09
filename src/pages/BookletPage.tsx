import { useCallback, useLayoutEffect, useRef, useState } from 'react';
// @ts-ignore — типы default-экспорта react-pageflip неполные
import HTMLFlipBook from 'react-pageflip';
import Page from '../components/book/Page';
import LetterPage from '../components/book/pages/LetterPage';
import SlidePage from '../components/book/pages/SlidePage';
import { BookInteractionProvider, useBookInteraction } from '../context/BookInteractionContext';
import { BookPageSizeProvider } from '../context/BookPageSizeContext';
import { SLIDE_RATIO, TOTAL_SLIDES } from '../data/slides';
import { useSlidePreload } from '../hooks/useSlidePreload';
import './BookletPage.css';

function useIsNarrow(breakpoint = 640) {
  const [narrow, setNarrow] = useState(
    () => (typeof window !== 'undefined' ? window.innerWidth <= breakpoint : false),
  );

  useLayoutEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [breakpoint]);

  return narrow;
}

function BookletView() {
  const bookRef = useRef<any>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [dims, setDims] = useState({ w: 450, h: 636 });
  const [fullscreen, setFullscreen] = useState(false);
  const isMobile = useIsNarrow(640);
  const { flipLocked } = useBookInteraction();
  useSlidePreload(current);

  const zoomEnabled = isMobile || fullscreen;

  useLayoutEffect(() => {
    function calc() {
      const stage = stageRef.current;
      if (!stage) return;
      const narrow = window.innerWidth <= 640;
      const short = window.innerHeight <= 520;
      const fs = !!document.fullscreenElement;

      const vw = window.visualViewport?.width ?? window.innerWidth;
      const vh = window.visualViewport?.height ?? window.innerHeight;

      let reservedForNav: number;
      let reservedVertical: number;

      if (fs) {
        reservedForNav = narrow ? 8 : short ? 100 : 168;
        reservedVertical = narrow ? 52 : 72;
      } else {
        reservedForNav = narrow ? 88 : short ? 100 : 168;
        reservedVertical = narrow ? 64 : 88;
      }

      const stageW = fs ? vw : stage.clientWidth;
      const stageH = fs ? vh : stage.clientHeight;

      const availW = Math.max(200, stageW - reservedForNav);
      const availH = Math.max(280, stageH - reservedVertical);

      let h = availH;
      let w = h * SLIDE_RATIO;
      if (w > availW) {
        w = availW;
        h = w / SLIDE_RATIO;
      }

      setDims({ w: Math.floor(w), h: Math.floor(h) });
    }

    calc();
    window.addEventListener('resize', calc);
    window.addEventListener('orientationchange', calc);
    window.visualViewport?.addEventListener('resize', calc);
    document.addEventListener('fullscreenchange', calc);
    return () => {
      window.removeEventListener('resize', calc);
      window.removeEventListener('orientationchange', calc);
      window.visualViewport?.removeEventListener('resize', calc);
      document.removeEventListener('fullscreenchange', calc);
    };
  }, [fullscreen]);

  useLayoutEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const onFlip = useCallback((e: { data: number }) => {
    setCurrent(e.data);
  }, []);

  const flipPrev = () => bookRef.current?.pageFlip()?.flipPrev();
  const flipNext = () => bookRef.current?.pageFlip()?.flipNext();

  const toggleFullscreen = async () => {
    const el = rootRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      /* браузер мог отклонить без жеста пользователя */
    }
  };

  const restSlides = Array.from({ length: TOTAL_SLIDES - 2 }, (_, i) => i + 3);

  return (
    <div
      ref={rootRef}
      className={`booklet${fullscreen ? ' booklet--fullscreen' : ''}${flipLocked ? ' booklet--zoomed' : ''}`}
    >
      {!isMobile && !fullscreen && (
        <header className="booklet__bar">
          <div className="booklet__brand">АО «ВНИИЖТ»</div>
          <button
            type="button"
            className="booklet__fs-btn"
            onClick={() => void toggleFullscreen()}
            aria-label="На весь экран"
            title="На весь экран"
          >
            ⛶
          </button>
        </header>
      )}

      <div className="booklet__stage" ref={stageRef}>
        <button
          className="booklet__nav booklet__nav--prev"
          onClick={flipPrev}
          disabled={current === 0 || flipLocked}
          aria-label="Предыдущая страница"
        >
          ‹
        </button>

        <BookPageSizeProvider width={dims.w} height={dims.h}>
          <div className="booklet__book-wrap" style={{ width: dims.w, height: dims.h }}>
            <HTMLFlipBook
              key={`${dims.w}x${dims.h}`}
              ref={bookRef}
              className="flipbook"
              style={{}}
              width={dims.w}
              height={dims.h}
              size="fixed"
              minWidth={dims.w}
              maxWidth={dims.w}
              minHeight={dims.h}
              maxHeight={dims.h}
              drawShadow={!isMobile}
              flippingTime={isMobile ? 600 : 800}
              maxShadowOpacity={0.45}
              showCover={false}
              usePortrait
              startPage={current}
              startZIndex={0}
              autoSize={false}
              mobileScrollSupport={!flipLocked}
              clickEventForward
              useMouseEvents={!flipLocked}
              swipeDistance={flipLocked ? 9999 : 30}
              showPageCorners={!flipLocked}
              disableFlipByClick={isMobile || flipLocked}
              onFlip={onFlip}
            >
              <Page>
                <SlidePage
                  slide={1}
                  active={current === 0}
                  zoomKey={current}
                  zoomEnabled={zoomEnabled}
                />
              </Page>

              <Page>
                <LetterPage
                  active={current === 1}
                  zoomKey={current}
                  zoomEnabled={zoomEnabled}
                />
              </Page>

              {restSlides.map((slideNo, i) => {
                const index = i + 2;
                return (
                  <Page key={slideNo}>
                    <SlidePage
                      slide={slideNo}
                      active={current === index}
                      zoomKey={current}
                      zoomEnabled={zoomEnabled}
                    />
                  </Page>
                );
              })}
            </HTMLFlipBook>
          </div>
        </BookPageSizeProvider>

        <button
          className="booklet__nav booklet__nav--next"
          onClick={flipNext}
          disabled={current === TOTAL_SLIDES - 1 || flipLocked}
          aria-label="Следующая страница"
        >
          ›
        </button>
      </div>

      <footer className="booklet__footer">
        <div className="booklet__footer-row">
          <span className="booklet__counter">
            {current + 1} / {TOTAL_SLIDES}
          </span>
          <button
            type="button"
            className="booklet__fs-btn booklet__fs-btn--footer"
            onClick={() => void toggleFullscreen()}
            aria-label={fullscreen ? 'Выйти из полноэкранного режима' : 'На весь экран'}
          >
            {fullscreen ? '✕' : '⛶'}
            <span className="booklet__fs-label">
              {fullscreen ? 'Свернуть' : 'На весь экран'}
            </span>
          </button>
        </div>
        <span className="booklet__hint">
          {flipLocked
            ? 'Уменьшите масштаб (−), чтобы листать дальше'
            : fullscreen
              ? 'Свайп по краям — листать · +/− или щипок — увеличить'
              : isMobile
                ? 'Свайп — листать · ⛶ — на весь экран · +/− — увеличить'
                : 'Листайте стрелками или тяните угол страницы · ⛶ — на весь экран'}
        </span>
      </footer>
    </div>
  );
}

export default function BookletPage() {
  return (
    <BookInteractionProvider>
      <BookletView />
    </BookInteractionProvider>
  );
}

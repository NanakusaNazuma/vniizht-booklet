import { useCallback, useLayoutEffect, useRef, useState } from 'react';
// @ts-ignore — типы default-экспорта react-pageflip неполные
import HTMLFlipBook from 'react-pageflip';
import Page from '../components/book/Page';
import LetterPage from '../components/book/pages/LetterPage';
import SlidePage from '../components/book/pages/SlidePage';
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

export default function BookletPage() {
  const bookRef = useRef<any>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [dims, setDims] = useState({ w: 450, h: 636 });
  const isMobile = useIsNarrow(640);
  useSlidePreload(current);

  // Книга во весь экран с пропорцией слайда; на телефоне стрелки уже — больше места под контент.
  useLayoutEffect(() => {
    function calc() {
      const stage = stageRef.current;
      if (!stage) return;
      const narrow = window.innerWidth <= 640;
      const short = window.innerHeight <= 520;
      const reservedForNav = narrow ? 88 : short ? 100 : 168;
      const availW = Math.max(200, stage.clientWidth - reservedForNav);
      const availH = Math.max(280, stage.clientHeight - 8);

      let h = availH;
      let w = h * SLIDE_RATIO;
      if (w > availW) {
        w = availW;
        h = w / SLIDE_RATIO;
      }

      // Целые CSS-пиксели — меньше субпиксельного размытия
      setDims({ w: Math.floor(w), h: Math.floor(h) });
    }

    calc();
    window.addEventListener('resize', calc);
    window.addEventListener('orientationchange', calc);
    // visualViewport — корректнее на iOS при появлении/скрытии URL-бара
    window.visualViewport?.addEventListener('resize', calc);
    return () => {
      window.removeEventListener('resize', calc);
      window.removeEventListener('orientationchange', calc);
      window.visualViewport?.removeEventListener('resize', calc);
    };
  }, []);

  const onFlip = useCallback((e: { data: number }) => {
    setCurrent(e.data);
  }, []);

  const flipPrev = () => bookRef.current?.pageFlip()?.flipPrev();
  const flipNext = () => bookRef.current?.pageFlip()?.flipNext();

  const restSlides = Array.from({ length: TOTAL_SLIDES - 2 }, (_, i) => i + 3);

  return (
    <div className="booklet">
      {!isMobile && (
        <header className="booklet__bar">
          <div className="booklet__brand">АО «ВНИИЖТ»</div>
        </header>
      )}

      <div className="booklet__stage" ref={stageRef}>
        <button
          className="booklet__nav booklet__nav--prev"
          onClick={flipPrev}
          disabled={current === 0}
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
              mobileScrollSupport
              clickEventForward
              useMouseEvents
              swipeDistance={30}
              showPageCorners
              disableFlipByClick={false}
              onFlip={onFlip}
            >
              <Page>
                <SlidePage slide={1} active={current === 0} zoomKey={current} zoomEnabled={isMobile} />
              </Page>

              <Page>
                <LetterPage active={current === 1} zoomKey={current} zoomEnabled={isMobile} />
              </Page>

              {restSlides.map((slideNo, i) => {
                const index = i + 2;
                return (
                  <Page key={slideNo}>
                    <SlidePage
                      slide={slideNo}
                      active={current === index}
                      zoomKey={current}
                      zoomEnabled={isMobile}
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
          disabled={current === TOTAL_SLIDES - 1}
          aria-label="Следующая страница"
        >
          ›
        </button>
      </div>

      <footer className="booklet__footer">
        <span className="booklet__counter">
          {current + 1} / {TOTAL_SLIDES}
        </span>
        <span className="booklet__hint">
          {isMobile
            ? 'Свайп — листать · Щипок или +/− — увеличить'
            : 'Листайте стрелками, свайпом или тяните угол страницы'}
        </span>
      </footer>
    </div>
  );
}

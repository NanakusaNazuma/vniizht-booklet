import { useEffect, useState } from 'react';
import { motion, useAnimationControls, type Variants } from 'framer-motion';
import { PERSONA_PLACEMENT, PERSONA_SRC } from '../../../data/slides';
import ZoomablePage from '../ZoomablePage';
import PdfSlideCanvas from './PdfSlideCanvas';
import './pages.css';

interface Props {
  active: boolean;
  zoomKey: number;
  zoomEnabled?: boolean;
}

/**
 * Слайд 2: векторный PDF + хореография persona.
 *  1) человек проявляется на всю страницу;
 *  2) уменьшается до позиции из PPTX;
 *  3) проявляется слайд 2 (PDF, чёткий текст).
 */
const personVariants: Variants = {
  hidden: {
    opacity: 0,
    top: '0%',
    left: '0%',
    width: '100%',
    height: '100%',
  },
  full: {
    opacity: 1,
    top: '0%',
    left: '0%',
    width: '100%',
    height: '100%',
    transition: { duration: 1.15, ease: [0.22, 1, 0.36, 1] },
  },
  placed: {
    opacity: 1,
    ...PERSONA_PLACEMENT,
    transition: { duration: 1.05, ease: [0.65, 0, 0.35, 1] },
  },
};

export default function LetterPage({ active, zoomKey, zoomEnabled }: Props) {
  const personControls = useAnimationControls();
  const [showSlide, setShowSlide] = useState(false);
  const [settle, setSettle] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setShowSlide(false);
      setSettle(false);
      personControls.set('hidden');
      await personControls.start('full');
      if (cancelled) return;
      await personControls.start('placed');
      if (cancelled) return;
      setShowSlide(true);
      await new Promise((r) => setTimeout(r, 650));
      if (cancelled) return;
      setSettle(true);
    }

    if (active) {
      void run();
    } else {
      personControls.set('hidden');
      setShowSlide(false);
      setSettle(false);
    }

    return () => {
      cancelled = true;
    };
  }, [active, personControls]);

  return (
    <div className="letter letter--pptx">
      <ZoomablePage resetKey={zoomKey} enabled={zoomEnabled}>
        <motion.div
          className="letter__pdf"
          initial={{ opacity: 0 }}
          animate={{ opacity: showSlide ? 1 : 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <PdfSlideCanvas pageNumber={2} active={active} visible={showSlide} />
        </motion.div>
      </ZoomablePage>

      {!settle && (
        <motion.div
          className="letter__person"
          variants={personVariants}
          initial="hidden"
          animate={personControls}
        >
          <img
            className="person__img"
            src={PERSONA_SRC}
            alt="Persona"
            draggable={false}
            decoding="async"
            width={1600}
            height={2400}
          />
        </motion.div>
      )}
    </div>
  );
}

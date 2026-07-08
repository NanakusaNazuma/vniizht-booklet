import { motion } from 'framer-motion';
import PdfSlideCanvas from './PdfSlideCanvas';
import './pages.css';

interface Props {
  /** Номер слайда 1..16 */
  slide: number;
  active: boolean;
}

/**
 * Страница книги = слайд презентации, отрисованный из векторного PDF.
 * При зуме / смене DPR canvas перерисовывается — символы остаются чёткими.
 */
export default function SlidePage({ slide, active }: Props) {
  return (
    <div className="slide-page">
      <motion.div
        className="slide-page__motion"
        initial={{ opacity: 0 }}
        animate={{ opacity: active ? 1 : 0.55 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <PdfSlideCanvas pageNumber={slide} active={active} />
      </motion.div>
    </div>
  );
}

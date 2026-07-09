import { motion } from 'framer-motion';
import ZoomablePage from '../ZoomablePage';
import PdfSlideCanvas from './PdfSlideCanvas';
import './pages.css';

interface Props {
  slide: number;
  active: boolean;
  zoomKey: number;
  zoomEnabled?: boolean;
}

export default function SlidePage({ slide, active, zoomKey, zoomEnabled }: Props) {
  return (
    <div className="slide-page">
      <ZoomablePage resetKey={zoomKey} enabled={zoomEnabled}>
        <motion.div
          className="slide-page__motion"
          initial={{ opacity: 0 }}
          animate={{ opacity: active ? 1 : 0.55 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <PdfSlideCanvas pageNumber={slide} active={active} />
        </motion.div>
      </ZoomablePage>
    </div>
  );
}

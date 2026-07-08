import type { Variants } from 'framer-motion';

/**
 * Контейнер со «ступенчатым» (stagger) появлением дочерних блоков.
 * Дочерние элементы должны использовать `blockReveal`.
 */
export const staggerContainer = (stagger = 0.14, delay = 0.15): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren: delay,
    },
  },
});

/** Плавное появление блока снизу вверх. */
export const blockReveal: Variants = {
  hidden: { opacity: 0, y: 26, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Появление слева. */
export const fromLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Мягкое масштабирование (для карточек/иконок). */
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

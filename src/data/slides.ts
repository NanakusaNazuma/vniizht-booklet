/** Источник контента — векторный PDF из booklet.pptx (`public/booklet-slides.pdf`). */
export const TOTAL_SLIDES = 16;

/** Пропорции слайда из presentation.xml (EMU): 7559675 × 10691813 ≈ A4. */
export const SLIDE_RATIO = 7559675 / 10691813;

/** Позиция объекта persona на 2-м слайде PPTX, в % от размера слайда. */
export const PERSONA_PLACEMENT = {
  left: '55.54%',
  top: '57.96%',
  width: '39.62%',
  height: '42.02%',
} as const;

export const PERSONA_SRC = '/person.png';

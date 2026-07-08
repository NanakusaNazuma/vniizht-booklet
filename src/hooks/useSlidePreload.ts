import { useEffect } from 'react';

/**
 * Предзагрузка соседних слайдов больше не нужна для PNG:
 * PDF документ загружается один раз через PdfProvider.
 * Хук оставлен как no-op-совместимый, на случай прогрева страниц.
 */
export function useSlidePreload(_currentIndex: number) {
  useEffect(() => {
    // PDF уже в памяти; отдельная предзагрузка PNG не требуется.
  }, [_currentIndex]);
}

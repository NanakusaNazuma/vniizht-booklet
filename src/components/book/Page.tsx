import { forwardRef, type ReactNode } from 'react';

interface PageProps {
  children: ReactNode;
  /** Тёмная «титульная» стилизация страницы (обложка/финал). */
  dark?: boolean;
}

/**
 * Обёртка одной страницы книги. react-pageflip требует, чтобы каждая
 * страница была элементом с ref — поэтому используется forwardRef.
 */
const Page = forwardRef<HTMLDivElement, PageProps>(({ children, dark }, ref) => {
  return (
    <div className={`page${dark ? ' page--dark' : ''}`} ref={ref}>
      <div className="page__inner">{children}</div>
    </div>
  );
});

Page.displayName = 'Page';

export default Page;

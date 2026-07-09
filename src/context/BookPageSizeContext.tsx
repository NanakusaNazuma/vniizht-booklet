import { createContext, useContext } from 'react';

export interface BookPageSize {
  width: number;
  height: number;
}

const BookPageSizeContext = createContext<BookPageSize>({ width: 450, height: 636 });

export function BookPageSizeProvider({
  width,
  height,
  children,
}: BookPageSize & { children: React.ReactNode }) {
  return (
    <BookPageSizeContext.Provider value={{ width, height }}>
      {children}
    </BookPageSizeContext.Provider>
  );
}

export function useBookPageSize() {
  return useContext(BookPageSizeContext);
}

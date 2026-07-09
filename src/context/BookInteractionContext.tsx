import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface BookInteractionCtx {
  /** Блокировать перелистывание (зум / щипок). */
  flipLocked: boolean;
  setPageZoomed: (zoomed: boolean) => void;
  setPinching: (pinching: boolean) => void;
}

const BookInteractionContext = createContext<BookInteractionCtx | null>(null);

export function BookInteractionProvider({ children }: { children: ReactNode }) {
  const [pageZoomed, setPageZoomed] = useState(false);
  const [pinching, setPinching] = useState(false);

  const setPageZoomedStable = useCallback((zoomed: boolean) => {
    setPageZoomed(zoomed);
  }, []);

  const setPinchingStable = useCallback((pinching: boolean) => {
    setPinching(pinching);
  }, []);

  const value = useMemo(
    () => ({
      flipLocked: pageZoomed || pinching,
      setPageZoomed: setPageZoomedStable,
      setPinching: setPinchingStable,
    }),
    [pageZoomed, pinching, setPageZoomedStable, setPinchingStable],
  );

  return (
    <BookInteractionContext.Provider value={value}>{children}</BookInteractionContext.Provider>
  );
}

export function useBookInteraction() {
  const ctx = useContext(BookInteractionContext);
  if (!ctx) {
    throw new Error('useBookInteraction must be used within BookInteractionProvider');
  }
  return ctx;
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';

const MAX_PROFILES = 3;
const PARAM = 'compare';

type CompareContextValue = {
  selected: string[];
  toggle: (slug: string) => void;
  clear: () => void;
};

const CompareContext = createContext<CompareContextValue | null>(null);

const readFromUrl = () =>
  new URLSearchParams(window.location.search)
    .get(PARAM)
    ?.split(',')
    .filter(Boolean)
    .slice(0, MAX_PROFILES) ?? [];

/**
 * Selection is shared by the research library, the profile page and the
 * comparison, and it is carried in the URL so a comparison survives a reload
 * and can be linked to.
 */
export function CompareProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<string[]>(readFromUrl);
  const location = useLocation();

  useEffect(() => {
    const url = new URL(window.location.href);
    if (selected.length) url.searchParams.set(PARAM, selected.join(','));
    else url.searchParams.delete(PARAM);
    if (url.href !== window.location.href) window.history.replaceState({}, '', url);
    // `location.pathname` is a dependency so the selection survives a nav click:
    // a plain link drops the query string, and this restores it.
  }, [selected, location.pathname]);

  const toggle = useCallback((slug: string) => {
    setSelected((previous) =>
      previous.includes(slug)
        ? previous.filter((s) => s !== slug)
        : previous.length < MAX_PROFILES
          ? [...previous, slug]
          : previous,
    );
  }, []);

  const clear = useCallback(() => setSelected([]), []);

  const value = useMemo(
    () => ({ selected, toggle, clear }),
    [selected, toggle, clear],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) throw new Error('useCompare must be used inside CompareProvider');
  return context;
}

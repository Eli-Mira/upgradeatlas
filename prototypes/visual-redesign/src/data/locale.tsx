import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { copy, type Locale } from './copy';

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  text: (typeof copy)['en'];
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    const requested = new URLSearchParams(window.location.search).get('lang');
    return requested === 'en' ? 'en' : 'ar';
  });

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, text: copy[locale] }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useCopy() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useCopy must be used inside LocaleProvider');
  return context.text;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used inside LocaleProvider');
  return context;
}

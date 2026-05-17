'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

export type Language = 'EN' | 'DE';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const defaultContextValue: LanguageContextType = {
  language: 'EN',
  setLanguage: () => {},
};

const LanguageContext = createContext<LanguageContextType>(defaultContextValue);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('EN');

  useEffect(() => {
    const stored = localStorage.getItem('cube-language') as Language | null;
    if (stored && (stored === 'EN' || stored === 'DE')) {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cube-language', lang);
    }

    // Save to database if user is authenticated
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (profile) {
          await supabase
            .from('profiles')
            .update({ language: lang })
            .eq('id', profile.id);
        }
      }
    } catch (err) {
      console.error('Failed to save language preference:', err);
    }
  };

  const value = useMemo(() => ({ language, setLanguage }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

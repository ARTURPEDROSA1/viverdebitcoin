'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '@/data/translations';

type Currency = 'BRL' | 'USD' | 'EUR';

interface SettingsContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    currency: Currency;
    setCurrency: (curr: Currency) => void;
    t: (key: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children, initialLanguage = 'pt' }: { children: React.ReactNode, initialLanguage?: Language }) {
    const [language, setLanguage] = useState<Language>(initialLanguage);
    const [currency, setCurrency] = useState<Currency>('BRL');

    // Sync with initialLanguage if it changes (e.g. navigation)
    useEffect(() => {
        if (initialLanguage) {
            setLanguage(initialLanguage);
        }
    }, [initialLanguage]);

    // Persist settings
    useEffect(() => {
        // We do NOT load language from local storage because URL is the source of truth for I18n routes.
        // If we revert to root (non-localized), we might default to PT.

        const savedCurr = localStorage.getItem('viverdebitcoin_curr_v2') as Currency;
        if (savedCurr) setCurrency(savedCurr);
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        // localStorage.setItem('viverdebitcoin_lang_v2', lang);
        // Note: Changing language should ideally redirect to the correct URL. 
        // Consumers of this context should handle navigation if they want to switch URL.
    };

    const handleSetCurrency = (curr: Currency) => {
        setCurrency(curr);
        localStorage.setItem('viverdebitcoin_curr_v2', curr);
    };

    const t = (key: string) => {
        return translations[language]?.[key] || key;
    };

    return (
        <SettingsContext.Provider value={{ language, setLanguage: handleSetLanguage, currency, setCurrency: handleSetCurrency, t }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}

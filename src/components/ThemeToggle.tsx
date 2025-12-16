'use client';

import { useEffect, useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export default function ThemeToggle() {
    const { isLightMode, toggleTheme } = useSettings();

    return (
        <button id="theme-toggle" className="theme-toggle-btn" onClick={toggleTheme} title="Alternar Tema">
            <span>{isLightMode ? '☀️' : '🌙'}</span>
        </button>
    );
}

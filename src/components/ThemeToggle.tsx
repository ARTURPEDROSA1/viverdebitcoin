'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const [isLight, setIsLight] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('theme');
        if (saved === 'light') {
            setIsLight(true);
            document.body.classList.add('light-mode');
        }
    }, []);

    const toggle = () => {
        const newVal = !isLight;
        setIsLight(newVal);
        if (newVal) {
            document.body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
        }
    };

    return (
        <button id="theme-toggle" className="theme-toggle-btn" onClick={toggle} title="Alternar Tema">
            <span>{isLight ? '☀️' : '🌙'}</span>
        </button>
    );
}

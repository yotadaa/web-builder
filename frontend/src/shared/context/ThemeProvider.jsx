import React, { useState } from 'react';
import { ThemeContext } from './ThemeContext';

export const ThemeProvider = ({ children }) => {
    const [accentColor, setAccentColor] = useState('#6366f1'); // Default Indigo
    const [isDarkMode, setIsDarkMode] = useState(true);

    const theme = {
        accentColor,
        setAccentColor,
        isDarkMode,
        setIsDarkMode,
        colors: {
            primary: accentColor,
            bg: isDarkMode ? '#0f172a' : '#f8fafc',
            card: isDarkMode ? '#1e293b' : '#ffffff',
            border: isDarkMode ? '#334155' : '#e2e8f0',
            text: isDarkMode ? '#f8fafc' : '#0f172a',
            textMuted: isDarkMode ? '#94a3b8' : '#64748b',
        }
    };

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
};

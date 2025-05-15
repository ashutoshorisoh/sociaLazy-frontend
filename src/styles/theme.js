export const colors = {
    primary: {
        light: '#FF4500', // Bright orange
        dark: '#FF6B3D',
    },
    secondary: {
        light: '#00B4D8', // Bright cyan
        dark: '#48CAE4',
    },
    accent: {
        light: '#FFD700', // Bright yellow
        dark: '#FFE44D',
    },
    background: {
        light: '#FFFFFF',
        dark: '#121212',
    },
    surface: {
        light: '#F8F9FA',
        dark: '#1E1E1E',
    },
    text: {
        light: '#1A1A1A',
        dark: '#FFFFFF',
    },
    textSecondary: {
        light: '#666666',
        dark: '#B0B0B0',
    },
    success: '#00C853',
    error: '#FF3D00',
    warning: '#FFD600',
    info: '#00B0FF',
};

export const spacing = {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
};

export const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
};

export const shadows = {
    sm: '0 2px 4px rgba(0, 0, 0, 0.05)',
    md: '0 4px 8px rgba(0, 0, 0, 0.1)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.1)',
    xl: '0 12px 24px rgba(0, 0, 0, 0.15)',
};

export const transitions = {
    default: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    fast: 'all 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};

export const borderRadius = {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    full: '9999px',
};

export const lightTheme = {
    mode: 'light',
    colors: {
        primary: '#FF4B2B', // Bright red
        secondary: '#FFD700', // Bright yellow
        background: '#FFFFFF',
        surface: '#F8F9FA',
        text: '#1A1A1A',
        textSecondary: '#666666',
        border: '#E5E7EB',
        error: '#DC2626',
        success: '#059669',
        warning: '#D97706',
        info: '#3B82F6',
    },
    spacing,
    breakpoints,
    shadows,
    transitions,
    borderRadius,
};

export const darkTheme = {
    mode: 'dark',
    colors: {
        primary: '#8B0000', // Dark red
        secondary: '#B8860B', // Dark yellow
        background: '#121212',
        surface: '#1E1E1E',
        text: '#FFFFFF',
        textSecondary: '#A1A1AA',
        border: '#2D2D2D',
        error: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
        info: '#60A5FA',
    },
    spacing,
    breakpoints,
    shadows,
    transitions,
    borderRadius,
}; 
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* === Cyberpunk Neon Dark Tokens === */
        primary: { DEFAULT: '#00f0ff', dim: '#008b99', fixed: '#e0ffff', container: '#00f0ff2b' },
        secondary: { DEFAULT: '#ff0055', dim: '#b3003c', container: '#ff00552b', fixed: '#ffb3cc' },
        tertiary: { DEFAULT: '#00ff66', dim: '#00b347', container: '#00ff662b' },
        error: { DEFAULT: '#ff0033', container: '#ff00332b' },
        navy: '#927171ff',

        surface: { DEFAULT: '#09090b', bright: '#27272a', dim: '#000000' },
        'surface-lowest': '#27272a', // Cards - distinct light slate gray
        'surface-low': '#3f3f46', // Inputs - prominent gray to stand out
        'surface-container': '#52525b', // Borders
        'surface-container-high': '#71717a',
        'surface-container-highest': '#a1a1aa',

        'on-surface': '#f4f4f5', // Bright white text for headers
        'on-surface-variant': '#a1a1aa', // Silver/gray subtext
        'on-primary': '#f1eaeaff',
        'on-secondary': '#fefcfcff',
        'on-secondary-container': '#ff0055',
        'on-tertiary-container': '#00ff66',

        outline: '#71717a',
        'outline-variant': '#52525b',
        'inverse-surface': '#ffffff',
        'inverse-primary': '#008b99',
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '2rem',
        full: '9999px',
      },
      boxShadow: {
        ambient: '0 4px 60px rgba(0, 240, 255, 0.05)',
        card: '0 4px 20px rgba(0, 0, 0, 0.5)',
        float: '0 8px 32px rgba(0, 0, 0, 0.8)',
        'neon-primary': '0 0 10px rgba(0, 240, 255, 0.5), 0 0 20px rgba(0, 240, 255, 0.3)',
        'neon-secondary': '0 0 10px rgba(255, 0, 85, 0.5), 0 0 20px rgba(255, 0, 85, 0.3)',
        'neon-tertiary': '0 0 10px rgba(0, 255, 102, 0.5), 0 0 20px rgba(0, 255, 102, 0.3)',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #00f0ff 0%, #008b99 100%)',
        'navy-gradient': 'linear-gradient(135deg, #050505 0%, #121212 100%)',
        'card-gradient': 'linear-gradient(135deg, #0a0a0a 0%, #18181b 100%)',
      },
      keyframes: {
        shimmer: { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
        fadeInUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: {
        shimmer: 'shimmer 1.5s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.4s ease forwards',
      },
    },
  },
  plugins: [],
};

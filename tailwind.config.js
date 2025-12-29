/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B5CF6', // Violet
          dark: '#7C3AED',
          light: '#A78BFA',
        },
        secondary: {
          DEFAULT: '#3B82F6', // Blue
        },
        background: {
          light: '#F3F4F6',
          dark: '#0F111A', // Deep Blue-Black
        },
        surface: {
          light: '#FFFFFF',
          dark: '#1E2130', // Lighter Blue-Black
        }
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'neo-dark': '5px 5px 10px #0a0c12, -5px -5px 10px #22263e',
        'neo-light': '5px 5px 10px #d1d5db, -5px -5px 10px #ffffff',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}


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
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
          DEFAULT: 'var(--color-primary-500)',
        },
        secondary: {
          100: 'var(--color-secondary-100)',
          500: 'var(--color-secondary-500)',
          900: 'var(--color-secondary-900)',
          DEFAULT: 'var(--color-secondary-500)',
        },
        neutral: {
          100: 'var(--color-neutral-100)',
          500: 'var(--color-neutral-500)',
          900: 'var(--color-neutral-900)',
          DEFAULT: 'var(--color-neutral-500)',
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',

        // Aliases for compatibility/semantic usage
        background: {
          light: 'var(--color-neutral-100)',
          dark: 'var(--color-neutral-900)',
          DEFAULT: 'var(--color-neutral-900)',
        },
        surface: {
          light: '#FFFFFF',
          dark: 'var(--color-primary-900)',
        }
      },
      backgroundImage: {
        'gradient-aurora': 'linear-gradient(135deg, var(--color-primary-900), var(--color-neutral-500), var(--color-primary-600))',
        'gradient-glow': 'radial-gradient(circle at center, var(--color-secondary-500), transparent 70%)',
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'neo-dark': '5px 5px 10px #021412, -5px -5px 10px #053931',
        'neo-light': '5px 5px 10px #d1d9d9, -5px -5px 10px #ffffff',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'aurora': '0 0 20px rgba(72, 168, 154, 0.3)',
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


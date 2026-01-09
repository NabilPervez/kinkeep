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
        'steel-blue': 'var(--steel-blue)',
        'frozen-water': 'var(--frozen-water)',
        'jet-black': 'var(--jet-black)',
        'iron-grey': 'var(--iron-grey)',
        'soft-cyan': 'var(--soft-cyan)',
        primary: {
          DEFAULT: 'var(--steel-blue)',
          dark: '#3a5b80', // Darker shade of steel blue
          light: '#658dbd', // Lighter shade of steel blue
        },
        secondary: {
          DEFAULT: 'var(--soft-cyan)',
        },
        accent: {
          yellow: '#f2e863', // Keeping original accents for now
          gold: '#f2cd60',
        },
        background: {
          light: 'var(--frozen-water)',
          dark: 'var(--jet-black)',
        },
        surface: {
          light: '#FFFFFF',
          dark: 'var(--iron-grey)',
        }
      },
      backgroundImage: {
        'gradient-top': 'linear-gradient(0deg, var(--steel-blue), var(--frozen-water), var(--jet-black), var(--iron-grey), var(--soft-cyan))',
        'gradient-right': 'linear-gradient(90deg, var(--steel-blue), var(--frozen-water), var(--jet-black), var(--iron-grey), var(--soft-cyan))',
        'gradient-bottom': 'linear-gradient(180deg, var(--steel-blue), var(--frozen-water), var(--jet-black), var(--iron-grey), var(--soft-cyan))',
        'gradient-left': 'linear-gradient(270deg, var(--steel-blue), var(--frozen-water), var(--jet-black), var(--iron-grey), var(--soft-cyan))',
        'gradient-top-right': 'linear-gradient(45deg, var(--steel-blue), var(--frozen-water), var(--jet-black), var(--iron-grey), var(--soft-cyan))',
        'gradient-bottom-right': 'linear-gradient(135deg, var(--steel-blue), var(--frozen-water), var(--jet-black), var(--iron-grey), var(--soft-cyan))',
        'gradient-top-left': 'linear-gradient(225deg, var(--steel-blue), var(--frozen-water), var(--jet-black), var(--iron-grey), var(--soft-cyan))',
        'gradient-bottom-left': 'linear-gradient(315deg, var(--steel-blue), var(--frozen-water), var(--jet-black), var(--iron-grey), var(--soft-cyan))',
        'gradient-radial': 'radial-gradient(var(--steel-blue), var(--frozen-water), var(--jet-black), var(--iron-grey), var(--soft-cyan))',
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'neo-dark': '5px 5px 10px #0a0c12, -5px -5px 10px #22263e',
        'neo-light': '5px 5px 10px #a3bfbd, -5px -5px 10px #ddffff', // Adjusted for frozen-water
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


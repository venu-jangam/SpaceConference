/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#02040a',
          900: '#050a18',
          800: '#0d111d',
          700: '#161b22',
          600: '#21262d',
        },
        accent: {
          blue: {
            DEFAULT: '#00d4ff',
            glow: 'rgba(0, 212, 255, 0.4)',
          },
          amber: {
            DEFAULT: '#ffaa00',
            glow: 'rgba(255, 170, 0, 0.4)',
          },
          purple: '#7c3aed',
        }
      },
      backgroundImage: {
        'cosmic-gradient': 'radial-gradient(circle at top right, #1a1a3e, #050a18)',
        'star-pattern': "url('https://www.transparenttextures.com/patterns/stardust.png')",
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'subtle-float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: 1, filter: 'brightness(1)' },
          '50%': { opacity: 0.8, filter: 'brightness(1.5)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}

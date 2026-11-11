/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        industrial: {
          charcoal: '#101820',
          gunmetal: '#19252F',
          'steel-deep': '#263640',
          'steel-gray': '#405160',
          'steel-light': '#E7ECEF',
          'steel-soft': '#CAD2D7',
          'offwhite': '#E9EFF2',
          'offwhite-bg': '#F3F5F6',
          'cool-gray': '#A8B7BE',
          'slate-gray': '#5B6C76',
          'amber': '#E5A34B',
          'copper': '#9C5A16',
          'dies-blue': '#55748A',
          'mold-green': '#617967',
          'jig-copper': '#A77344',
        }
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}

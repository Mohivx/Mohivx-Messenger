/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        beeper: {
          bg: '#232323',
          sidebar: 'rgba(246, 246, 246, 0.10)',
          dark: '#000000',
          bubble: '#232326',
          bubbleOutgoing: '#2561fb',
          blue: '#2561fb',
          capsule: '#1c1c1d',
          border: 'rgba(255, 255, 255, 0.1)',
          borderSubtle: 'rgba(255, 255, 255, 0.06)',
          text: '#ededed',
          textMuted: '#9b9ba2',
          pillBg: '#232323',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI Variable', 'Segoe UI', 'Roboto', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'beeper-bubble': '17px',
        'beeper-card': '12px',
        'beeper-button': '14px',
      },
    },
  },
  plugins: [],
}

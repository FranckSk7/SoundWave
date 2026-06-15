/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sw: {
          bg:            '#0a0a0a',
          surface:       '#121212',
          'surface-2':   '#1a1a1a',
          'surface-hover':'#2a2a2a',
          popup:         '#282828',
          green:         '#1DB954',
          'green-light': '#1ed760',
          'green-dark':  '#158a3e',
          text:          '#ffffff',
          muted:         '#a7a7a7',
          subtle:        '#535353',
          gold:          '#f59e0b',
          cameroun1:     '#007a5e',
          cameroun2:     '#ce1126',
          cameroun3:     '#fcd116',
        },
      },
      fontFamily: {
        sans: ['"Circular Std"', '"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      animation: {
        'fade-up':   'fadeUp .3s ease both',
        'fade-in':   'fadeIn .25s ease both',
        'spin-slow': 'spin 8s linear infinite',
        'wave':      'wave 1.2s ease-in-out infinite',
        'equalizer': 'equalizer 1s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeUp:  { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        wave:    { '0%,100%': { transform: 'scaleY(.4)' }, '50%': { transform: 'scaleY(1)' } },
        equalizer: { from: { height: '4px' }, to: { height: '16px' } },
      },
    },
  },
  plugins: [],
}

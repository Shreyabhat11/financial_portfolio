/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#000000',
        card: '#1a1f2b',
        'card-dark': '#141820',
        sidebar: '#0d1117',
        accent: '#00d2d3',
        'accent-dark': '#009b9c',
        success: '#00c853',
        danger: '#ff5252',
        warning: '#ffab00',
        'text-primary': '#ffffff',
        'text-secondary': '#8892a4',
        'border-subtle': '#232b38',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
      backgroundImage: {
        'card-gradient': 'linear-gradient(135deg, #1a1f2b 0%, #141820 100%)',
        'accent-gradient': 'linear-gradient(135deg, #00d2d3 0%, #009b9c 100%)',
        'success-gradient': 'linear-gradient(135deg, #00c853 0%, #00a040 100%)',
        'danger-gradient': 'linear-gradient(135deg, #ff5252 0%, #d32f2f 100%)',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'accent-glow': '0 0 20px rgba(0,210,211,0.3)',
        'success-glow': '0 0 20px rgba(0,200,83,0.2)',
        'danger-glow': '0 0 20px rgba(255,82,82,0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}

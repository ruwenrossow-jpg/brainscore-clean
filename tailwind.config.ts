import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'brand-purple': '#7C3AED',
        'brand-accent': '#A78BFA',
        'brand-dark': '#0f0f0f',
        'brand-green': '#10B981',
        'brand-black': '#000000',
        'brand-gray': '#f7f7f7',
        'brand-text': '#1a1a1a',
      },
      backgroundImage: {
        'gradient-purple': 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
        'gradient-purple-hover': 'linear-gradient(135deg, #6D28D9 0%, #5B21B6 100%)',
        'gradient-hero': 'linear-gradient(to right, #7C3AED, #EC4899)',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'purple-glow': '0 25px 50px -12px rgba(124, 58, 237, 0.25)',
        'purple-button': '0 25px 50px -12px rgba(124, 58, 237, 0.15)',
        'purple-button-hover': '0 25px 50px -12px rgba(124, 58, 237, 0.35)',
      },
      borderRadius: {
        'card': '1rem',
        'button': '0.75rem',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        brainscore: {
          'primary': '#7C3AED',
          'primary-focus': '#6D28D9',
          'primary-content': '#ffffff',
          'secondary': '#0f0f0f',
          'accent': '#10B981',
          'neutral': '#1a1a1a',
          'base-100': '#ffffff',
          'base-200': '#f7f7f7',
          'base-300': '#e5e5e5',
          'base-content': '#1a1a1a',
          'info': '#7C3AED',
          'success': '#10B981',
          'warning': '#fbbf24',
          'error': '#ef4444',
        },
      },
    ],
    darkTheme: false,
  },
} satisfies Config;

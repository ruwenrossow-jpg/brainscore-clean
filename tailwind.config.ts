import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'brand-black': '#000000',
        'brand-gray': '#f7f7f7',
        'brand-text': '#1a1a1a',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        brainscore: {
          'primary': '#000000',
          'secondary': '#4a4a4a',
          'accent': '#f7f7f7',
          'neutral': '#e5e5e5',
          'base-100': '#ffffff',
          'base-200': '#f7f7f7',
          'base-300': '#e5e5e5',
          'base-content': '#1a1a1a',
          'info': '#000000',
          'success': '#000000',
          'warning': '#000000',
          'error': '#1a1a1a',
        },
      },
    ],
    darkTheme: false,
  },
} satisfies Config;

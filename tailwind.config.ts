import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'crt-bg':      'var(--color-bg)',
        'crt-surface': 'var(--color-surface)',
        'crt-border':  'var(--color-border)',
        'crt-dim':     'var(--color-text-dim)',
        'crt-text':    'var(--color-text)',
        'crt-bright':  'var(--color-text-bright)',
        'crt-amber':   'var(--color-amber)',
        'crt-red':     'var(--color-red)',
        'crt-cursor':  'var(--color-cursor)',
      },
      fontFamily: {
        terminal: ['VT323', 'monospace'],
        mono:     ['Share Tech Mono', 'monospace'],
        display:  ['"Press Start 2P"', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config

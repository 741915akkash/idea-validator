// tailwind.config.js

module.exports = {
  darkMode: 'class',

  content: ['./app/**/*.{vue,js,ts}', './content/**/*.md'],

  theme: {
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      serif: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      mono: ['ui-monospace', 'SFMono-Regular', 'monospace']
    },

    extend: {
      colors: {
        app: {
          bg: 'var(--bg)',
          panel: 'var(--panel)',
          card: 'var(--card)',

          text: 'var(--text)',
          muted: 'var(--muted)',

          border: 'var(--border)',

          primary: 'var(--primary)',

          hover: 'var(--hover)',

          navActiveBg: 'var(--nav-active-bg)',
          navActiveText: 'var(--nav-active-text)',

          link: 'var(--link)',

          selected: 'var(--selected-bg)',

          pillActiveBg: 'var(--pill-active-bg)',
          pillActiveText: 'var(--pill-active-text)'
        }
      },

      typography: {
        DEFAULT: {
          css: {
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',

            color: 'var(--text)',

            h1: {
              color: 'var(--text)',
              fontWeight: '600'
            },

            h2: {
              color: 'var(--text)',
              fontWeight: '600'
            },

            h3: {
              color: 'var(--text)',
              fontWeight: '600'
            },

            a: {
              color: '#059669',
              textDecoration: 'none',

              '&:hover': {
                textDecoration: 'underline'
              }
            },

            'h1 a, h2 a, h3 a': {
              color: 'var(--text)',
              textDecoration: 'none',

              '&:hover': {
                textDecoration: 'none'
              }
            },

            code: {
              backgroundColor: 'var(--card)',
              padding: '2px 6px',
              borderRadius: '4px'
            },

            pre: {
              backgroundColor: 'var(--card)',
              color: 'var(--text)'
            },

            blockquote: {
              borderLeftColor: '#10b981',
              color: 'var(--muted)'
            }
          }
        }
      }
    }
  },

  plugins: [require('@tailwindcss/typography')]
}

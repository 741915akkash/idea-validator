// tailwind.config.js

module.exports = {
  content: ['./app/**/*.{vue,js,ts}', './content/**/*.md'],

  theme: {
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      serif: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'], // 🔑 override serif too
      mono: ['ui-monospace', 'SFMono-Regular', 'monospace']
    },

    extend: {
      typography: {
        DEFAULT: {
          css: {
            // 🔑 force ALL typography to use Inter
            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',

            color: '#334155',
            // ✅ HEADINGS → BLACK
            h1: {
              color: '#0f172a', // slate-900
              fontWeight: '600'
            },
            h2: {
              color: '#0f172a',
              fontWeight: '600'
            },
            h3: {
              color: '#0f172a',
              fontWeight: '600'
            },

            // keep links emerald
            a: {
              color: '#059669',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            },

            // ✅ BUT override links inside headings
            'h1 a, h2 a, h3 a': {
              color: '#0f172a',
              textDecoration: 'none',

              '&:hover': {
                textDecoration: 'none' // ✅ remove underline on hover
              }
            },

            code: {
              backgroundColor: '#f1f5f9',
              padding: '2px 6px',
              borderRadius: '4px'
            },

            pre: {
              backgroundColor: '#0f172a',
              color: '#e2e8f0'
            },

            blockquote: {
              borderLeftColor: '#10b981',
              color: '#475569'
            }
          }
        }
      }
    }
  },

  plugins: [require('@tailwindcss/typography')]
}

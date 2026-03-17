import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

const config = [
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/coverage/**',
      '**/dist/**',
      '**/out/**',
      '**/prisma/generated/**',
      '**/prisma/migrations/**',
    ],
  },
  ...nextCoreWebVitals,
  {
    files: ['src/app/(dashboard)/reflection/page.jsx'],
    rules: {
      'react/no-unescaped-entities': 'off',
    },
  },
]

export default config

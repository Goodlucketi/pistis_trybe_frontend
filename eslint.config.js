import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // The React-Compiler purity rules bundled into eslint-plugin-react-hooks v7
      // flag intentional, idiomatic patterns used across this app: URL-param ↔
      // state sync and reset-on-close/form-init-from-fetch (set-state-in-effect)
      // and relative-time formatting via Date.now() (purity). They aren't bugs,
      // so we keep the rules off while retaining the genuinely valuable
      // rules-of-hooks and no-unused-vars checks.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
    },
  },
])

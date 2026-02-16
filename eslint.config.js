import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'

const noAnonymousFunctionRules = [
  'error',
  {
    selector: 'ArrowFunctionExpression',
    message: 'Use named function declarations instead of arrow functions.',
  },
  {
    selector: 'FunctionExpression[id=null]',
    message: 'Anonymous functions are not allowed. Use a named function.',
  },
]

const config = [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      'func-names': ['error', 'always'],
      'no-restricted-syntax': noAnonymousFunctionRules,
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    rules: {
      'func-names': ['error', 'always'],
      'no-restricted-syntax': noAnonymousFunctionRules,
    },
  },
]

export default config

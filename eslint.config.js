import typescriptEslint from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import importPlugin from 'eslint-plugin-import'
import prettier from 'eslint-plugin-prettier'
import react from 'eslint-plugin-react'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unusedImports from 'eslint-plugin-unused-imports'

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['node_modules/', '.next/', 'out/', 'build/', 'dist/'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'unused-imports': unusedImports,
      'simple-import-sort': simpleImportSort,
      react: react,
      import: importPlugin,
      prettier: prettier,
    },
    rules: {
      'react/jsx-key': 'error',
      'react/display-name': 'off',
      'react/no-unescaped-entities': 0,
      'unused-imports/no-unused-imports': 'error',
      'import/no-duplicates': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'no-console': [
        'warn',
        {
          allow: ['error', 'warn', 'info'],
        },
      ],
      'prettier/prettier': ['warn', {}, { usePrettierrc: true }],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]

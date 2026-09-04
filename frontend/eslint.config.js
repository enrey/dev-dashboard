import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';

export default tseslint.config(
  // Игнорируемые файлы
  {
    ignores: [
      'build/**',
      'node_modules/**',
      'dist/**',
      '**/*.config.js',
      '**/*.config.ts',
    ],
  },

  // Базовые настройки JavaScript
  js.configs.recommended,

  // Настройки для TypeScript
  ...tseslint.configs.recommended,

  // Настройки для всех файлов проекта (исключая тесты)
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*'],
    
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.es2020,
        ...globals.jest,
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
      },
    },

    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      import: importPlugin,
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      // Правило для сортировки импортов
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          pathGroups: [
            {
              pattern: 'react',
              group: 'builtin',
            },
            {
              pattern:
                '{assets,assets/*,core,core/*,hocs,hocs/*,pages,pages/*,routes,routes/*,shared,shared/*,store,store/*,stories,stories/*,styles,styles/*,utils,utils/*}',
              group: 'internal',
            },
            {
              pattern: '[a-zA-Z@]**',
              group: 'external',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
        },
      ],

      // React Hooks правила
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Отключаем некоторые строгие правила TypeScript для удобства
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-require-imports': 'error',

      // Запрещаем импортировать страницы вне папки pages
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './src/**',
              from: './src/pages/**',
              except: ['./src/pages/**'],
            },
          ],
        },
      ],
    },
  },

  // Страницы могут импортировать внутри pages (включая локальные стили)
  {
    files: ['src/pages/**/*.{ts,tsx}'],
    rules: {
      'import/no-restricted-paths': 'off',
    },
  },

  // Отдельные настройки для тестовых файлов
  {
    files: ['**/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        // Не используем project для тестов
      },
      globals: {
        ...globals.browser,
        ...globals.es2020,
        ...globals.jest,
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly',
      },
    },

    rules: {
      // Более мягкие правила для тестов
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  }
);

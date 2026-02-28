/* eslint-disable perfectionist/sort-objects */
// Root ESLint config for the booking monorepo

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: false,
  },
  env: {
    es2020: true,
    node: true,
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  settings: {
    'import/resolver': {
      typescript: {
        project: ['tsconfig.base.json', 'apps/*/tsconfig.json', 'packages/*/tsconfig.json'],
      },
    },
  },
  ignorePatterns: [
    'dist',
    'node_modules',
    'coverage',
    '**/dist/**',
    '**/node_modules/**',
  ],
  overrides: [
    {
      files: ['apps/backend/**/*.{ts,tsx}'],
      env: {
        node: true,
      },
      rules: {
        'import/no-nodejs-modules': 'off',
      },
    },
    {
      files: ['apps/frontend/**/*.{ts,tsx,js,jsx}'],
      env: {
        browser: true,
      },
      plugins: ['react', 'react-hooks', 'jsx-a11y'],
      extends: [
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:jsx-a11y/recommended',
      ],
      settings: {
        react: {
          version: 'detect',
        },
      },
      rules: {
        'react/react-in-jsx-scope': 'off',
      },
    },
    {
      files: ['**/*.test.{ts,tsx,js,jsx}'],
      env: {
        jest: true,
      },
    },
  ],
};


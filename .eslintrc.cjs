module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  globals: {
    fetch: 'readonly',
    AbortController: 'readonly',
  },
  extends: ['eslint:recommended'],
  ignorePatterns: [
    'node_modules/**',
    'dist/**',
    'files/**',
    'img/**',
    'allegati/**',
    '*.pdf',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  overrides: [
    {
      files: ['scripts/**/*.js', '*.config.js', '.eslintrc.cjs'],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  rules: {
    'no-console': 'off',
    'no-empty': 'warn',
    'no-unused-vars': ['warn', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
    }],
  },
};

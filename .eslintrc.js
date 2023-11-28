module.exports = {
  parser: '@typescript-eslint/parser',

  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],

  root: true,

  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
  extends: ['eslint-config-next',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:promise/recommended',
  ],

  rules: {
    quotes: [
      'error',
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true,
      },
    ],
    'react/jsx-no-literals': 'off',
    'padding-line-between-statements': [
      'error',
      {
        blankLine: 'always',
        prev: '*',
        next: 'return',
      },
      {
        blankLine: 'always',
        prev: '*',
        next: 'case',
      },
      {
        blankLine: 'always',
        prev: '*',
        next: 'default',
      },
      {
        blankLine: 'always',
        prev: '*',
        next: 'block-like',
      },
    ],
    'prefer-const': ['error'],
    'simple-import-sort/imports': [
      'warn',
      {
        groups: [['^\\u0000'], ['^react', '^[^.]'], ['^src/'], ['^\\.']],
      },
    ],

    'max-lines': ['error', 500],
    'no-console': 'error',
    'object-shorthand': 'error',
    'no-unneeded-ternary': 'error',
    'no-nested-ternary': 'error',
    'newline-before-return': 'warn',
    semi: ['error', 'never'],

    // prettier
    'prettier/prettier': [
      'error',
      {
        tabWidth: 2,
        trailingComma: 'all',
        semi: false,
        arrowParens: 'always',
        singleQuote: true,
        printWidth: 80,
        bracketSpacing: true,
      },
    ],

    'import/newline-after-import': 'error',

    // react
    'react/react-in-jsx-scope': 'off',

    // promise
    'promise/prefer-await-to-then': 'warn',
    'promise/prefer-await-to-callbacks': 'warn',

    'no-shadow': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'react/sort-comp': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@next/next/no-html-link-for-pages': ['error', 'packages/client/pages/'],
  },
};

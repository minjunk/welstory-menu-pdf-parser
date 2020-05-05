module.exports = {
  env: {
    node: true,
    es6: true,
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
  rules: {
    'comma-dangle': ["error", {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'always-multiline',
    }]
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 6,
        project: './tsconfig.json',
        tsconfigRootDir: '.',
      },
      rules: {
        'no-dupe-class-members': 'off',
      }
    },
  ],
};

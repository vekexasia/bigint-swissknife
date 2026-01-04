import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import tsdocPlugin from 'eslint-plugin-tsdoc';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['**/dist/**/*', '**/node_modules/**/*', 'build/**/*'],
  },
  {
    files: ['**/*.ts'],
    plugins: {
      tsdoc: tsdocPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'tsdoc/syntax': 'warn',
    },
  },
);

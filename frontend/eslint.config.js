// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const stylistic = require('@stylistic/eslint-plugin');
const angular = require('angular-eslint');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    plugins: { '@stylistic': stylistic },
    rules: {
      // Riga vuota dopo ogni membro multi-riga (costruttori, metodi); i campi su singola riga possono restare compatti.
      // La separazione visiva tra blocco di campi e metodi è garantita dal formato del codice (Prettier preserva le righe vuote).
      '@stylistic/lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {
      // I template legacy non bloccano la build, ma la regola segnala i label da associare ai controlli.
      '@angular-eslint/template/label-has-associated-control': 'warn',
    },
  },
]);

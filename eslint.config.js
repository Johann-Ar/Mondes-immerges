import js from '@eslint/js';
import globals from 'globals';

export default [
    { ignores: ['dist/', 'node_modules/'] },
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: { ...globals.browser },
        },
        rules: {
            'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
            'no-empty': ['error', { allowEmptyCatch: true }],
        },
    },
    { files: ['*.config.js', 'scripts/**'], languageOptions: { globals: { ...globals.node } } },
];

module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'eslint:recommended'
  ],
  ignorePatterns: [
    'dist',
    'build',
    '.eslintrc.js',
    'node_modules',
    '*.config.js',
    '*.config.ts',
    'vite.config.ts'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // TypeScript rules
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true 
    }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    
    // General rules
    'no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true 
    }],
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-duplicate-imports': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
  },
  overrides: [
    {
      // React/Frontend packages
      files: [
        'packages/admin-panel/**/*.{ts,tsx}',
        'packages/tenant-dashboard/**/*.{ts,tsx}',
        'packages/captain-pwa/**/*.{ts,tsx}'
      ],
      extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended'
      ],
      plugins: ['react-refresh'],
      settings: {
        react: {
          version: '18.2'
        }
      },
      rules: {
        'react-refresh/only-export-components': [
          'warn',
          { allowConstantExport: true },
        ],
        'react/prop-types': 'off',
        'react/display-name': 'off',
        'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform
        'no-console': 'off', // Allow console in dev environment
        '@typescript-eslint/no-non-null-assertion': 'off', // Common in React apps
      },
    },
    {
      // API package - Node.js specific
      files: ['packages/api/**/*.{ts,js}'],
      env: {
        node: true,
        browser: false,
      },
      rules: {
        'no-console': 'off', // Allow console in server code
        '@typescript-eslint/no-var-requires': 'off', // Allow require() in Node.js
      },
    },
    {
      // Shared package
      files: ['packages/shared/**/*.ts'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'warn',
        '@typescript-eslint/explicit-module-boundary-types': 'warn',
      },
    },
    {
      // Config files
      files: ['*.config.{js,ts}', '.eslintrc.js'],
      env: {
        node: true,
      },
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'no-console': 'off',
      },
    }
  ],
}; 
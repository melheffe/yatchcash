# 🔍 YachtCash Linting & Code Quality Guide

## 📋 Overview

YachtCash now has a comprehensive linting and code quality system to maintain consistency across the entire monorepo. This ensures code quality, consistency, and catches potential issues early in development.

## 🛠️ Tools Configured

### 1. **ESLint** - Code Linting
- **TypeScript** support across all packages
- **React** specific rules for frontend packages
- **Node.js** specific rules for API package
- **Custom rules** per package type

### 2. **Prettier** - Code Formatting
- Consistent formatting across all files
- **Single quotes**, **2-space indentation**
- **100 character line width**
- **Trailing commas** where valid

### 3. **Husky** - Git Hooks
- **Pre-commit hooks** to run linting before commits
- Prevents problematic code from being committed

### 4. **lint-staged** - Selective Linting
- Only lints **staged files** for faster commits
- Runs **ESLint** and **Prettier** on relevant files
- Runs **type checking** for TypeScript files

## 📁 Configuration Files

```
yachtcash/
├── .eslintrc.js          # Root ESLint configuration
├── .prettierrc           # Prettier formatting rules
├── .prettierignore       # Files to ignore for formatting
├── .lintstagedrc         # lint-staged configuration
├── .husky/
│   ├── pre-commit        # Pre-commit git hook
│   └── _/husky.sh        # Husky infrastructure
└── packages/             # Each package inherits root config
```

## 🎯 Linting Rules

### TypeScript Rules
- ✅ **Unused variables** must start with `_` (e.g., `_unusedParam`)
- ⚠️ **`any` types** generate warnings (should be avoided)
- ✅ **Consistent imports** - no duplicates
- ✅ **Type safety** - strict TypeScript checking

### React Rules (Frontend Packages)
- ✅ **React Hooks** rules enforced
- ✅ **JSX** best practices
- ⚠️ **React Refresh** compatibility warnings
- ✅ **No unused React imports** (new JSX transform)

### Node.js Rules (API Package)
- ✅ **Console statements** allowed in server code
- ✅ **require()** allowed for Node.js compatibility
- ✅ **Fastify patterns** recognized

## 🚀 Commands

### Root Level Commands
```bash
# Run linting across all packages
npm run lint

# Fix auto-fixable linting issues
npm run lint:fix

# Format all code with Prettier
npm run format

# Check formatting without changing files
npm run format:check

# Run type checking across all packages
npm run type-check

# Combined linting and formatting
npm run lint-and-format

# Pre-commit checks (runs automatically)
npm run pre-commit
```

### Package Level Commands
Each package also has its own linting commands:

```bash
# In any package directory
npm run lint          # Lint package files
npm run lint:fix      # Fix auto-fixable issues
npm run format        # Format package files
npm run type-check    # TypeScript checking
```

## 🔧 Package-Specific Configuration

### Admin Panel (`packages/admin-panel/`)
- **React + TypeScript** rules
- **Vite** build integration
- **Mantine UI** component patterns

### Tenant Dashboard (`packages/tenant-dashboard/`)
- **React + TypeScript** rules
- **Modern JSX** transform
- **Component-based** architecture

### API (`packages/api/`)
- **Node.js + TypeScript** rules
- **Fastify** server patterns
- **Prisma** database integration

### Captain PWA (`packages/captain-pwa/`)
- **React + TypeScript** rules
- **PWA** specific patterns
- **Mobile-first** considerations

### Shared (`packages/shared/`)
- **Strict TypeScript** rules
- **Library** patterns
- **Type definitions** focus

## 📝 Pre-Commit Workflow

When you commit code, the following happens automatically:

1. **🔍 lint-staged** identifies staged files
2. **⚡ ESLint** fixes auto-fixable issues
3. **🎨 Prettier** formats the code
4. **📋 Type check** runs for TypeScript files
5. **✅ Commit** proceeds if all checks pass
6. **❌ Commit blocked** if there are unfixable errors

## 🚨 Handling Linting Errors

### Auto-Fixable Issues
```bash
npm run lint:fix    # Fix most issues automatically
npm run format      # Fix all formatting issues
```

### Manual Fixes Required

#### Unused Variables
```typescript
// ❌ Error: unused variable
const response = await api.call();

// ✅ Fix: prefix with underscore
const _response = await api.call();

// ✅ Better: use the variable
const response = await api.call();
return response.data;
```

#### TypeScript Any Types
```typescript
// ⚠️ Warning: avoid any
function process(data: any) { }

// ✅ Better: specific types
function process(data: UserData) { }

// ✅ Acceptable: explicit any with comment
function legacy(data: any) { // TODO: type this properly
}
```

#### Unused Imports
```typescript
// ❌ Error: unused import
import { useState, useEffect, useCallback } from 'react';

// ✅ Fix: remove unused imports
import { useState, useEffect } from 'react';
```

### Disabling Rules (Use Sparingly)
```typescript
// Disable next line
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const data: any = legacyFunction();

// Disable for entire file
/* eslint-disable @typescript-eslint/no-explicit-any */
```

## 📊 Current Status

After setup, the linting system found:
- **85+ issues** across the codebase (good - catching real problems!)
- **Auto-fixed** formatting and simple issues
- **Remaining issues** mostly unused variables and type safety improvements

This is exactly what we want - the linter is catching real code quality issues that make the codebase more maintainable.

## 🎯 Best Practices

### 1. **Run linting frequently**
```bash
npm run lint:fix    # Before each commit
npm run type-check  # Catch type issues early
```

### 2. **Follow naming conventions**
```typescript
// Unused parameters
function handler(_req: Request, res: Response) { }

// Unused variables (consider removing)
const _unusedData = processData();
```

### 3. **Type safety first**
```typescript
// Prefer specific types
interface UserData {
  id: string;
  email: string;
}

// Over generic any
const userData: any = {};
```

### 4. **Clean imports**
```typescript
// Group and organize imports
import { useState, useEffect } from 'react';
import { Button, Text } from '@mantine/core';
import { UserType } from '@yachtcash/shared';
```

## 🔄 IDE Integration

### VS Code Setup
Install these extensions for the best experience:

1. **ESLint** (`ms-vscode.vscode-eslint`)
2. **Prettier** (`esbenp.prettier-vscode`)
3. **TypeScript Hero** (optional)

#### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": ["javascript", "typescript", "typescriptreact"],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 🚀 Future Enhancements

### Planned Improvements
- [ ] **Commit message linting** (conventional commits)
- [ ] **Import sorting** automation
- [ ] **Bundle size** linting
- [ ] **Accessibility** linting for React components
- [ ] **Security** linting rules
- [ ] **Performance** linting rules

---

## 📋 Quick Reference

```bash
# Daily workflow commands
npm run lint:fix      # Fix and check code
npm run format        # Format all files
npm run type-check    # Check TypeScript

# Git workflow (automatic)
git add .             # Stage files
git commit -m "feat"  # Triggers pre-commit hooks
```

**🎯 Goal**: Maintain high code quality and consistency across the entire YachtCash platform as it scales to serve maritime companies worldwide! 
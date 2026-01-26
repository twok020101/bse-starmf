# AGENTS.md - Guidance for Agentic Coding Agents

This document provides guidelines for agents operating in this repository.

## Project Overview

`bse-starmf` is a TypeScript SDK for BSE StAR MF Mutual Fund API. It's a monorepo with pnpm workspaces containing a core package (`@bse-starmf/core`).

## Essential Commands

### Installation
```bash
cd /Users/twok/Projects/Open\ Source/BSEStarMf
pnpm install
```

### Building
```bash
# Build all packages
pnpm build

# Build only core package
pnpm --filter @bse-starmf/core build

# Build with watch mode
pnpm --filter @bse-starmf/core run dev
```

### Linting
```bash
# Lint all packages
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code with Prettier
pnpm format
```

### Testing
```bash
# Run all tests
pnpm test

# Run tests for core package only
pnpm --filter @bse-starmf/core test

# Run a single test file
pnpm --filter @bse-starmf/core test -- test/utils/transaction-no.spec.ts

# Run tests matching a pattern
pnpm --filter @bse-starmf/core test -- --testNamePattern="PasswordEncryptor"

# Run tests in watch mode
pnpm --filter @bse-starmf/core run test:watch

# Generate coverage report
pnpm --filter @bse-starmf/core run test:coverage
```

## Code Style Guidelines

### TypeScript Configuration
- **Strict mode**: Always enabled - no `any` type bypasses allowed
- **Target**: ES2020
- **Module**: ESNext with bundler resolution
- **Imports**: Use `import type` for type-only imports

### Naming Conventions
- **Classes**: PascalCase (`BSEClient`, `OrderService`)
- **Interfaces**: PascalCase (`PurchaseRequest`, `Session`)
- **Types**: PascalCase (`Environment`, `TransactionCode`)
- **Enums**: PascalCase (`BSEErrorCode`)
- **Functions/variables**: camelCase (`getSession`, `encryptPassword`)
- **Constants**: SCREAMING_SASE for config constants
- **Private members**: Prefix with underscore (`_authenticated`)
- **Unused parameters**: Prefix with underscore (`_params: Params`)

### Imports Ordering
1. External dependencies (alphabetical)
2. Relative imports (alphabetical by path)
3. Group by: types → utilities → services → errors

```typescript
import axios from 'axios';
import { z } from 'zod';

import { BSEConfig } from '../client/client.types';
import { SessionManager } from '../auth/session-manager';
import { BSEError } from '../errors/bse-error';
```

### Formatting
- **Print width**: 100 characters
- **Quotes**: Single quotes (`'text'`)
- **Trailing comma**: ES5 style
- **Semicolons**: Required
- **Arrow functions**: Avoid parens for single params (`x => x + 1`)

### Error Handling
- Use the `BSEError` class for all errors
- Error codes from `BSEErrorCode` enum
- Include `retryable` flag for network errors
- Never expose raw SOAP responses in user messages

```typescript
throw new BSEError('AUTH_001', 'User ID is required', {
  retryable: false,
  details: { field: 'userId' }
});
```

### Strict TypeScript Rules
- **No `any`**: ESLint warns, avoid entirely
- **No unused locals/parameters**: ESLint errors
- **No implicit returns**: Handle all code paths
- **No unchecked indexed access**: Use optional chaining or assertions
- **Explicit return types**: Required for exported functions

### Service Pattern
- Services extend `BaseService` for SOAP APIs
- HTTP-only services (Client, Mandate) use axios directly
- Constructor signature: `(config, sessionManager, encryptor, basePath)`
- Use `executeRequest<T>()` for SOAP calls

### Testing Requirements
- Unit tests for all utilities and services
- Coverage threshold: 80%
- Use descriptive test names: `should encrypt with AES-256 ECB mode`
- Mock external dependencies

### File Structure
```
packages/core/src/
├── client/           # Client classes and types
├── auth/             # Session management
├── encryption/       # Password encryption
├── errors/           # Error handling
├── services/         # API services
├── types/            # Type definitions
├── utils/            # Utilities (SOAP, validators)
└── config/           # Environment configs
```

### Common Patterns
- **Prefix unused params with underscore**: `async register(_params: Params)`
- **Use void to suppress unused variable warnings**: `void this._httpClient`
- **Default to 30 second timeout**: `config.timeout || 30000`
- **Environment detection**: `environment === 'production'`

### Security Notes
- Passwords must be encrypted with AES-256 before sending
- Never log credentials or raw passwords
- Use environment variables for configuration
- Validate all inputs with Zod validators

### Before Committing
1. Run `pnpm lint:fix` to auto-fix issues
2. Run `pnpm format` to format code
3. Run tests to verify no regressions
4. Build to ensure TypeScript compiles

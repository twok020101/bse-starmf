# Contributing to bse-starmf

Thank you for your interest in contributing to bse-starmf! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the maintainers.

## Getting Started

### Prerequisites

- Node.js 20 or higher
- pnpm 8 or higher
- Git

### Quick Start

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR-USERNAME/bse-starmf.git
cd bse-starmf

# Add upstream remote
git remote add upstream https://github.com/anomalyco/bse-starmf.git

# Install dependencies
pnpm install

# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ...

# Run tests to ensure everything works
pnpm test
```

## Development Setup

### Installation

```bash
# Install pnpm if not already installed
npm install -g pnpm

# Install project dependencies
pnpm install
```

### Available Scripts

```bash
# Build all packages
pnpm build

# Build with watch mode
pnpm --filter @bse-starmf/core run dev

# Run tests
pnpm test

# Run tests with coverage
pnpm --filter @bse-starmf/core run test:coverage

# Lint code
pnpm lint

# Auto-fix linting issues
pnpm lint:fix

# Format code
pnpm format

# Type-check
pnpm typecheck
```

### Environment Variables for Development

Create a `.env` file for local development:

```env
# BSE Test Environment Credentials (optional for testing)
BSE_TEST_USER_ID=your-test-user-id
BSE_TEST_MEMBER_ID=your-test-member-id
BSE_TEST_PASSWORD=your-test-password
BSE_TEST_CLIENT_CODE=your-test-client-code
```

## Coding Standards

### TypeScript Guidelines

- **Strict Mode**: Always enabled - no `any` type bypasses
- **Explicit Return Types**: Required for all exported functions
- **No Implicit Returns**: Handle all code paths
- **No Unchecked Indexed Access**: Use optional chaining or assertions

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Classes | PascalCase | `BSEClient`, `OrderService` |
| Interfaces | PascalCase | `PurchaseRequest`, `Session` |
| Types | PascalCase | `Environment`, `TransactionCode` |
| Enums | PascalCase | `BSEErrorCode` |
| Functions/Variables | camelCase | `getSession`, `encryptPassword` |
| Constants | SCREAMING_SNAKE_CASE | `MF_ORDER_EXPIRY` |
| Private Members | Prefix with underscore | `_authenticated`, `_sessionManager` |
| Unused Parameters | Prefix with underscore | `async register(_params: Params)` |

### Import Ordering

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

### Service Pattern

- Services extend `BaseService` for SOAP APIs
- HTTP-only services use axios directly
- Constructor signature: `(config, sessionManager, encryptor, basePath)`
- Use `executeRequest<T>()` for SOAP calls

### Error Handling

```typescript
throw new BSEError('AUTH_001', 'User ID is required', {
  retryable: false,
  details: { field: 'userId' }
});
```

### Security Requirements

- Passwords must be encrypted with AES-256 before sending
- Never log credentials or raw passwords
- Use environment variables for configuration
- Validate all inputs with Zod validators

## Testing Requirements

### Test Coverage Threshold

- Minimum 80% code coverage
- All critical paths must be tested

### Test Naming

Use descriptive test names:

```typescript
it('should encrypt with AES-256 ECB mode', () => {
  // ...
});

it('should throw BSEError when required fields are missing', () => {
  // ...
});
```

### Unit Tests

All utilities and services must have unit tests:

```typescript
describe('OrderService', () => {
  let service: OrderService;
  let mockSessionManager: jest.Mocked<SessionManager>;
  let mockEncryptor: jest.Mocked<PasswordEncryptor>;

  beforeEach(() => {
    // Setup mocks
  });

  it('should successfully place a purchase order', async () => {
    // Test implementation
  });
});
```

### Mocking

Mock all external dependencies:

- Mock HTTP responses
- Mock session manager
- Mock encryptor

## Submitting Changes

### Pull Request Process

1. **Create a Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**

   Follow coding standards and add tests for new functionality.

3. **Run Quality Checks**

   ```bash
   # Fix formatting
   pnpm format

   # Fix linting
   pnpm lint:fix

   # Run tests
   pnpm test

   # Build to ensure TypeScript compiles
   pnpm build
   ```

4. **Commit Your Changes**

   Use conventional commit messages:

   ```
   feat: add XSIP service implementation
   fix: resolve session refresh race condition
   docs: update API reference documentation
   test: add unit tests for PaymentService
   refactor: improve error handling in BaseService
   ```

5. **Push to Your Fork**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**

   Go to GitHub and create a pull request against the `main` branch.

### Pull Request Checklist

- [ ] Code follows project's coding standards
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] Changelog entry added
- [ ] No linting errors
- [ ] Build passes
- [ ] Commit messages follow conventions

### Pull Request Description Template

```markdown
## Description
Brief description of changes made

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature that causes existing functionality to change)
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated (if applicable)
- [ ] Manual testing performed (if applicable)

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published in downstream modules
```

## Reporting Issues

### Before Reporting

- Search existing issues to avoid duplicates
- Update to the latest version
- Check if the issue is related to your setup

### Issue Template

```markdown
## Bug Report

### Description
Clear description of the bug

### Steps to Reproduce
1. Step one
2. Step two
3. ...

### Expected Behavior
What should happen

### Actual Behavior
What actually happens

### Environment
- OS: [e.g., macOS 14.0]
- Node version: [e.g., v20.10.0]
- Package version: [e.g., @bse-starmf/core@1.0.0]
- BSE Environment: [test/production]

### Additional Context
Screenshots, stack traces, or relevant context
```

## Feature Requests

### Suggesting Features

1. Check if the feature already exists or is planned
2. Consider if the feature fits the project scope
3. Provide a clear use case and example

### Feature Request Template

```markdown
## Feature Request

### Use Case
Describe the problem or use case

### Proposed Solution
Describe the proposed solution

### Alternatives Considered
Describe any alternatives you've considered

### Additional Context
Screenshots, mockups, or relevant context
```

## Code Review Process

All pull requests require review before merging. Reviewers will check:

1. **Code Quality**: Clean, well-structured, follows conventions
2. **Tests**: Comprehensive, meaningful, passing
3. **Documentation**: Updated, clear, accurate
4. **Security**: No vulnerabilities, proper credential handling
5. **Performance**: No obvious performance issues

### Review Response Time

We aim to respond to all pull requests within 48-72 hours.

## Community

- **Discussions**: Use GitHub Discussions for questions and ideas
- **Issues**: Use GitHub Issues for bugs and feature requests
- **Discord**: Join our community server (link in README)

## Recognition

Contributors will be recognized in the project's README and changelog.

## Questions?

If you have questions, feel free to open an issue or start a discussion.

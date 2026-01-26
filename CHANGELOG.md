# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-26

### Added

- Initial release of `@bse-starmf/core` package
- Full TypeScript support with strict mode
- Complete BSE StAR MF API coverage:

#### Order Services
- Purchase orders (by amount or quantity)
- Redemption orders (by amount, quantity, or all units)
- SIP registration and cancellation
- XSIP (Extended SIP) operations
- Switch orders (fund-to-fund transfers)
- Spread orders (overnight transactions)
- STP (Systematic Transfer Plan) operations

#### Client Management
- Client registration (UCC creation)
- Client modification
- FATCA data upload
- CKYC registration

#### Mandate Services
- Mandate registration (NACH)
- Mandate status check
- Mandate shifting between accounts

#### Report Services
- Order status tracking
- Allotment statements
- Redemption statements

#### Payment Services
- Payment gateway URL generation
- Payment status check
- Single payment API

### Features
- Automatic session management with token refresh
- AES-256 password encryption as per BSE spec
- SOAP envelope construction and parsing
- Transaction number generation
- Zod validators for input validation
- Comprehensive error handling with typed error codes
- Debug mode for troubleshooting

### Dependencies
- `axios` - HTTP client
- `crypto-js` - AES encryption
- `zod` - Runtime validation
- `fast-xml-parser` - SOAP response parsing

### Dev Dependencies
- TypeScript 5.3
- Jest 29.7
- ESLint 8.55
- Prettier 3.1
- tsup 8.0

### Testing
- 73 unit and integration tests
- Mock BSE API responses
- 80% code coverage

### Documentation
- API Reference documentation
- Usage Examples guide
- JSDoc comments on all public APIs

---

## [Unreleased]

### Planned for v1.1.0
- NestJS module (`@bse-starmf/nestjs`)
- CLI tool (`bse-starmf-cli`)
- Additional payment methods
- Image upload services (AOF, Mandate, Cheque)

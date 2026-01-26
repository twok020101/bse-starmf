# Product Requirements Document: `bse-starmf` npm package

## 1. Executive Summary

Create a TypeScript-first npm package that provides a developer-friendly wrapper around BSE StAR MF's SOAP-based mutual fund transaction API. The package will support both NestJS modules and vanilla JavaScript/TypeScript usage, targeting fintech companies and independent developers building mutual fund investment platforms in India.

## 2. Problem Statement

### Current State
- BSE StAR MF provides only raw SOAP/XML APIs requiring developers to manually construct SOAP envelopes
- No TypeScript/JavaScript SDK exists with full type safety
- Developers must handle session management, password encryption, and error parsing manually
- Complex field validation and business rules scattered across 200+ page documentation

### Pain Points Identified
| Pain Point | Impact |
|------------|--------|
| SOAP envelope construction | High friction, error-prone |
| Session management (1hr expiry) | Connection state bugs |
| Password encryption (AES) | Security risks if implemented incorrectly |
| 40+ API endpoints | Steep learning curve |
| Mixed test/prod environments | Deployment complexity |
| Limited TypeScript support | No autocomplete, no compile-time validation |

### Market Gap
- Existing Python library (utkarshohm/mf-platform-bse) has 92 stars, 57 forks
- No npm package currently exists for BSE StAR MF
- Growing Indian fintech market demands modern TypeScript SDK

## 3. Target Users

| Segment | Use Case | Priority |
|---------|----------|----------|
| Fintech Startups | Trading platforms, robo-advisors, wealthtech apps | P0 |
| Mutual Fund Distributors (MFDs) | Client management, transaction processing | P0 |
| Independent Developers | Side projects, learning, personal investing | P1 |
| System Integrators | Building solutions for financial institutions | P1 |

### User Personas
- **Persona A (WealthTech Dev)**: Building a robo-advisor platform, needs SIP automation, portfolio tracking
- **Persona B (MFD Owner)**: Traditional distributor数字化转型, needs client onboarding, mandate management
- **Persona C (Indie Hacker)**: Building personal investment tracker, needs basic purchase/redemption

## 4. Goals & Non-Goals

### Goals (v1)
- Provide full TypeScript coverage with autocomplete for all API parameters
- Native NestJS module integration with dependency injection
- Automatic session management with token refresh
- Built-in password encryption utility (AES as per BSE spec)
- Support for test and production environments
- Comprehensive error handling with typed error codes
- Modular architecture allowing selective endpoint imports
- Response parsing returning typed objects (not raw SOAP)
- Tree-shaking support for minimal bundle size

### Non-Goals (v1)
- Web portal scraping for transaction status (out of scope for API-first design)
- Direct bank integration beyond BSE's payment gateway
- User interface components (React/Vue)
- Historical NAV data services
- Offline transaction queueing

## 5. API Coverage (v1 Extended)

### 5.1 Core Order Operations (P0)

| Endpoint | Method | Description |
|----------|--------|-------------|
| Authentication | `getPassword` | Session initialization with encrypted password |
| Lumpsum Purchase | `orderEntryParam` | One-time purchase transactions |
| Lumpsum Redemption | `orderEntryParam` | One-time redemption with amount/qty/all-units |
| SIP Registration | `sipOrderEntryParam` | Systematic Investment Plan setup |
| SIP Cancellation | `sipOrderEntryParam` | Cancel existing SIP |
| XSIP/ISIP | `xsipOrderEntryParam` | Extended SIP with mandate integration |
| Switch Order | `switchOrderEntryParam` | Fund-to-fund transfers |
| Spread Order | `spreadOrderEntryParam` | Overnight spread transactions |

### 5.2 Client Management (P0)

| Endpoint | Method | Description |
|----------|--------|-------------|
| UCC Registration | `ClientMaster/Registration` | New client creation (MFI/MFD) |
| UCC Modification | `ClientMaster/Registration` | Client detail updates |
| Enhanced STP | `STPRegistration` | Systematic Transfer Plan |
| Mandate Registration | `MandateRegistration` | Auto-debit setup |
| Mandate Status | `MandateStatus` | Check mandate approval state |
| Mandate Shift | `MandateShift` | Transfer mandate between accounts |

### 5.3 Additional Services (P1)

| Endpoint | Method | Description |
|----------|--------|-------------|
| FATCA Upload | `AdditionalServices` | KYC compliance data |
| CKYC Upload | `AdditionalServices` | Central KYC registration |
| Order Status | `OrderStatus` | Transaction processing status |
| Allotment Statement | `AllotmentStatement` | Confirmation of units allocated |
| Redemption Statement | `RedemptionStatement` | Redemption confirmation |
| Payment Status | `OrderPaymentStatus` | Payment gateway status |
| SIP Pause/Resume | `SIPPause` | Temporary SIP suspension |
| XSIP to SIP Shift | `XSIPToSIPShift` | Migrate between SIP types |

### 5.4 Payment Services (P1)

| Endpoint | Method | Description |
|----------|--------|-------------|
| Direct Payment URL | `DirectPaymentGateway` | Generate payment link |
| Payment Status | `PaymentStatus` | Check payment confirmation |
| Cheque Collection | `ChequeCollection` | Offline payment processing |
| Single Payment API | `SinglePaymentAPI` | Unified payment interface |

### 5.5 Image Upload Services (P2 - v1.1)

| Endpoint | Method | Description |
|----------|--------|-------------|
| AOF Image Upload | `AOFUpload` | Account Opening Form images |
| Scan Mandate Upload | `MandateImageUpload` | E-mandate paper images |
| Cheque Image Upload | `ChequeImageUpload` | NRI minor cheque images |

## 6. Developer Experience Requirements

### 6.1 Vanilla Usage (30 lines to first transaction)

```typescript
import { BSEClient } from 'bse-starmf';

const client = new BSEClient({
  userId: 'your-user-id',
  memberId: 'your-member-id',
  password: 'your-password',
  environment: 'test', // or 'production'
});

const purchase = await client.purchase({
  clientCode: 'UCC001',
  schemeCode: '123456',
  amount: 5000,
  buySell: 'P',
  buySellType: 'FRESH',
  dpTransaction: 'P',
  kycStatus: 'Y',
});

console.log(purchase.orderId);
```

### 6.2 NestJS Module

```typescript
// app.module.ts
@Module({
  imports: [BseStarmfModule.forRoot({
    userId: process.env.BSE_USER_ID,
    memberId: process.env.BSE_MEMBER_ID,
    password: process.env.BSE_PASSWORD,
    environment: 'production',
  })],
})
export class AppModule {}

// my.service.ts
@Injectable()
export class MyService {
  constructor(private readonly bse: BseStarmfService) {}

  async createPurchase(dto: PurchaseDto) {
    return this.bse.purchase(dto);
  }
}
```

### 6.3 CLI Tool (Bonus)

```bash
npx bse-starmf-cli init          # Initialize config
npx bse-starmf-cli transaction:status <orderId>  # Check status
npx bse-starmf-cli mandate:status <mandateId>    # Check mandate
npx bse-starmf-cli scheme:search <keyword>       # Search schemes
```

## 7. Error Handling Requirements

### 7.1 Typed Error Codes

```typescript
enum BSEErrorCode {
  INVALID_USER_ID = 'AUTH_001',
  PASSWORD_BLANK = 'AUTH_002',
  SESSION_EXPIRED = 'AUTH_003',
  INSUFFICIENT_BALANCE = 'TXN_001',
  INVALID_SCHEME = 'TXN_002',
  USER_DISABLED = 'AUTH_005',
  MEMBER_SUSPENDED = 'AUTH_008',
  PASSWORD_EXPIRED = 'AUTH_009',
}

class BSEError extends Error {
  code: BSEErrorCode;
  rawResponse?: string;
  retryable: boolean;
  details?: Record<string, unknown>;
}
```

### 7.2 Standard Error Messages

| Error Message | Code | Retryable |
|---------------|------|-----------|
| USER ID SHOULD NOT BE BLANK | AUTH_001 | No |
| MEMBER ID SHOULD NOT BE BLANK | AUTH_002 | No |
| PASSWORD SHOULD NOT BE BLANK | AUTH_003 | No |
| PASSKEY SHOULD NOT BE BLANK | AUTH_004 | No |
| USER IS DISABLED. CONTACT ADMIN | AUTH_005 | No |
| INVALID ACCOUNT INFORMATION | AUTH_006 | No |
| INVALID USER ID | AUTH_007 | No |
| THE MEMBER IS SUSPENDED. CONTACT ADMIN | AUTH_008 | No |
| PASSWORD EXPIRED | AUTH_009 | No |
| USER NOT EXISTS | AUTH_010 | No |
| ORDER REJECTED | TXN_003 | No |
| INSUFFICIENT UNITS | TXN_004 | No |

## 8. Security Requirements

| Concern | Mitigation |
|---------|------------|
| Credential storage | Env vars only, no hardcoding |
| Session tokens | In-memory storage, auto-expiry |
| Password encryption | AES-256 as per BSE spec |
| Network security | HTTPS enforcement, certificate pinning |
| Input validation | Schema validation (Zod) |
| Audit logging | Optional debug mode with masking |
| XSS/CSRF | N/A (server-side SDK) |

## 9. Performance Requirements

| Metric | Target |
|--------|--------|
| Time to first request (cached session) | < 100ms |
| Session refresh overhead | < 50ms |
| Request latency (BSE API) | < 2s typical |
| Bundle size (tree-shaken) | < 50KB gzipped |
| Tree-shaking support | Full (ESM) |
| Concurrent requests | Unlimited (connection pooling) |

## 10. Testing Requirements

### 10.1 Test Pyramid
- **Unit Tests**: 80%+ coverage on core utilities
- **Integration Tests**: Full flow against BSE test environment
- **E2E Tests**: Critical user journeys

### 10.2 Test Matrix

| Environment | Network | Coverage |
|-------------|---------|----------|
| Mock Server | Offline | Unit tests |
| BSE Demo | Online | Integration tests |
| CI Pipeline | Cached | Regression tests |

### 10.3 Required Test Cases
- Authentication flow (success/failure)
- Purchase with amount
- Purchase with quantity
- Redemption (full/partial)
- SIP registration
- SIP cancellation
- Session expiration handling
- Invalid credentials handling
- Network timeout handling
- Concurrent requests

## 11. Dependencies

### Core Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| axios | ^1.6.0 | HTTP client |
| crypto-js | ^4.2.0 | AES encryption |
| zod | ^3.22.0 | Runtime validation |

### Dev Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| TypeScript | ^5.3.0 | Type system |
| Rollup | ^4.6.0 | Bundling |
| Jest | ^29.7.0 | Testing |
| ESLint | ^8.55.0 | Linting |
| prettier | ^3.1.0 | Formatting |

## 12. Versioning & Release Plan

### Semantic Versioning
- **Major**: Breaking API changes
- **Minor**: New features, non-breaking
- **Patch**: Bug fixes, security patches

### Release Schedule
| Phase | Timeline | Deliverables |
|-------|----------|--------------|
| MVP | Week 1-2 | Core client, auth, orders |
| Extended | Week 3-4 | Client management, mandates |
| Polish | Week 5 | Tests, docs, CLI tool |
| Release | Week 6 | npm publish v1.0.0 |

## 13. Success Metrics

| Metric | Target (6 months) |
|--------|-------------------|
| npm downloads/week | 1,000 |
| GitHub stars | 200 |
| Issue response time | < 24 hours |
| TypeScript coverage | > 90% |
| Test coverage | > 80% |
| Documentation completeness | 100% |

## 14. Documentation Requirements

### Required Documentation
- [ ] Getting Started Guide
- [ ] API Reference (auto-generated from JSDoc)
- [ ] Examples Gallery
- [ ] Migration Guide (from Python library)
- [ ] Error Code Reference
- [ ] NestJS Integration Guide
- [ ] Security Best Practices
- [ ] Contributing Guide

### Example Code Required
```typescript
// Purchase example
// Redemption example  
// SIP registration example
// Client creation example
// Mandate setup example
// Error handling patterns
// Session management patterns
// Transaction status check
```

## 15. Risk Analysis

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| BSE API changes | High | Medium | Version pinning, adapter pattern |
| Security vulnerabilities | High | Low | Security audits, dependency updates |
| Poor adoption | Medium | Medium | Early community engagement |
| Test environment instability | High | Medium | Mock responses, resilient tests |

## 16. Open Questions

1. Should we support callbacks vs promises only?
2. Do we need webhook support for async notifications?
3. Should we include built-in retry logic with exponential backoff?
4. Do we need support for multiple credentials (multi-tenant)?
5. Should we include a local development mock server?

---

**Document Version**: 1.0  
**Created**: January 2026  
**Status**: Draft - Awaiting Approval

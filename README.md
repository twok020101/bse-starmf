# bse-starmf

A TypeScript-first SDK for BSE StAR MF (Bombay Stock Exchange Systematic Transaction And Registration Mutual Fund) API. Built for fintech companies, mutual fund distributors, and developers building mutual fund investment platforms in India.

[![npm version](https://img.shields.io/npm/v/@bse-starmf/core)](https://www.npmjs.com/package/@bse-starmf/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

## Features

- **TypeScript-First**: Full type safety with autocomplete for all API parameters
- **Complete API Coverage**: All BSE StAR MF endpoints implemented
- **Auto Session Management**: Automatic token refresh and session lifecycle handling
- **Built-in Encryption**: AES-256 password encryption as per BSE specification
- **Comprehensive Error Handling**: Typed error codes with retry logic
- **Test & Production Support**: Separate configurations for BSE demo and production environments
- **Tree-Shakeable**: ESM build for minimal bundle size (~22KB gzipped)

## Supported Operations

### Order Services
- Purchase (Lumpsum investment)
- Redemption (Full/Partial)
- SIP Registration & Cancellation
- XSIP (Extended SIP) Registration & Cancellation
- Switch Orders (Fund-to-fund transfers)
- Spread Orders (Overnight transactions)

### Client Management
- Client Registration (UCC)
- Client Modification
- Mandate Registration, Status & Shift
- STP (Systematic Transfer Plan) Registration & Cancellation

### Additional Services
- Order Status Tracking
- Allotment Statements
- Redemption Statements
- Payment Gateway Integration
- FATCA/CKYC Upload
- SIP Pause/Resume

## Quick Start

### Installation

```bash
pnpm add @bse-starmf/core
# or
npm install @bse-starmf/core
# or
yarn add @bse-starmf/core
```

### Basic Usage

```typescript
import { BSEClient } from '@bse-starmf/core';

const client = new BSEClient({
  userId: 'your-bse-user-id',
  memberId: 'your-member-id',
  password: 'your-password',
  environment: 'test', // Use 'production' for live environment
});

await client.authenticate();

// Purchase order
const purchase = await client.orders.purchase({
  clientCode: 'UCC001',
  schemeCode: '119603',
  amount: 5000,
});

console.log(`Order ID: ${purchase.orderId}`);

// Register SIP
const sip = await client.sip.register({
  clientCode: 'UCC001',
  schemeCode: '119603',
  amount: 1000,
  frequency: 'MONTHLY',
  startDate: '01/02/2026',
  noOfInstallments: 12,
});

console.log(`SIP Registration ID: ${sip.sipRegId}`);
```

## Configuration

### BSEClient Options

```typescript
import { BSEClient, BSEConfig } from '@bse-starmf/core';

const config: BSEConfig = {
  userId: string,           // BSE User ID (required)
  memberId: string,         // BSE Member ID (required)
  password: string,         // BSE Password (required)
  passkey?: string,         // Encryption passkey (auto-generated if not provided)
  environment: 'test' | 'production',
  baseUrl?: string,         // Override BSE API base URL
  timeout?: number,         // Request timeout in ms (default: 30000)
  retries?: number,         // Number of retries on failure (default: 3)
  debug?: boolean,          // Enable debug logging (default: false)
};
```

### Environment Variables

```typescript
import { BSEClient } from '@bse-starmf/core';

const client = new BSEClient({
  userId: process.env.BSE_USER_ID!,
  memberId: process.env.BSE_MEMBER_ID!,
  password: process.env.BSE_PASSWORD!,
  passkey: process.env.BSE_PASSKEY,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'test',
  timeout: 30000,
  retries: 3,
});
```

## API Reference

### Orders

```typescript
// Purchase
const purchase = await client.orders.purchase({
  clientCode: 'UCC001',
  schemeCode: '119603',
  amount: 5000,
  // Optional parameters
  folioNumber?: '1234567890',
  buySellType?: 'FRESH' | 'ADDITIONAL',
  dpTransaction?: 'P' | 'N' | 'C',
  remarks?: 'Systematic investment',
});

// Redemption
const redemption = await client.orders.redeem({
  clientCode: 'UCC001',
  schemeCode: '119603',
  amount: 5000,
  // Or specify quantity
  quantity?: 100,
  // Or redeem all units
  allRedeem?: 'Y',
});

// SIP
const sip = await client.sip.register({
  clientCode: 'UCC001',
  schemeCode: '119603',
  amount: 1000,
  frequency: 'MONTHLY' | 'QUARTERLY' | 'WEEKLY',
  startDate: '01/02/2026',
  noOfInstallments: 12,
  endDate?: '01/02/2028', // Required for DAILY frequency
});

// Cancel SIP
await client.sip.cancel(sipRegId);
```

### XSIP (Extended SIP with Mandate)

```typescript
const xsip = await client.xsip.register({
  clientCode: 'UCC001',
  schemeCode: '119603',
  amount: 2000,
  frequency: 'MONTHLY',
  startDate: '15/02/2026',
  noOfInstallments: 24,
  xsipMandateId: 'MANDATE123', // Linked mandate
});

await client.xsip.cancel(xsip.sipRegId);
```

### Switch Orders

```typescript
const switchOrder = await client.switch.switchOrder({
  clientCode: 'UCC001',
  schemeCode: '119603',           // Source scheme
  switchSchemeCode: '119554',     // Target scheme
  amount: 10000,
  // Or use quantity
  quantity?: 500,
  folioNumber?: '1234567890',
});
```

### Payment Gateway

```typescript
// Generate payment URL
const payment = await client.payment.generatePaymentUrl({
  orderId: purchase.orderId,
  amount: 5000,
  clientCode: 'UCC001',
  returnUrl: 'https://yourapp.com/payment/callback',
  paymentMode: 'NETBANKING' | 'UPI' | 'DEBITCARD',
  bankCode?: 'HDFC',
});

// Check payment status
const status = await client.payment.getPaymentStatus({
  transactionId: payment.transactionId,
});
```

### Mandate Management

```typescript
// Register mandate
const mandate = await client.mandates.register({
  clientCode: 'UCC001',
  mandateType: 'NACH' | 'ECS' | 'MICR',
  bankName: 'HDFC Bank',
  branchName: 'Main Branch',
  accountNumber: '1234567890',
  accountType: 'SB' | 'CA' | 'CURRENT' | 'NRE' | 'NRO',
  ifscCode: 'HDFC0001234',
  startDate: '01/02/2026',
  endDate: '01/02/2031',
  amount: 50000,
  maxAmount: 100000,
});

// Check mandate status
const status = await client.mandates.getStatus({
  mandateId: mandate.mandateId,
});

// Shift mandate
await client.mandates.shift({
  mandateId: mandate.mandateId,
  newClientCode: 'UCC002',
  newBankAccountNo: '0987654321',
});
```

### Reports

```typescript
// Check order status
const orderStatus = await client.reports.getOrderStatus({
  orderId: 1234567,
});

// Get allotment statement
const allotment = await client.reports.getAllotmentStatement({
  orderId: 1234567,
  clientCode: 'UCC001',
});

// Get redemption statement
const redemptionStmt = await client.reports.getRedemptionStatement({
  orderId: 1234567,
  clientCode: 'UCC001',
});
```

## Error Handling

All errors are thrown as `BSEError` instances with typed error codes:

```typescript
import { BSEClient, BSEError, BSEErrorCode } from '@bse-starmf/core';

try {
  const purchase = await client.orders.purchase({ /* ... */ });
} catch (error) {
  if (error instanceof BSEError) {
    console.error(`Error Code: ${error.code}`);
    console.error(`Message: ${error.message}`);
    console.error(`Retryable: ${error.retryable}`);
    console.error(`Details:`, error.details);
  }
}
```

### Error Codes

| Code | Description | Retryable |
|------|-------------|-----------|
| AUTH_001 | User ID should not be blank | No |
| AUTH_002 | Member ID should not be blank | No |
| AUTH_003 | Password should not be blank | No |
| AUTH_005 | User is disabled | No |
| AUTH_007 | Invalid User ID | No |
| AUTH_008 | Member is suspended | No |
| TXN_001 | Insufficient balance | No |
| TXN_002 | Invalid scheme | No |
| TXN_003 | Order rejected | No |
| TXN_004 | Insufficient units | No |
| SESSION_TIMEOUT | Session expired | Yes |
| NETWORK_ERROR | Network failure | Yes |
| SERVER_ERROR | BSE server error | Yes |

## Security Best Practices

1. **Never hardcode credentials**: Use environment variables
2. **Enable debug mode only in development**: Never in production
3. **Use HTTPS**: Always use secure connections
4. **Rotate passkeys periodically**: Change encryption keys regularly
5. **Validate inputs**: Use the built-in validators
6. **Monitor logs**: Enable logging for auditing

```typescript
const client = new BSEClient({
  userId: process.env.BSE_USER_ID!,
  memberId: process.env.BSE_MEMBER_ID!,
  password: process.env.BSE_PASSWORD!,
  passkey: process.env.BSE_PASSKEY,
  environment: 'production',
  debug: false, // Disable in production
  timeout: 30000,
});
```

## Testing

### Run Tests

```bash
# Run all tests
pnpm test

# Run specific test
pnpm test -- test/services/order.service.spec.ts

# Run with coverage
pnpm test --coverage

# Watch mode
pnpm run test:watch
```

### Linting & Formatting

```bash
# Lint code
pnpm lint

# Auto-fix issues
pnpm lint:fix

# Format with Prettier
pnpm format
```

### Build

```bash
# Build all packages
pnpm build

# Build core package only
pnpm --filter @bse-starmf/core build

# Watch mode
pnpm --filter @bse-starmf/core run dev
```

## Development

### Prerequisites

- Node.js 20+
- pnpm 8+

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/bse-starmf.git
cd bse-starmf

# Install dependencies
pnpm install

# Run tests
pnpm test
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: Report bugs and request features via [GitHub Issues](https://github.com/anomalyco/bse-starmf/issues)
- **Documentation**: See our [docs/](docs/) directory for detailed documentation
- **BSE API Docs**: [BSE StAR MF API Documentation](https://www.bseindia.com/StarMF/StarMFAPI.html)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

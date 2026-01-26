# Usage Examples

## Quick Start

### Installation

```bash
npm install @bse-starmf/core
```

### Basic Usage

```typescript
import { BSEClient } from '@bse-starmf/core';

const client = new BSEClient({
  userId: 'your-bse-user-id',
  memberId: 'your-bse-member-id',
  password: 'your-password',
  environment: 'test',  // Use 'production' for live API
});

// Authenticate
await client.authenticate();

// Place a purchase order
const purchase = await client.orders.purchase({
  clientCode: 'UCC001',
  schemeCode: '119603',
  amount: 5000,
});

console.log(`Order placed! ID: ${purchase.orderId}`);
```

---

## Purchase Orders

### Purchase with Amount

```typescript
const purchase = await client.orders.purchase({
  clientCode: 'UCC001',
  schemeCode: '119603',  // HDFC Mid-Cap Opportunities Fund
  amount: 5000,
  buySellType: 'FRESH',
  remarks: 'Monthly investment',
});

console.log(`Order ID: ${purchase.orderId}`);
console.log(`Status: ${purchase.bseRemarks}`);
```

### Purchase with Quantity

```typescript
const purchase = await client.orders.purchase({
  clientCode: 'UCC001',
  schemeCode: '119603',
  quantity: 28.456,  // Purchase specific number of units
});

console.log(`Order ID: ${purchase.orderId}`);
```

### Purchase with Existing Folio

```typescript
const purchase = await client.orders.purchase({
  clientCode: 'UCC001',
  schemeCode: '119603',
  amount: 10000,
  folioNumber: '12345678',  // Add units to existing folio
  subBrokerCode: 'SB001',
});
```

---

## Redemption Orders

### Redeem by Amount

```typescript
const redemption = await client.orders.redeem({
  clientCode: 'UCC001',
  schemeCode: '119603',
  amount: 5000,
});

console.log(`Redemption ID: ${redemption.orderId}`);
```

### Redeem by Quantity

```typescript
const redemption = await client.orders.redeem({
  clientCode: 'UCC001',
  schemeCode: '119603',
  quantity: 28.456,
});
```

### Redeem All Units

```typescript
const redemption = await client.orders.redeem({
  clientCode: 'UCC001',
  schemeCode: '119603',
  allRedeem: 'Y',  // Redeem all units in the folio
});
```

---

## SIP Operations

### Register Monthly SIP

```typescript
const sip = await client.sip.register({
  clientCode: 'UCC001',
  schemeCode: '119603',
  amount: 1000,
  frequency: 'MONTHLY',
  startDate: '01/02/2026',  // First installment date
  noOfInstallments: 12,     // Number of installments
});

console.log(`SIP Registered! ID: ${sip.sipRegId}`);
console.log(`First order: ${sip.firstOrderTodayOrderNo || 'Scheduled for start date'}`);
```

### Register Quarterly SIP

```typescript
const sip = await client.sip.register({
  clientCode: 'UCC001',
  schemeCode: '119603',
  amount: 3000,
  frequency: 'QUARTERLY',
  startDate: '15/03/2026',
  noOfInstallments: 8,
});
```

### Cancel SIP

```typescript
const result = await client.sip.cancel(12345678);  // SIP registration ID
console.log(`SIP Cancelled: ${result.bseRemarks}`);
```

---

## Client Management

### Register New Client

```typescript
const clientReg = await client.clients.register({
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '15/01/1990',
  pan: 'ABCDE1234F',
  address1: '123 Main Street',
  city: 'Mumbai',
  pinCode: '400001',
  state: 'Maharashtra',
  country: 'India',
  mobile: '9876543210',
  email: 'john.doe@example.com',
  taxStatus: '01',  // Individual
  accountType: 'NRO',
  clientHolding: 'S',  // Single
  dividendPayMode: 'P',  // Payout
  bankName: 'HDFC Bank',
  bankBranch: 'Main Branch',
  bankAccountNo: '1234567890',
  bankAccountType: 'SAVINGS',
  ifscCode: 'HDFC0001234',
});

console.log(`Client Registered! UCC: ${clientReg.ucc}`);
```

### Modify Client Details

```typescript
const result = await client.clients.modify({
  clientCode: 'UCC001',
  firstName: 'John',
  lastName: 'Doe',
  // ... other fields to update
  address1: '456 New Street',
  city: 'Mumbai',
  pinCode: '400002',
});
```

---

## Mandate Operations

### Register Mandate

```typescript
const mandate = await client.mandates.register({
  clientCode: 'UCC001',
  mandateType: 'NACH',
  bankName: 'HDFC Bank',
  bankBranch: 'Main Branch',
  bankAccountNo: '1234567890',
  bankAccountType: 'SAVINGS',
  ifscCode: 'HDFC0001234',
  startDate: '01/02/2026',
  endDate: '31/01/2029',
  maxAmount: 100000,
  frequency: 'MONTHLY',
  debtorName: 'John Doe',
});

console.log(`Mandate ID: ${mandate.mandateId}`);
console.log(`Status: ${mandate.bseRemarks}`);
```

### Check Mandate Status

```typescript
const status = await client.mandates.getStatus('789456123');

console.log(`Mandate Status: ${status.mandateStatus}`);
if (status.mandateStatus === 'ACTIVE') {
  console.log(`Valid from: ${status.effectiveFrom}`);
  console.log(`Valid till: ${status.validTill}`);
}
```

---

## Reports

### Check Order Status

```typescript
const status = await client.reports.getOrderStatus(12345678);

console.log(`Order Status: ${status.orderStatus}`);
console.log(`Remarks: ${status.remarks}`);
```

### Get Allotment Statement

```typescript
const statement = await client.reports.getAllotmentStatement(12345678);

console.log(`Alloted Units: ${statement.allotedUnits}`);
console.log(`Alloted NAV: ${statement.allotedNAV}`);
console.log(`Processing Date: ${statement.processingDate}`);
```

---

## Error Handling

### Basic Error Handling

```typescript
try {
  const purchase = await client.orders.purchase({
    clientCode: 'UCC001',
    schemeCode: '119603',
    amount: 5000,
  });
  console.log(`Order ID: ${purchase.orderId}`);
} catch (error) {
  if (error instanceof BSEError) {
    console.error(`Error ${error.code}: ${error.message}`);
  }
}
```

### Handling Retryable Errors

```typescript
async function placeOrderWithRetry(params: PurchaseRequest, maxRetries = 3): Promise<PurchaseResponse> {
  let lastError: BSEError | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await client.orders.purchase(params);
    } catch (error) {
      if (error instanceof BSEError && error.retryable) {
        lastError = error;
        console.log(`Retry ${attempt}/${maxRetries}: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));  // Exponential backoff
      } else {
        throw error;  // Non-retryable error
      }
    }
  }

  throw lastError;
}
```

### Validation Errors

```typescript
import { validatePurchaseParams } from '@bse-starmf/core';

function validateOrder(amount?: number, quantity?: number, allRedeem?: string): void {
  validatePurchaseParams({
    amount,
    quantity,
    allRedeem,
  });
}

// This will throw an error
validateOrder(undefined, undefined, 'N');  // Error: Either amount, quantity, or allRedeem=Y must be specified

// This is valid
validateOrder(5000, undefined, undefined);  // Valid
```

---

## Session Management

### Auto-Refresh

The SDK automatically handles session refresh when the token expires (1 hour for MFOrder API).

```typescript
const client = new BSEClient({
  userId: 'your-user-id',
  memberId: 'your-member-id',
  password: 'your-password',
  environment: 'test',
});

await client.authenticate();

// Multiple operations - SDK handles session refresh automatically
const purchase1 = await client.orders.purchase({ /* ... */ });
const purchase2 = await client.orders.purchase({ /* ... */ });
const purchase3 = await client.orders.purchase({ /* ... */ });

// Disconnect when done
await client.disconnect();
```

---

## Configuration Options

### Environment Configuration

```typescript
// Test environment
const testClient = new BSEClient({
  userId: 'test-user-id',
  memberId: 'test-member-id',
  password: 'test-password',
  environment: 'test',  // Uses https://bsestarmfdemo.bseindia.com
});

// Production environment
const prodClient = new BSEClient({
  userId: 'prod-user-id',
  memberId: 'prod-member-id',
  password: 'prod-password',
  environment: 'production',  // Uses https://bsestarmf.bseindia.com
});
```

### Custom Timeout

```typescript
const client = new BSEClient({
  userId: 'your-user-id',
  memberId: 'your-member-id',
  password: 'your-password',
  environment: 'test',
  timeout: 60000,  // 60 seconds
  retries: 5,      // 5 retry attempts
});
```

### Debug Mode

```typescript
const client = new BSEClient({
  userId: 'your-user-id',
  memberId: 'your-member-id',
  password: 'your-password',
  environment: 'test',
  debug: true,  // Enable debug logging
});
```

---

## Security Best Practices

### Environment Variables

```typescript
import dotenv from 'dotenv';
dotenv.config();

const client = new BSEClient({
  userId: process.env.BSE_USER_ID!,
  memberId: process.env.BSE_MEMBER_ID!,
  password: process.env.BSE_PASSWORD!,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'test',
});
```

### Never Log Credentials

```typescript
// BAD - Never do this
console.log('Password:', password);

// GOOD - Use secure logging
console.log('Authenticating user:', userId);
```

### Use Passkey for Encryption

```typescript
// Auto-generated passkey (recommended)
const client = new BSEClient({
  userId: 'your-user-id',
  memberId: 'your-member-id',
  password: 'your-password',
  passkey: undefined,  // Auto-generated
});

// Custom passkey (for multi-instance scenarios)
const client1 = new BSEClient({
  userId: 'user1',
  memberId: 'member1',
  password: 'pass1',
  passkey: 'custom-passkey-1',
});

const client2 = new BSEClient({
  userId: 'user2',
  memberId: 'member2',
  password: 'pass2',
  passkey: 'custom-passkey-1',  // Same passkey for shared encryption
});
```

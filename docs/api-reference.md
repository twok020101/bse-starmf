# API Reference

## BSEClient

The main client class for interacting with BSE StAR MF API.

### Constructor

```typescript
new BSEClient(config: BSEClientOptions): BSEClient
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| config | `BSEClientOptions` | Yes | Configuration object |

**BSEClientOptions:**

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| userId | `string` | Yes | - | BSE user ID |
| memberId | `string` | Yes | - | BSE member ID |
| password | `string` | Yes | - | BSE password |
| passkey | `string` | No | Auto-generated | Encryption passkey |
| environment | `'test' \| 'production'` | No | `'test'` | API environment |
| baseUrl | `string` | No | - | Custom base URL |
| timeout | `number` | No | `30000` | Request timeout in ms |
| retries | `number` | No | `3` | Number of retry attempts |
| debug | `boolean` | No | `false` | Enable debug mode |
| encryptorOptions | `EncryptorOptions` | No | - | Encryption options |

### Methods

#### authenticate()

```typescript
async authenticate(): Promise<void>
```

Authenticates with the BSE API using encrypted credentials.

**Example:**
```typescript
const client = new BSEClient({
  userId: 'your-user-id',
  memberId: 'your-member-id',
  password: 'your-password',
  environment: 'test',
});

await client.authenticate();
```

#### disconnect()

```typescript
async disconnect(): Promise<void>
```

Clears the current session and disconnects from the BSE API.

**Example:**
```typescript
await client.disconnect();
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| orders | `OrderService` | Order operations (purchase, redemption) |
| sip | `SIPService` | SIP registration and cancellation |
| xsip | `XSIPService` | Extended SIP operations |
| switch | `SwitchService` | Fund switching operations |
| spread | `SpreadService` | Spread order operations |
| clients | `ClientService` | Client registration and modification |
| mandates | `MandateService` | Mandate registration and management |
| stp | `STPService` | Systematic Transfer Plan operations |
| reports | `ReportService` | Order status and statements |
| payment | `PaymentService` | Payment gateway operations |
| additional | `AdditionalService` | FATCA, CKYC, and other services |

---

## OrderService

### purchase()

```typescript
async purchase(params: PurchaseRequest): Promise<PurchaseResponse>
```

Places a purchase order for a mutual fund scheme.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| params | `PurchaseRequest` | Yes | Purchase order parameters |

**PurchaseRequest:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| clientCode | `string` | Yes | Client UCC code |
| schemeCode | `string` | Yes | BSE scheme code |
| amount | `number` | Conditional* | Purchase amount in INR |
| quantity | `number` | Conditional* | Number of units to purchase |
| buySellType | `'FRESH' \| 'ADDITIONAL'` | No | Order type (default: FRESH) |
| dpTransaction | `'P' \| 'N' \| 'C'` | No | DPTxn (default: P) |
| folioNumber | `string` | No | Existing folio number |
| remarks | `string` | No | Order remarks |
| subBrokerCode | `string` | No | Sub-broker code |
| euin | `string` | No | EUIN number |
| euinDeclaration | `'Y' \| 'N'` | No | EUIN declaration |
| kycStatus | `'Y' \| 'N'` | No | KYC status (default: Y) |
| dpcFlag | `'Y' \| 'N'` | No | DPC flag (default: Y) |

*Either `amount` or `quantity` must be provided.

**PurchaseResponse:**

| Property | Type | Description |
|----------|------|-------------|
| transCode | `TransactionCode` | Transaction code |
| transNo | `string` | Transaction number |
| orderId | `number` | BSE order ID |
| userId | `string` | User ID |
| memberId | `string` | Member ID |
| clientCode | `string` | Client code |
| bseRemarks | `string` | BSE response message |
| successFlag | `'0' \| '1'` | Success (0) or failure (1) |

**Example:**
```typescript
const purchase = await client.orders.purchase({
  clientCode: 'UCC001',
  schemeCode: '119603',
  amount: 5000,
  buySellType: 'FRESH',
});

console.log(`Order ID: ${purchase.orderId}`);
console.log(`Status: ${purchase.bseRemarks}`);
```

### redeem()

```typescript
async redeem(params: RedeemRequest): Promise<RedeemResponse>
```

Places a redemption order for a mutual fund scheme.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| params | `RedeemRequest` | Yes | Redemption order parameters |

**RedeemRequest:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| clientCode | `string` | Yes | Client UCC code |
| schemeCode | `string` | Yes | BSE scheme code |
| amount | `number` | Conditional* | Redemption amount in INR |
| quantity | `number` | Conditional* | Number of units to redeem |
| allRedeem | `'Y' \| 'N'` | No | Redeem all units (default: N) |
| folioNumber | `string` | No | Existing folio number |
| remarks | `string` | No | Order remarks |

*Either `amount`, `quantity`, or `allRedeem='Y'` must be provided.

**Example:**
```typescript
const redemption = await client.orders.redeem({
  clientCode: 'UCC001',
  schemeCode: '119603',
  amount: 5000,
});

console.log(`Redemption ID: ${redemption.orderId}`);
```

---

## SIPService

### register()

```typescript
async register(params: SIPRequest): Promise<SIPResponse>
```

Registers a new Systematic Investment Plan (SIP).

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| params | `SIPRequest` | Yes | SIP registration parameters |

**SIPRequest:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| clientCode | `string` | Yes | Client UCC code |
| schemeCode | `string` | Yes | BSE scheme code |
| amount | `number` | Yes | SIP installment amount |
| frequency | `'MONTHLY' \| 'QUARTERLY' \| 'WEEKLY'` | Yes | SIP frequency |
| startDate | `string` | Yes | First installment date (DD/MM/YYYY) |
| noOfInstallments | `number` | Yes | Number of installments |
| endDate | `string` | No | End date (required for daily SIP) |
| folioNumber | `string` | No | Existing folio number |
| subBrokerCode | `string` | No | Sub-broker code |
| euin | `string` | No | EUIN number |
| euinDeclaration | `'Y' \| 'N'` | No | EUIN declaration |
| remarks | `string` | No | SIP remarks |

**Example:**
```typescript
const sip = await client.sip.register({
  clientCode: 'UCC001',
  schemeCode: '119603',
  amount: 1000,
  frequency: 'MONTHLY',
  startDate: '01/02/2026',
  noOfInstallments: 12,
});

console.log(`SIP ID: ${sip.sipRegId}`);
```

### cancel()

```typescript
async cancel(sipRegId: number): Promise<SIPResponse>
```

Cancels an existing SIP.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sipRegId | `number` | Yes | SIP registration ID to cancel |

**Example:**
```typescript
const result = await client.sip.cancel(12345678);
console.log(`SIP cancelled: ${result.bseRemarks}`);
```

---

## ClientService

### register()

```typescript
async register(params: ClientRegistrationRequest): Promise<ClientRegistrationResponse>
```

Registers a new client with BSE.

### modify()

```typescript
async modify(params: ClientModificationRequest): Promise<ClientRegistrationResponse>
```

Modifies existing client details.

---

## MandateService

### register()

```typescript
async register(params: MandateRegistrationRequest): Promise<MandateRegistrationResponse>
```

Registers a new mandate for auto-debit.

### getStatus()

```typescript
async getStatus(mandateId: string): Promise<MandateStatusResponse>
```

Checks the status of a mandate.

### shift()

```typescript
async shift(params: MandateShiftRequest): Promise<MandateShiftResponse>
```

Shifts a mandate to a different bank account.

---

## ReportService

### getOrderStatus()

```typescript
async getOrderStatus(orderId: number): Promise<OrderStatusResponse>
```

Checks the status of an order.

### getAllotmentStatement()

```typescript
async getAllotmentStatement(orderId: number): Promise<AllotmentStatementResponse>
```

Gets the allotment statement for a purchase order.

### getRedemptionStatement()

```typescript
async getRedemptionStatement(orderId: number): Promise<RedemptionStatementResponse>
```

Gets the redemption statement for a redemption order.

---

## Error Handling

All methods throw `BSEError` on failure.

### BSEError Properties

| Property | Type | Description |
|----------|------|-------------|
| code | `BSEErrorCode` | Error code |
| message | `string` | Error message |
| retryable | `boolean` | Whether the error is retryable |
| rawResponse | `string` | Raw API response |
| details | `Record<string, unknown>` | Additional error details |

### Common Error Codes

| Code | Message | Retryable |
|------|---------|-----------|
| `AUTH_001` | User ID is required | No |
| `AUTH_003` | Password is required | No |
| `AUTH_005` | User is disabled | No |
| `AUTH_007` | Invalid User ID | No |
| `AUTH_008` | Member is suspended | No |
| `TXN_001` | Insufficient balance | No |
| `TXN_002` | Invalid scheme | No |
| `TXN_003` | Order rejected | No |
| `TXN_004` | Insufficient units | No |
| `NET_001` | Network error | Yes |

**Example:**
```typescript
try {
  const purchase = await client.orders.purchase({
    clientCode: 'UCC001',
    schemeCode: '119603',
    amount: 5000,
  });
} catch (error) {
  if (error instanceof BSEError) {
    console.error(`Error ${error.code}: ${error.message}`);
    if (error.retryable) {
      // Retry the operation
    }
  }
}
```

---

## Types

### TransactionCode

```typescript
type TransactionCode = 'NEW' | 'MOD' | 'CXL';
```

### BuySell

```typescript
type BuySell = 'P' | 'R';  // Purchase or Redemption
```

### BuySellType

```typescript
type BuySellType = 'FRESH' | 'ADDITIONAL';
```

### YesNo

```typescript
type YesNo = 'Y' | 'N';
```

### DPTransaction

```typescript
type DPTransaction = 'P' | 'N' | 'C';  // Physical or NSDL/CDSL
```

---

## Utilities

### PasswordEncryptor

```typescript
import { PasswordEncryptor } from '@bse-starmf/core';

const encryptor = new PasswordEncryptor();
const encrypted = encryptor.encrypt('plain-password', 'passkey');
const decrypted = encryptor.decrypt(encrypted, 'passkey');
```

### TransactionNoGenerator

```typescript
import { TransactionNoGenerator } from '@bse-starmf/core';

const generator = new TransactionNoGenerator('MEMBER001');
const transNo = generator.generate();  // e.g., '20260126MEMBER0000001'
```

### Validators

```typescript
import { validatePurchaseParams, validateSIPParams } from '@bse-starmf/core';

// Validate purchase parameters
validatePurchaseParams({
  amount: 5000,
  quantity: undefined,
  allRedeem: undefined,
});

// Validate SIP parameters
validateSIPParams({
  amount: 1000,
  frequency: 'MONTHLY',
  startDate: '01/02/2026',
  noOfInstallments: 12,
});
```

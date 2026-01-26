# Technical Design Document: `bse-starmf` npm package

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        bse-starmf Package                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────┐     ┌─────────────────────────────────────┐    │
│  │   End Developer  │     │           NestJS Module             │    │
│  │  (Vanilla/TS)    │     │   (Dependency Injection)           │    │
│  └────────┬────────┘     └──────────────┬──────────────────────┘    │
│           │                             │                             │
│           ▼                             ▼                             │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                      BSEClient / BseStarmfService               ││
│  ├─────────────────────────────────────────────────────────────────┤│
│  │                                                                  ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  ││
│  │  │   Session   │  │  Encryption │  │      API Services       │  ││
│  │  │  Manager    │  │   Service   │  │  - PurchaseService      │  ││
│  │  │             │  │             │  │  - RedemptionService    │  ││
│  │  │ - Token     │  │ - AES-256   │  │  - SIPService           │  ││
│  │  │ - Refresh   │  │ - Passkey   │  │  - ClientService        │  ││
│  │  │ - Expiry    │  │ - Hash      │  │  - MandateService       │  ││
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘  ││
│  │                                                                  ││
│  └─────────────────────────────────────────────────────────────────┘│
│                              │                                        │
│                              ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                      SOAP Client Layer                           ││
│  │  ┌─────────────────────────────────────────────────────────────┐││
│  │  │                    Axios HTTP Client                        │││
│  │  │  - Request interceptor (auth header)                        │││
│  │  │  - Response interceptor (error parsing)                     │││
│  │  │  - Retry logic with exponential backoff                     │││
│  │  └─────────────────────────────────────────────────────────────┘││
│  │                                                                  ││
│  └─────────────────────────────────────────────────────────────────┘│
│                              │                                        │
│                              ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                      BSE StAR MF API                             ││
│  │  https://bsestarmfdemo.bseindia.com/  (Test)                    │││
│  │  https://bsestarmf.bseindia.com/      (Production)              │││
│  └─────────────────────────────────────────────────────────────────┘│
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Monorepo Structure

```
bse-starmf/
├── package.json              # Root workspace (private: true)
├── pnpm-workspace.yaml       # pnpm workspace config
├── tsconfig.base.json        # Base TypeScript config
├── rollup.config.js          # Bundling config
├── jest.config.js            # Jest config
│
├── packages/
│   ├── core/                 # Vanilla JS/TS core package
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts                 # Main exports
│   │   │   ├── client/
│   │   │   │   ├── bse-client.ts        # Main BSEClient class
│   │   │   │   └── client.types.ts      # Client configuration types
│   │   │   ├── auth/
│   │   │   │   ├── session-manager.ts   # Session lifecycle
│   │   │   │   └── session.types.ts     # Session types
│   │   │   ├── encryption/
│   │   │   │   ├── password-encryptor.ts # AES encryption
│   │   │   │   └── encryptor.types.ts
│   │   │   ├── services/
│   │   │   │   ├── base.service.ts      # Base service class
│   │   │   │   ├── order.service.ts     # Purchase/Redemption
│   │   │   │   ├── sip.service.ts       # SIP operations
│   │   │   │   ├── switch.service.ts    # Switch orders
│   │   │   │   ├── client.service.ts    # UCC management
│   │   │   │   ├── mandate.service.ts   # Mand
│   │ate operations   │   │   └── report.service.ts    # Statements
│   │   │   ├── errors/
│   │   │   │   ├── bse-error.ts         # Main error class
│   │   │   │   ├── error-codes.ts       # Error code enum
│   │   │   │   └── error-messages.ts    # Error message mapping
│   │   │   ├── types/
│   │   │   │   ├── api.types.ts         # API request/response types
│   │   │   │   ├── common.types.ts      # Common types
│   │   │   │   └── validation.types.ts  # Validation types
│   │   │   ├── utils/
│   │   │   │   ├── transaction-no.ts    # TransNo generator
│   │   │   │   ├── soap-builder.ts      # SOAP envelope builder
│   │   │   │   └── validators.ts        # Field validators
│   │   │   └── config/
│   │   │       └── environments.ts      # Environment configs
│   │   └── test/
│   │       ├── mocks/
│   │       │   ├── responses/           # Mock API responses
│   │       │   └── sessions/            # Mock sessions
│   │       └── setup.ts
│   │
│   └── nestjs/                # NestJS module package
│       ├── package.json
│       ├── src/
│       │   ├── bse-starmf.module.ts     # Main module
│       │   ├── bse-starmf.service.ts    # Main service
│       │   ├── bse-starmf.controller.ts # Optional controller
│       │   ├── decorators/
│       │   │   ├── current-session.decorator.ts
│       │   │   └── bse-client.decorator.ts
│       │   ├── interceptors/
│       │   │   ├── session.interceptor.ts
│       │   │   └── error.interceptor.ts
│       │   └── guards/
│       │       └── auth.guard.ts
│       └── test/
│           └── mocks/
│               └── bse-client.factory.ts
│
├── scripts/
│   ├── build.sh              # Build all packages
│   ├── test.sh               # Run tests
│   └── release.sh            # Publish to npm
│
├── .github/
│   └── workflows/
│       ├── ci.yml            # CI pipeline
│       ├── release.yml       # Release automation
│       └── security.yml      # Security scanning
│
├── docs/
│   ├── prd.md               # Product requirements
│   ├── technical-design.md  # This file
│   └── api-reference.md     # Auto-generated API docs
│
├── .eslintrc.js
├── .prettierrc
├── .gitignore
├── LICENSE
└── README.md
```

## 2. Core Classes & Interfaces

### 2.1 Configuration Types

```typescript
// packages/core/src/client/client.types.ts

export type Environment = 'test' | 'production';

export interface BSEConfig {
  userId: string;
  memberId: string;
  password: string;
  passkey?: string;
  environment: Environment;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  debug?: boolean;
}

export interface BSEClientOptions extends BSEConfig {
  sessionManager?: SessionManagerOptions;
  encryptorOptions?: EncryptorOptions;
}

export interface SessionManagerOptions {
  defaultExpiry?: number;
  autoRefresh?: boolean;
  refreshThreshold?: number;
}

export interface EncryptorOptions {
  algorithm?: 'AES';
  mode?: 'ECB' | 'CBC';
  padding?: 'Pkcs7';
}
```

### 2.2 Session Types

```typescript
// packages/core/src/auth/session.types.ts

export interface Session {
  id: string;
  userId: string;
  memberId: string;
  createdAt: Date;
  expiresAt: Date;
  isValid: boolean;
}

export interface SessionState {
  currentSession: Session | null;
  pendingRefresh: Promise<Session> | null;
}
```

### 2.3 Main Client Class

```typescript
// packages/core/src/client/bse-client.ts

import { BSEConfig, BSEClientOptions } from './client.types';
import { SessionManager } from '../auth/session-manager';
import { PasswordEncryptor } from '../encryption/password-encryptor';
import { OrderService } from '../services/order.service';
import { SIPService } from '../services/sip.service';
import { ClientService } from '../services/client.service';
import { MandateService } from '../services/mandate.service';
import { ReportService } from '../services/report.service';
import { BSEError } from '../errors/bse-error';

export class BSEClient {
  private config: BSEConfig;
  private sessionManager: SessionManager;
  private encryptor: PasswordEncryptor;
  
  // Services
  public readonly orders: OrderService;
  public readonly sip: SIPService;
  public readonly clients: ClientService;
  public readonly mandates: MandateService;
  public readonly reports: ReportService;

  constructor(config: BSEClientOptions) {
    this.config = {
      userId: config.userId,
      memberId: config.memberId,
      password: config.password,
      passkey: config.passkey || this.generateDefaultPasskey(),
      environment: config.environment,
      baseUrl: config.baseUrl,
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      debug: config.debug || false,
    };

    this.sessionManager = new SessionManager(this.config);
    this.encryptor = new PasswordEncryptor({
      algorithm: config.encryptorOptions?.algorithm || 'AES',
    });

    // Initialize services with shared dependencies
    this.orders = new OrderService(this.config, this.sessionManager, this.encryptor);
    this.sip = new SIPService(this.config, this.sessionManager, this.encryptor);
    this.clients = new ClientService(this.config, this.sessionManager, this.encryptor);
    this.mandates = new MandateService(this.config, this.sessionManager, this.encryptor);
    this.reports = new ReportService(this.config, this.sessionManager, this.encryptor);
  }

  async authenticate(): Promise<void> {
    await this.sessionManager.createSession(
      this.config.userId,
      this.encryptor.encrypt(this.config.password, this.config.passkey!)
    );
  }

  private generateDefaultPasskey(): string {
    return Math.random().toString(36).substring(2, 12);
  }
}
```

### 2.4 Base Service Class

```typescript
// packages/core/src/services/base.service.ts

import { BSEConfig } from '../client/client.types';
import { SessionManager } from '../auth/session-manager';
import { PasswordEncryptor } from '../encryption/password-encryptor';
import axios, { AxiosInstance, AxiosError } from 'axios';
import { BSEError, mapAxiosError } from '../errors/bse-error';
import { SOAPEnvelope } from '../utils/soap-builder';

export abstract class BaseService {
  protected config: BSEConfig;
  protected sessionManager: SessionManager;
  protected encryptor: PasswordEncryptor;
  protected httpClient: AxiosInstance;

  constructor(
    config: BSEConfig,
    sessionManager: SessionManager,
    encryptor: PasswordEncryptor,
    basePath: string
  ) {
    this.config = config;
    this.sessionManager = sessionManager;
    this.encryptor = encryptor;
    
    this.httpClient = axios.create({
      baseURL: `${config.baseUrl || this.getBaseUrl(config.environment)}${basePath}`,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': this.getSoapAction(),
      },
    });

    this.setupInterceptors();
  }

  protected async executeRequest<T>(
    methodName: string,
    params: Record<string, unknown>
  ): Promise<T> {
    const session = await this.sessionManager.getSession();
    const soapEnvelope = this.buildSoapEnvelope(methodName, {
      ...params,
      UserId: this.config.userId,
      MemberId: this.config.memberId,
      Password: session.encryptedPassword,
      PassKey: this.config.passkey,
    });

    const response = await this.httpClient.post('', soapEnvelope);
    return this.parseResponse<T>(response.data);
  }

  protected abstract getSoapAction(): string;
  protected abstract buildSoapEnvelope(method: string, params: Record<string, unknown>): string;
  protected abstract parseResponse<T>(soapResponse: string): T;

  private setupInterceptors(): void {
    // Request interceptor
    this.httpClient.interceptors.request.use(
      async (config) => {
        const session = await this.sessionManager.getSession();
        if (session.isExpired()) {
          await this.sessionManager.refreshSession();
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.httpClient.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const bseError = await mapAxiosError(error);
        throw bseError;
      }
    );
  }

  private getBaseUrl(environment: string): string {
    return environment === 'production'
      ? 'https://bsestarmf.bseindia.com'
      : 'https://bsestarmfdemo.bseindia.com';
  }
}
```

### 2.5 Order Service

```typescript
// packages/core/src/services/order.service.ts

import { BaseService } from './base.service';
import { BSEConfig } from '../client/client.types';
import { SessionManager } from '../auth/session-manager';
import { PasswordEncryptor } from '../encryption/password-encryptor';
import { SOAPBuilder } from '../utils/soap-builder';
import { TransactionNoGenerator } from '../utils/transaction-no';
import { PurchaseRequest, PurchaseResponse } from '../types/api.types';

export class OrderService extends BaseService {
  private transNoGenerator: TransactionNoGenerator;

  constructor(
    config: BSEConfig,
    sessionManager: SessionManager,
    encryptor: PasswordEncryptor
  ) {
    super(config, sessionManager, encryptor, '/MFOrderEntry/MFOrder.svc/Secure');
    this.transNoGenerator = new TransactionNoGenerator(config.memberId);
  }

  async purchase(params: PurchaseRequest): Promise<PurchaseResponse> {
    const transNo = this.transNoGenerator.generate();
    
    const response = await this.executeRequest<PurchaseResponse>(
      'orderEntryParam',
      {
        TransCode: 'NEW',
        TransNo: transNo,
        OrderId: '',
        UserID: this.config.userId,
        MemberId: this.config.memberId,
        ClientCode: params.clientCode,
        SchemeCd: params.schemeCode,
        BuySell: 'P',
        BuySellType: params.buySellType || 'FRESH',
        DPTxn: params.dpTransaction || 'P',
        OrderVal: params.amount,
        Qty: params.quantity || '',
        AllRedeem: params.allRedeem || 'N',
        FolioNo: params.folioNumber || '',
        Remarks: params.remarks || '',
        KYCStatus: params.kycStatus || 'Y',
        RefNo: params.internalRefNo || '',
        SubBrCode: params.subBrokerCode || '',
        EUIN: params.euin || '',
        EUINVal: params.euinDeclaration || 'N',
        MinRedeem: params.minRedeemFlag || 'N',
        DPC: params.dpcFlag || 'Y',
        IPAdd: '',
        Parma1: params.subBrokerArn || '',
        Param2: params.pgRefNo || '',
        Param3: params.bankAccountNo || '',
        MobileNo: params.mobileNo || '',
        EmailID: params.emailId || '',
        MandateID: params.mandateId || '',
      }
    );

    return response;
  }

  async redeem(params: RedeemRequest): Promise<RedeemResponse> {
    const transNo = this.transNoGenerator.generate();
    
    return this.executeRequest<RedeemResponse>('orderEntryParam', {
      TransCode: 'NEW',
      TransNo: transNo,
      OrderId: '',
      UserID: this.config.userId,
      MemberId: this.config.memberId,
      ClientCode: params.clientCode,
      SchemeCd: params.schemeCode,
      BuySell: 'R',
      BuySellType: params.buySellType || 'FRESH',
      DPTxn: params.dpTransaction || 'P',
      OrderVal: params.amount || '',
      Qty: params.quantity || '',
      AllRedeem: params.allRedeem || 'N',
      FolioNo: params.folioNumber || '',
      Remarks: params.remarks || '',
      KYCStatus: params.kycStatus || 'Y',
      RefNo: params.internalRefNo || '',
      SubBrCode: params.subBrokerCode || '',
      EUIN: params.euin || '',
      EUINVal: params.euinDeclaration || 'N',
      MinRedeem: params.minRedeemFlag || 'N',
      DPC: params.dpcFlag || 'Y',
      IPAdd: '',
      Param3: params.bankAccountNo || '',
      MobileNo: params.mobileNo || '',
      EmailID: params.emailId || '',
    });
  }

  protected getSoapAction(): string {
    return 'http://bsestarmf.in/MFOrderEntry/orderEntryParam';
  }

  protected buildSoapEnvelope(method: string, params: Record<string, unknown>): string {
    return SOAPBuilder.build('bses', 'http://bsestarmf.in/', method, params);
  }

  protected parseResponse<T>(soapResponse: string): T {
    // Parse SOAP XML response and extract result
    const parser = new DOMParser();
    const doc = parser.parseFromString(soapResponse, 'text/xml');
    const result = doc.getElementsByTagName('orderEntryParamResult')[0]?.textContent;
    
    if (!result) {
      throw new BSEError('EMPTY_RESPONSE', 'Received empty response from BSE');
    }

    const parts = result.split('|');
    return {
      transCode: parts[0],
      transNo: parts[1],
      orderId: parseInt(parts[2]),
      userId: parts[3],
      memberId: parts[4],
      clientCode: parts[5],
      bseRemarks: parts[6],
      successFlag: parts[7],
    } as T;
  }
}
```

### 2.6 Session Manager

```typescript
// packages/core/src/auth/session-manager.ts

import { BSEConfig } from '../client/client.types';
import { Session, SessionState } from './session.types';
import { PasswordEncryptor } from '../encryption/password-encryptor';
import axios from 'axios';
import { SOAPBuilder } from '../utils/soap-builder';
import { BSEError } from '../errors/bse-error';

export class SessionManager {
  private config: BSEConfig;
  private encryptor: PasswordEncryptor;
  private state: SessionState;
  private readonly MF_ORDER_EXPIRY = 60 * 60 * 1000; // 1 hour
  private readonly DEFAULT_EXPIRY = 5 * 60 * 1000;   // 5 minutes

  constructor(config: BSEConfig) {
    this.config = config;
    this.encryptor = new PasswordEncryptor();
    this.state = {
      currentSession: null,
      pendingRefresh: null,
    };
  }

  async createSession(userId: string, encryptedPassword: string): Promise<Session> {
    const soapEnvelope = SOAPBuilder.build(
      'bses',
      'http://bsestarmf.in/',
      'getPassword',
      {
        UserId: userId,
        Password: encryptedPassword,
        PassKey: this.config.passkey,
      }
    );

    const baseUrl = this.config.environment === 'production'
      ? 'https://bsestarmf.bseindia.com'
      : 'https://bsestarmfdemo.bseindia.com';

    const response = await axios.post(
      `${baseUrl}/MFOrderEntry/MFOrder.svc/Secure`,
      soapEnvelope,
      {
        headers: { 'Content-Type': 'text/xml; charset=utf-8' },
      }
    );

    const result = this.parseAuthResponse(response.data);
    
    if (result.code !== '100') {
      throw new BSEError('AUTH_FAILED', result.message || 'Authentication failed');
    }

    const session: Session = {
      id: result.encryptedPassword,
      userId,
      memberId: this.config.memberId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.MF_ORDER_EXPIRY),
      isValid: true,
    };

    this.state.currentSession = session;
    return session;
  }

  async getSession(): Promise<Session> {
    if (!this.state.currentSession) {
      throw new BSEError('NO_SESSION', 'No active session. Please authenticate first.');
    }

    if (this.state.currentSession.isExpired()) {
      if (this.state.pendingRefresh) {
        return this.state.pendingRefresh;
      }
      this.state.pendingRefresh = this.refreshSession();
      try {
        return await this.state.pendingRefresh;
      } finally {
        this.state.pendingRefresh = null;
      }
    }

    return this.state.currentSession;
  }

  async refreshSession(): Promise<Session> {
    if (!this.state.currentSession) {
      throw new BSEError('NO_SESSION', 'No session to refresh');
    }

    return this.createSession(
      this.state.currentSession.userId,
      this.state.currentSession.id
    );
  }

  clearSession(): void {
    this.state.currentSession = null;
    this.state.pendingRefresh = null;
  }

  private parseAuthResponse(soapResponse: string): { code: string; message?: string; encryptedPassword: string } {
    const parser = new DOMParser();
    const doc = parser.parseFromString(soapResponse, 'text/xml');
    const result = doc.getElementsByTagName('getPasswordResult')[0]?.textContent;

    if (!result) {
      throw new BSEError('EMPTY_RESPONSE', 'Empty authentication response');
    }

    const parts = result.split('|');
    return {
      code: parts[0],
      message: parts[1],
      encryptedPassword: parts[1] || '',
    };
  }
}

// Extension to Session interface
declare module './session.types' {
  interface Session {
    isExpired(): boolean;
  }
}

Session.prototype.isExpired = function (): boolean {
  return Date.now() >= this.expiresAt.getTime();
};
```

### 2.7 Password Encryptor

```typescript
// packages/core/src/encryption/password-encryptor.ts

import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import { EncryptorOptions } from './encryptor.types';

export class PasswordEncryptor {
  private options: Required<EncryptorOptions>;

  constructor(options: EncryptorOptions = {}) {
    this.options = {
      algorithm: options.algorithm || 'AES',
      mode: options.mode || 'ECB',
      padding: options.padding || 'Pkcs7',
    };
  }

  encrypt(plaintext: string, passkey: string): string {
    const encrypted = AES.encrypt(plaintext, passkey, {
      mode: this.getMode(),
      padding: this.getPadding(),
    });
    return encrypted.toString();
  }

  decrypt(ciphertext: string, passkey: string): string {
    const decrypted = AES.decrypt(ciphertext, passkey, {
      mode: this.getMode(),
      padding: this.getPadding(),
    });
    return decrypted.toString(Utf8);
  }

  private getMode(): typeof import('crypto-js').mode {
    const CryptoJS = require('crypto-js');
    switch (this.options.mode) {
      case 'CBC':
        return CryptoJS.mode.CBC;
      case 'CFB':
        return CryptoJS.mode.CFB;
      case 'CTR':
        return CryptoJS.mode.CTR;
      case 'OFB':
        return CryptoJS.mode.OFB;
      case 'ECB':
      default:
        return CryptoJS.mode.ECB;
    }
  }

  private getPadding(): typeof import('crypto-js').pad {
    const CryptoJS = require('crypto-js');
    switch (this.options.padding) {
      case 'AnsiX923':
        return CryptoJS.pad.AnsiX923;
      case 'Iso10126':
        return CryptoJS.pad.Iso10126;
      case 'Iso97971':
        return CryptoJS.pad.Iso97971;
      case 'NoPadding':
        return CryptoJS.pad.NoPadding;
      case 'ZeroPadding':
        return CryptoJS.pad.ZeroPadding;
      case 'Pkcs7':
      default:
        return CryptoJS.pad.Pkcs7;
    }
  }
}
```

### 2.8 Error Handling

```typescript
// packages/core/src/errors/bse-error.ts

import { AxiosError } from 'axios';
import { BSEErrorCode } from './error-codes';
import { ERROR_MESSAGES } from './error-messages';

export class BSEError extends Error {
  public readonly code: BSEErrorCode;
  public readonly retryable: boolean;
  public readonly rawResponse?: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: BSEErrorCode | string,
    message?: string,
    options?: {
      retryable?: boolean;
      rawResponse?: string;
      details?: Record<string, unknown>;
    }
  ) {
    const errorInfo = this.getErrorInfo(code);
    super(options?.message || message || errorInfo.message);
    
    this.code = errorInfo.code;
    this.name = 'BSEError';
    this.retryable = options?.retryable ?? errorInfo.retryable;
    this.rawResponse = options?.rawResponse;
    this.details = options?.details;
  }

  private getErrorInfo(code: string | BSEErrorCode): {
    code: BSEErrorCode;
    message: string;
    retryable: boolean;
  } {
    if (Object.values(BSEErrorCode).includes(code as BSEErrorCode)) {
      return {
        code: code as BSEErrorCode,
        message: ERROR_MESSAGES[code as BSEErrorCode] || 'Unknown error',
        retryable: this.isRetryable(code as BSEErrorCode),
      };
    }

    return {
      code: 'UNKNOWN' as BSEErrorCode,
      message: code.toString(),
      retryable: false,
    };
  }

  private isRetryable(code: BSEErrorCode): boolean {
    const retryableCodes: BSEErrorCode[] = [
      'SESSION_TIMEOUT',
      'NETWORK_ERROR',
      'SERVER_ERROR',
    ];
    return retryableCodes.includes(code);
  }
}

export async function mapAxiosError(error: AxiosError): Promise<BSEError> {
  if (!error.response) {
    return new BSEError('NETWORK_ERROR', error.message, { retryable: true });
  }

  const responseData = error.response.data as string;
  const errorMessage = extractErrorMessage(responseData);

  return new BSEError(
    mapErrorMessageToCode(errorMessage),
    errorMessage,
    {
      retryable: error.response.status >= 500,
      rawResponse: responseData,
    }
  );
}

function extractErrorMessage(soapResponse: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(soapResponse, 'text/xml');
  const faultString = doc.getElementsByTagName('faultstring')[0]?.textContent;
  return faultString || 'Unknown error';
}

function mapErrorMessageToCode(message: string): BSEErrorCode {
  const messageMap: Record<string, BSEErrorCode> = {
    'USER ID SHOULD NOT BE BLANK': 'AUTH_001',
    'PASSWORD SHOULD NOT BE BLANK': 'AUTH_003',
    'INVALID ACCOUNT INFORMATION': 'AUTH_006',
    'INVALID USER ID': 'AUTH_007',
  };

  return messageMap[message] || 'UNKNOWN';
}
```

### 2.9 Transaction Number Generator

```typescript
// packages/core/src/utils/transaction-no.ts

export class TransactionNoGenerator {
  private memberId: string;
  private counter: number;
  private lastDate: Date;

  constructor(memberId: string) {
    this.memberId = memberId;
    this.counter = 0;
    this.lastDate = new Date();
  }

  generate(): string {
    const now = new Date();
    
    if (this.isNewDay(now)) {
      this.counter = 0;
      this.lastDate = now;
    }

    this.counter++;
    const datePart = this.formatDate(now);
    const counterPart = this.counter.toString().padStart(6, '0');
    
    return `${datePart}${this.memberId}${counterPart}`;
  }

  private isNewDay(date: Date): boolean {
    return (
      date.getFullYear() !== this.lastDate.getFullYear() ||
      date.getMonth() !== this.lastDate.getMonth() ||
      date.getDate() !== this.lastDate.getDate()
    );
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  }

  reset(): void {
    this.counter = 0;
    this.lastDate = new Date();
  }
}
```

## 3. NestJS Module

### 3.1 Module Definition

```typescript
// packages/nestjs/src/bse-starmf.module.ts

import { Module, DynamicModule, Provider } from '@nestjs/common';
import { BseStarmfService } from './bse-starmf.service';
import { BseStarmfController } from './bse-starmf.controller';
import { BSEConfig } from '@bse-starmf/core';

export interface BseStarmfModuleOptions extends BSEConfig {
  global?: boolean;
}

@Module({})
export class BseStarmfModule {
  static forRoot(options: BseStarmfModuleOptions): DynamicModule {
    const providers: Provider[] = [
      {
        provide: 'BSE_CONFIG',
        useValue: options,
      },
      BseStarmfService,
    ];

    const controllers = options.global ? [BseStarmfController] : [];

    return {
      module: BseStarmfModule,
      providers,
      controllers,
      exports: [BseStarmfService],
      global: options.global || false,
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: BseStarmfModule,
      providers: [BseStarmfService],
      exports: [BseStarmfService],
    };
  }
}
```

### 3.2 Service

```typescript
// packages/nestjs/src/bse-starmf.service.ts

import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { BSEClient, BSEConfig } from '@bse-starmf/core';

@Injectable()
export class BseStarmfService implements OnModuleInit {
  private client: BSEClient;

  constructor(@Inject('BSE_CONFIG') private config: BSEConfig) {}

  async onModuleInit() {
    this.client = new BSEClient({
      userId: this.config.userId,
      memberId: this.config.memberId,
      password: this.config.password,
      passkey: this.config.passkey,
      environment: this.config.environment,
      baseUrl: this.config.baseUrl,
      timeout: this.config.timeout,
      retries: this.config.retries,
      debug: this.config.debug,
    });

    await this.client.authenticate();
  }

  get orders() {
    return this.client.orders;
  }

  get sip() {
    return this.client.sip;
  }

  get clients() {
    return this.client.clients;
  }

  get mandates() {
    return this.client.mandates;
  }

  get reports() {
    return this.client.reports;
  }
}
```

## 4. Build Configuration

### 4.1 Rollup Config

```javascript
// rollup.config.js

import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

export default [
  // ESM build
  {
    input: 'packages/core/src/index.ts',
    output: {
      dir: 'packages/core/dist/esm',
      format: 'es',
      sourcemap: true,
      preserveModules: true,
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: 'packages/core/tsconfig.json',
        useTsconfigDeclarationDir: true,
      }),
      json(),
    ],
    external: ['axios', 'crypto-js', 'zod'],
  },

  // CJS build
  {
    input: 'packages/core/src/index.ts',
    output: {
      dir: 'packages/core/dist/cjs',
      format: 'cjs',
      sourcemap: true,
      preserveModules: true,
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: 'packages/core/tsconfig.json',
        useTsconfigDeclarationDir: true,
      }),
      json(),
    ],
    external: ['axios', 'crypto-js', 'zod'],
  },

  // NestJS build
  {
    input: 'packages/nestjs/src/index.ts',
    output: {
      dir: 'packages/nestjs/dist',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: 'packages/nestjs/tsconfig.json',
      }),
    ],
    external: ['@nestjs/common', '@nestjs/core', '@bse-starmf/core'],
  },
];
```

### 4.2 Core package.json

```json
{
  "name": "@bse-starmf/core",
  "version": "1.0.0",
  "description": "TypeScript SDK for BSE StAR MF Mutual Fund API",
  "main": "dist/cjs/index.js",
  "module": "dist/esm/index.js",
  "types": "dist/esm/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js",
      "types": "./dist/esm/index.d.ts"
    }
  },
  "sideEffects": false,
  "scripts": {
    "build": "rollup --config ../../rollup.config.js",
    "test": "jest",
    "lint": "eslint src --ext .ts"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "crypto-js": "^4.2.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/crypto-js": "^4.2.0",
    "@types/jest": "^29.5.0",
    "jest": "^29.7.0",
    "rollup": "^4.6.0",
    "typescript": "^5.3.0"
  }
}
```

### 4.3 NestJS package.json

```json
{
  "name": "@bse-starmf/nestjs",
  "version": "1.0.0",
  "description": "NestJS module for BSE StAR MF Mutual Fund API",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@bse-starmf/core": "^1.0.0"
  },
  "scripts": {
    "build": "rollup --config ../../rollup.config.js",
    "test": "jest",
    "lint": "eslint src --ext .ts"
  },
  "devDependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@types/jest": "^29.5.0",
    "jest": "^29.7.0",
    "rollup": "^4.6.0",
    "typescript": "^5.3.0"
  }
}
```

## 5. TypeScript Interfaces

### 5.1 API Types

```typescript
// packages/core/src/types/api.types.ts

// Common types
export type TransactionCode = 'NEW' | 'MOD' | 'CXL';
export type BuySell = 'P' | 'R';
export type BuySellType = 'FRESH' | 'ADDITIONAL';
export type DPTransaction = 'C' | 'N' | 'P';
export type YesNo = 'Y' | 'N';

// Purchase
export interface PurchaseRequest {
  clientCode: string;
  schemeCode: string;
  amount?: number;
  quantity?: number;
  buySellType?: BuySellType;
  dpTransaction?: DPTransaction;
  folioNumber?: string;
  allRedeem?: YesNo;
  kycStatus?: YesNo;
  remarks?: string;
  internalRefNo?: string;
  subBrokerCode?: string;
  euin?: string;
  euinDeclaration?: YesNo;
  minRedeemFlag?: YesNo;
  dpcFlag?: YesNo;
  subBrokerArn?: string;
  pgRefNo?: string;
  bankAccountNo?: string;
  mobileNo?: string;
  emailId?: string;
  mandateId?: string;
}

export interface PurchaseResponse {
  transCode: TransactionCode;
  transNo: string;
  orderId: number;
  userId: string;
  memberId: string;
  clientCode: string;
  bseRemarks: string;
  successFlag: '0' | '1';
}

// Redemption
export interface RedeemRequest extends Omit<PurchaseRequest, 'mandateId'> {
  amount?: number;
  quantity?: number;
  allRedeem?: YesNo;
}

export interface RedeemResponse extends PurchaseResponse {}

// SIP
export interface SIPRequest {
  clientCode: string;
  schemeCode: string;
  amount: number;
  frequency: 'MONTHLY' | 'QUARTERLY' | 'WEEKLY';
  startDate: string; // DD/MM/YYYY
  noOfInstallments: number;
  folioNumber?: string;
  firstOrderToday?: YesNo;
  subBrokerCode?: string;
  euin?: string;
  euinDeclaration?: YesNo;
  dpTransaction?: DPTransaction;
  mandateId?: string;
  endDate?: string; // DD/MM/YYYY - for daily SIP
  remarks?: string;
}

export interface SIPResponse {
  transCode: TransactionCode;
  transNo: string;
  memberId: string;
  clientCode: string;
  userId: string;
  sipRegId: number;
  bseRemarks: string;
  successFlag: '0' | '1';
  firstOrderTodayOrderNo?: string;
}

// Client Registration
export interface ClientRegistrationRequest {
  clientCode?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string; // DD/MM/YYYY
  pan: string;
  panExemptCategory?: string;
  gender?: 'M' | 'F' | 'O';
  fatherOrSpouseName?: string;
  maritalStatus?: 'S' | 'M';
  customerType?: 'I' | 'N';
  occupation?: string;
  constitution?: string;
  registrationDate?: string;
  comMode1?: 'P' | 'E' | 'F';
  comMode2?: 'P' | 'E' | 'F';
  address1: string;
  address2?: string;
  address3?: string;
  city: string;
  pinCode: string;
  state: string;
  country: string;
  stdCode?: string;
  phoneRes?: string;
  phoneOff?: string;
  mobile: string;
  email: string;
  wealthFiles?: string;
  taxStatus: string;
  applicationSource?: string;
  accountType: string;
  clientHolding: string;
  dividendPayMode: string;
  bankName: string;
  bankBranch: string;
  bankAccountNo: string;
  bankAccountType: string;
  micrNo?: string;
  ifscCode?: string;
  cmBoID?: string;
  cmBoIDSlNo?: string;
  cmBoIDSubSlNo?: string;
  depositoryName?: 'CDSL' | 'NSDL';
  subBrokerCode?: string;
  subBrokerARN?: string;
  euin?: string;
  euinVal?: YesNo;
  payinBankMapping?: string;
}

export interface ClientRegistrationResponse {
  status: string;
  ucc: string;
  bseRemarks: string;
}
```

## 6. Data Flow Diagrams

### 6.1 Purchase Transaction Flow

```
Developer Code
      │
      ▼
┌─────────────────┐
│  client.purchase│
│     (params)    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│       OrderService.executeRequest   │
│  ┌─────────────────────────────────┐│
│  │ 1. Get/Refresh Session         ││
│  │ 2. Build SOAP Envelope         ││
│  │ 3. Add Auth Headers            ││
│  │ 4. Send HTTP Request           ││
│  │ 5. Parse SOAP Response         ││
│  │ 6. Return Typed Response       ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│          BSE API (SOAP)             │
│  POST /MFOrderEntry/MFOrder.svc     │
│  Headers: SOAPAction, Content-Type  │
│  Body: XML SOAP Envelope            │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│       BSE Response (XML)            │
│  <orderEntryParamResult>            │
│  NEW|TransNo|OrderId|...|0          │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│     Response Parser                 │
│  - Split by '|' delimiter           │
│  - Map to interface                 │
│  - Return typed object              │
└─────────────────────────────────────┘
         │
         ▼
    PurchaseResponse
    { orderId, bseRemarks, successFlag }
```

### 6.2 Session Management Flow

```
Initial Request
      │
      ▼
┌─────────────────────────────────────┐
│ SessionManager.getSession()         │
└────────┬────────────────────────────┘
         │
    Has Valid Session?
         │
    ┌────┴────┐
    │         │
   YES        NO
    │         │
    ▼         ▼
┌───────┐  ┌─────────────────────┐
│ Return│  │ Create New Session  │
│Cached │  │ 1. Encrypt Password │
│Session│  │ 2. SOAP Auth Request│
└───────┘  │ 3. Parse Response   │
          │ 4. Store Session     │
          └──────────┬──────────┘
                     │
                     ▼
              ┌──────────────┐
              │ Return       │
              │ New Session  │
              └──────────────┘
```

## 7. Security Implementation

### 7.1 Encryption Flow

```
Input: Plain Password + Passkey
           │
           ▼
┌─────────────────────────────────────┐
│  PasswordEncryptor.encrypt()        │
│  - AES.encrypt(plaintext, passkey)  │
│  - Mode: ECB (as per BSE spec)      │
│  - Padding: Pkcs7                   │
└─────────────────────────────────────┘
           │
           ▼
       Base64 Encrypted String
           │
           ▼
      BSE API (getPassword)
```

### 7.2 Secure Configuration

```typescript
// Recommended config pattern
const config: BSEConfig = {
  userId: process.env.BSE_USER_ID!,           // Required
  memberId: process.env.BSE_MEMBER_ID!,       // Required
  password: process.env.BSE_PASSWORD!,        // Required
  passkey: process.env.BSE_PASSKEY,           // Optional, auto-generated
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'test',
  timeout: 30000,
  retries: 3,
  debug: process.env.NODE_ENV !== 'production',
};
```

## 8. Testing Strategy

### 8.1 Unit Test Example

```typescript
// packages/core/test/services/order.service.spec.ts

import { OrderService } from '../../src/services/order.service';
import { SessionManager } from '../../src/auth/session-manager';
import { PasswordEncryptor } from '../../src/encryption/password-encryptor';

describe('OrderService', () => {
  let service: OrderService;
  let mockSessionManager: jest.Mocked<SessionManager>;
  let mockEncryptor: jest.Mocked<PasswordEncryptor>;

  beforeEach(() => {
    mockSessionManager = {
      getSession: jest.fn().mockResolvedValue({
        id: 'encrypted-password',
        isValid: true,
        expiresAt: new Date(Date.now() + 3600000),
      }),
    } as any;

    mockEncryptor = {
      encrypt: jest.fn().mockReturnValue('encrypted-password'),
    } as any;

    service = new OrderService(
      {
        userId: 'test-user',
        memberId: 'test-member',
        password: 'test-password',
        environment: 'test',
      },
      mockSessionManager,
      mockEncryptor
    );
  });

  describe('purchase', () => {
    it('should successfully place a purchase order', async () => {
      // Mock HTTP response
      jest.spyOn(service as any, 'executeRequest').mockResolvedValue({
        transCode: 'NEW',
        transNo: '20260126123456000001',
        orderId: 1234567,
        bseRemarks: 'Order confirmed',
        successFlag: '0',
      });

      const result = await service.purchase({
        clientCode: 'UCC001',
        schemeCode: '123456',
        amount: 5000,
      });

      expect(result.orderId).toBe(1234567);
      expect(result.successFlag).toBe('0');
    });

    it('should generate unique transaction numbers', async () => {
      const transNo1 = (service as any).transNoGenerator.generate();
      const transNo2 = (service as any).transNoGenerator.generate();
      
      expect(transNo1).not.toBe(transNo2);
      expect(transNo1).toMatch(/^20260126test-member\d{6}$/);
    });
  });
});
```

### 8.2 Integration Test Setup

```typescript
// packages/core/test/setup.ts

import { BSEClient } from '../src/client/bse-client';

describe('BSE Integration Tests', () => {
  let client: BSEClient;

  beforeAll(async () => {
    client = new BSEClient({
      userId: process.env.BSE_TEST_USER_ID!,
      memberId: process.env.BSE_TEST_MEMBER_ID!,
      password: process.env.BSE_TEST_PASSWORD!,
      environment: 'test',
      timeout: 60000,
      retries: 1,
    });

    await client.authenticate();
  });

  it('should place a purchase order', async () => {
    const purchase = await client.orders.purchase({
      clientCode: process.env.BSE_TEST_CLIENT_CODE!,
      schemeCode: '119603', // HDFC Mid-Cap Opportunities Fund
      amount: 1000,
    });

    expect(purchase.orderId).toBeDefined();
  });
});
```

## 9. Package Entry Points

### 9.1 Core exports

```typescript
// packages/core/src/index.ts

export { BSEClient } from './client/bse-client';
export { BSEConfig, BSEClientOptions } from './client/client.types';
export { Session, SessionManager } from './auth/session-manager';
export { PasswordEncryptor } from './encryption/password-encryptor';
export { BSEError } from './errors/bse-error';
export { BSEErrorCode } from './errors/error-codes';

// Services
export { OrderService } from './services/order.service';
export { SIPService } from './services/sip.service';
export { ClientService } from './services/client.service';
export { MandateService } from './services/mandate.service';
export { ReportService } from './services/report.service';

// Types
export * from './types/api.types';
export * from './types/common.types';
```

### 9.2 NestJS exports

```typescript
// packages/nestjs/src/index.ts

export { BseStarmfModule } from './bse-starmf.module';
export { BseStarmfService } from './bse-starmf.service';
export { BseStarmfModuleOptions } from './bse-starmf.module';
```

---

## 11. Utility Classes

### 11.1 SOAP Builder

```typescript
// packages/core/src/utils/soap-builder.ts

export class SOAPBuilder {
  private static readonly SOAP_ENVELOPE = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
               xmlns:{namespacePrefix}="{namespace}">
  <soap:Header xmlns:wsa="http://www.w3.org/2005/08/addressing">
    <wsa:Action>{soapAction}</wsa:Action>
    <wsa:To>{endpoint}</wsa:To>
  </soap:Header>
  <soap:Body>
    {body}
  </soap:Body>
</soap:Envelope>`;

  static build(
    prefix: string,
    namespace: string,
    methodName: string,
    params: Record<string, unknown>,
    endpoint?: string
  ): string {
    const soapAction = `${namespace}${methodName}`;
    const body = this.buildMethodElement(prefix, namespace, methodName, params);

    return this.SOAP_ENVELOPE
      .replace('{namespacePrefix}', prefix)
      .replace('{namespace}', namespace)
      .replace('{soapAction}', soapAction)
      .replace('{endpoint}', endpoint || '')
      .replace('{body}', body);
  }

  private static buildMethodElement(
    prefix: string,
    namespace: string,
    methodName: string,
    params: Record<string, unknown>
  ): string {
    const paramElements = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => {
        const formattedKey = this.formatParamName(key);
        return `<${prefix}:${formattedKey}>${this.escapeXml(String(value))}</${prefix}:${formattedKey}>`;
      })
      .join('\n');

    return `<${prefix}:${methodName}>\n${paramElements}\n</${prefix}:${methodName}>`;
  }

  private static formatParamName(key: string): string {
    return key.charAt(0).toUpperCase() + key.slice(1);
  }

  private static escapeXml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
```

### 11.2 Field Validators

```typescript
// packages/core/src/utils/validators.ts

import { z } from 'zod';

export const TransactionNoSchema = z.string().regex(
  /^\d{8}[A-Z0-9]+\d{6}$/,
  'Invalid transaction number format'
);

export const AmountSchema = z.number().positive().multipleOf(0.001);

export const PANSchema = z.string().regex(
  /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  'Invalid PAN format'
);

export const MobileNoSchema = z.string().regex(
  /^[6-9]\d{9}$/,
  'Invalid Indian mobile number'
);

export const EmailSchema = z.string().email();

export const DateSchema = z.string().regex(
  /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
  'Date must be in DD/MM/YYYY format'
);

export function validatePurchaseParams(params: {
  amount?: number;
  quantity?: number;
  allRedeem?: string;
}): void {
  const hasAmount = params.amount !== undefined && params.amount > 0;
  const hasQuantity = params.quantity !== undefined && params.quantity > 0;
  const isAllRedeem = params.allRedeem === 'Y';

  if (!hasAmount && !hasQuantity && !isAllRedeem) {
    throw new Error('Either amount, quantity, or allRedeem=Y must be specified');
  }

  if (hasAmount && hasQuantity) {
    throw new Error('Cannot specify both amount and quantity');
  }
}
```

## 12. Environment Configurations

### 12.1 Test Environment

```typescript
// packages/core/src/config/environments.ts

export const TEST_CONFIG = {
  baseUrl: 'https://bsestarmfdemo.bseindia.com',
  orderEntryUrl: 'https://bsestarmfdemo.bseindia.com/MFOrderEntry/MFOrder.svc/Secure',
  additionalServicesUrl: 'https://bsestarmfdemo.bseindia.com/StarMFAdditionalServices.svc/Secure',
  clientMasterUrl: 'https://bsestarmfdemo.bseindia.com/StarMFCommonAPI/ClientMaster',
  timeout: 60000,
  sessionExpiry: 3600000, // 1 hour
};

export const PRODUCTION_CONFIG = {
  baseUrl: 'https://bsestarmf.bseindia.com',
  orderEntryUrl: 'https://bsestarmf.bseindia.com/MFOrderEntry/MFOrder.svc/Secure',
  additionalServicesUrl: 'https://bsestarmf.bseindia.com/StarMFAdditionalServices.svc/Secure',
  clientMasterUrl: 'https://bsestarmf.bseindia.com/StarMFCommonAPI/ClientMaster',
  timeout: 30000,
  sessionExpiry: 3600000, // 1 hour
};

export function getEnvironmentConfig(environment: 'test' | 'production') {
  return environment === 'production' ? PRODUCTION_CONFIG : TEST_CONFIG;
}
```

## 13. CLI Tool Design

### 13.1 CLI Architecture

```typescript
// packages/cli/src/index.ts

import { Command } from 'commander';
import { BSEClient } from '@bse-starmf/core';
import * as dotenv from 'dotenv';

dotenv.config();

const program = new Command();

program
  .name('bse-starmf-cli')
  .description('CLI for BSE StAR MF operations')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize configuration')
  .action(async () => {
    console.log('Initializing BSE StAR MF configuration...');
    // Prompt for credentials and save to .env
  });

program
  .command('purchase')
  .description('Place a purchase order')
  .requiredOption('--client-code <code>', 'Client UCC code')
  .requiredOption('--scheme-code <code>', 'BSE scheme code')
  .requiredOption('--amount <amount>', 'Purchase amount')
  .option('--folio <folio>', 'Folio number')
  .action(async (options) => {
    const client = createClient();
    const result = await client.orders.purchase({
      clientCode: options.clientCode,
      schemeCode: options.schemeCode,
      amount: parseFloat(options.amount),
      folioNumber: options.folio,
    });
    console.log('Order placed:', result);
  });

program
  .command('redeem')
  .description('Place a redemption order')
  .requiredOption('--client-code <code>', 'Client UCC code')
  .requiredOption('--scheme-code <code>', 'BSE scheme code')
  .option('--amount <amount>', 'Redemption amount')
  .option('--quantity <qty>', 'Redemption quantity')
  .option('--all-units', 'Redeem all units')
  .action(async (options) => {
    const client = createClient();
    const result = await client.orders.redeem({
      clientCode: options.clientCode,
      schemeCode: options.schemeCode,
      amount: options.amount ? parseFloat(options.amount) : undefined,
      quantity: options.quantity ? parseFloat(options.quantity) : undefined,
      allRedeem: options.allUnits ? 'Y' : 'N',
    });
    console.log('Redemption placed:', result);
  });

program
  .command('status')
  .description('Check transaction status')
  .requiredOption('--order-id <id>', 'BSE order ID')
  .action(async (options) => {
    const client = createClient();
    const result = await client.reports.getOrderStatus(options.orderId);
    console.log('Order status:', result);
  });

program
  .command('mandate:status')
  .description('Check mandate status')
  .requiredOption('--mandate-id <id>', 'Mandate ID')
  .action(async (options) => {
    const client = createClient();
    const result = await client.mandates.getStatus(options.mandateId);
    console.log('Mandate status:', result);
  });

function createClient(): BSEClient {
  return new BSEClient({
    userId: process.env.BSE_USER_ID!,
    memberId: process.env.BSE_MEMBER_ID!,
    password: process.env.BSE_PASSWORD!,
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'test',
  });
}

program.parse();
```

## 14. CI/CD Pipeline

### 14.1 GitHub Actions CI

```yaml
# .github/workflows/ci.yml

name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm typecheck

      - name: Run tests
        run: pnpm test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  build:
    needs: lint-and-test
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build packages
        run: pnpm build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: packages/*/dist

  security-scan:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Run npm audit
        run: npm audit --audit-level=high

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          severity: 'HIGH,CRITICAL'
```

### 14.2 Release Pipeline

```yaml
# .github/workflows/release.yml

name: Release

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: pnpm install

      - name: Build packages
        run: pnpm build

      - name: Publish @bse-starmf/core
        working-directory: packages/core
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Publish @bse-starmf/nestjs
        working-directory: packages/nestjs
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 15. Error Codes Reference

### 15.1 Authentication Errors

```typescript
// packages/core/src/errors/error-codes.ts

export enum BSEErrorCode {
  // Authentication
  AUTH_001 = 'USER_ID_BLANK',
  AUTH_002 = 'MEMBER_ID_BLANK',
  AUTH_003 = 'PASSWORD_BLANK',
  AUTH_004 = 'PASSKEY_BLANK',
  AUTH_005 = 'USER_DISABLED',
  AUTH_006 = 'INVALID_ACCOUNT',
  AUTH_007 = 'INVALID_USER_ID',
  AUTH_008 = 'MEMBER_SUSPENDED',
  AUTH_009 = 'PASSWORD_EXPIRED',
  AUTH_010 = 'USER_NOT_EXISTS',
  AUTH_011 = 'SESSION_EXPIRED',
  AUTH_012 = 'MAX_LOGIN_ATTEMPTS',

  // Transaction
  TXN_001 = 'INSUFFICIENT_BALANCE',
  TXN_002 = 'INVALID_SCHEME',
  TXN_003 = 'ORDER_REJECTED',
  TXN_004 = 'INSUFFICIENT_UNITS',
  TXN_005 = 'INVALID_TRANSACTION',
  TXN_006 = 'DUPLICATE_TRANSACTION',
  TXN_007 = 'SCHEME_NOT_FOUND',

  // Client
  CLNT_001 = 'CLIENT_NOT_FOUND',
  CLNT_002 = 'CLIENT_ALREADY_EXISTS',
  CLNT_003 = 'INVALID_KYC',
  CLNT_004 = 'KYC_NOT_VERIFIED',

  // Mandate
  MNDT_001 = 'MANDATE_NOT_FOUND',
  MNDT_002 = 'MANDATE_NOT_APPROVED',
  MNDT_003 = 'MANDATE_EXPIRED',
  MNDT_004 = 'MANDATE_ALREADY_EXISTS',

  // System
  SYS_001 = 'NETWORK_ERROR',
  SYS_002 = 'SERVER_ERROR',
  SYS_003 = 'TIMEOUT',
  SYS_004 = 'UNKNOWN_ERROR',
  SYS_005 = 'EMPTY_RESPONSE',
  SYS_006 = 'INVALID_RESPONSE',
}
```

### 15.2 Error Messages Mapping

```typescript
// packages/core/src/errors/error-messages.ts

import { BSEErrorCode } from './error-codes';

export const ERROR_MESSAGES: Record<BSEErrorCode, string> = {
  [BSEErrorCode.AUTH_001]: 'User ID should not be blank',
  [BSEErrorCode.AUTH_002]: 'Member ID should not be blank',
  [BSEErrorCode.AUTH_003]: 'Password should not be blank',
  [BSEErrorCode.AUTH_004]: 'Passkey should not be blank',
  [BSEErrorCode.AUTH_005]: 'User is disabled. Contact admin',
  [BSEErrorCode.AUTH_006]: 'Invalid account information',
  [BSEErrorCode.AUTH_007]: 'Invalid user ID',
  [BSEErrorCode.AUTH_008]: 'The member is suspended. Contact admin',
  [BSEErrorCode.AUTH_009]: 'Password expired',
  [BSEErrorCode.AUTH_010]: 'User does not exist',
  [BSEErrorCode.AUTH_011]: 'Session expired. Please re-authenticate',
  [BSEErrorCode.AUTH_012]: 'Maximum login attempts exceeded',

  [BSEErrorCode.TXN_001]: 'Insufficient balance for transaction',
  [BSEErrorCode.TXN_002]: 'Invalid scheme code',
  [BSEErrorCode.TXN_003]: 'Order rejected by the system',
  [BSEErrorCode.TXN_004]: 'Insufficient units for redemption',
  [BSEErrorCode.TXN_005]: 'Invalid transaction parameters',
  [BSEErrorCode.TXN_006]: 'Duplicate transaction number',
  [BSEErrorCode.TXN_007]: 'Scheme not found',

  [BSEErrorCode.CLNT_001]: 'Client not found',
  [BSEErrorCode.CLNT_002]: 'Client already exists',
  [BSEErrorCode.CLNT_003]: 'Invalid KYC details',
  [BSEErrorCode.CLNT_004]: 'KYC not verified',

  [BSEErrorCode.MNDT_001]: 'Mandate not found',
  [BSEErrorCode.MNDT_002]: 'Mandate not yet approved',
  [BSEErrorCode.MNDT_003]: 'Mandate has expired',
  [BSEErrorCode.MNDT_004]: 'Mandate already exists',

  [BSEErrorCode.SYS_001]: 'Network error occurred',
  [BSEErrorCode.SYS_002]: 'Server error occurred',
  [BSEErrorCode.SYS_003]: 'Request timed out',
  [BSEErrorCode.SYS_004]: 'Unknown error occurred',
  [BSEErrorCode.SYS_005]: 'Empty response from server',
  [BSEErrorCode.SYS_006]: 'Invalid response format',
};
```

## 16. Contributing Guide

### 16.1 Development Setup

```bash
# Clone repository
git clone https://github.com/your-org/bse-starmf.git
cd bse-starmf

# Install dependencies
pnpm install

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Build packages
pnpm build

# Lint code
pnpm lint

# Format code
pnpm format
```

### 16.2 Adding New API Methods

```typescript
// Example: Adding Switch Order method

// 1. Add types to api.types.ts
export interface SwitchOrderRequest {
  clientCode: string;
  fromSchemeCode: string;
  toSchemeCode: string;
  switchAmount?: number;
  switchUnits?: number;
  allUnits?: YesNo;
  folioNumber?: string;
  // ... other fields
}

export interface SwitchOrderResponse {
  transCode: TransactionCode;
  transNo: string;
  switchOutOrderId: number;
  switchInOrderId: number;
  bseRemarks: string;
  successFlag: '0' | '1';
}

// 2. Create service method in switch.service.ts
export class SwitchService extends BaseService {
  async switch(params: SwitchOrderRequest): Promise<SwitchOrderResponse> {
    const transNo = this.transNoGenerator.generate();
    return this.executeRequest<SwitchOrderResponse>('switchOrderEntryParam', {
      // ... map params
    });
  }
}

// 3. Export from index.ts
export { SwitchService } from './services/switch.service';
export type { SwitchOrderRequest, SwitchOrderResponse } from './types/api.types';
```

## 17. Performance Considerations

### 17.1 Connection Pooling

```typescript
// packages/core/src/config/http-client.ts

import axios, { AxiosInstance } from 'axios';

export function createHttpClient(baseURL: string, timeout: number): AxiosInstance {
  return axios.create({
    baseURL,
    timeout,
    httpAgent: new Agent({
      maxSockets: 100,
      maxFreeSockets: 10,
      timeout: 60000,
    }),
    httpsAgent: new Agent({
      maxSockets: 100,
      maxFreeSockets: 10,
      timeout: 60000,
    }),
  });
}
```

### 17.2 Caching Strategy

```typescript
// packages/core/src/utils/cache.ts

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class SimpleCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private readonly ttl: number;

  constructor(ttlMs: number = 300000) {
    this.ttl = ttlMs;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key: string, value: T): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttl,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}
```

## 18. Migration Guide

### 18.1 From Python Library

```typescript
// Python: mf_platform_bse.api.create_transaction_bse()
// TypeScript equivalent:

import { BSEClient } from '@bse-starmf/core';

const client = new BSEClient({
  userId: process.env.BSE_USER_ID,
  memberId: process.env.BSE_MEMBER_ID,
  password: process.env.BSE_PASSWORD,
  environment: 'test',
});

// Purchase
const purchase = await client.orders.purchase({
  clientCode: 'UCC001',
  schemeCode: '119603',
  amount: 5000,
  buySell: 'P',
});

// Python style (direct API call)
const response = await client.orders.executeRequest('orderEntryParam', {
  TransCode: 'NEW',
  // ... manual params
});
```

### 18.2 Version Upgrade Guide

```markdown
# v1.0.0 Migration Guide

## Breaking Changes

### Config Object Changes
```typescript
// v0.x
const client = new BSEClient({
  apiKey: '...',
  secret: '...',
});

// v1.0
const client = new BSEClient({
  userId: '...',
  memberId: '...',
  password: '...',
});
```

### Method Naming
```typescript
// v0.x
client.placeOrder(params);

// v1.0
client.orders.purchase(params);
client.orders.redeem(params);
```
```

## 19. Additional Services Implementation

### 19.1 Client Service

```typescript
// packages/core/src/services/client.service.ts

export class ClientService extends BaseService {
  async registerClient(params: ClientRegistrationRequest): Promise<ClientRegistrationResponse> {
    const response = await this.executeRequest<ClientRegistrationResponse>(
      'Registration',
      this.mapClientParams(params)
    );
    return response;
  }

  async updateClient(clientCode: string, params: Partial<ClientRegistrationRequest>): Promise<ClientRegistrationResponse> {
    return this.executeRequest<ClientRegistrationResponse>('Registration', {
      ClientCode: clientCode,
      ...this.mapClientParams(params),
    });
  }

  protected getSoapAction(): string {
    return 'http://bsestarmf.in/StarMFCommonAPI/ClientMaster/Registration';
  }

  protected buildSoapEnvelope(method: string, params: Record<string, unknown>): string {
    return SOAPBuilder.build('bses', 'http://bsestarmf.in/', method, params);
  }

  protected parseResponse<T>(soapResponse: string): T {
    // Parse JSON response for Client Master API
    const parser = new DOMParser();
    const doc = parser.parseFromString(soapResponse, 'text/xml');
    const result = doc.getElementsByTagName('RegistrationResult')[0]?.textContent;
    return JSON.parse(result || '{}') as T;
  }

  private mapClientParams(params: ClientRegistrationRequest): Record<string, unknown> {
    return {
      FirstName: params.firstName,
      MiddleName: params.middleName,
      LastName: params.lastName,
      DateOfBirth: params.dateOfBirth,
      PAN: params.pan,
      PANExemptCategory: params.panExemptCategory,
      Gender: params.gender,
      FatherSpouseName: params.fatherOrSpouseName,
      MaritalStatus: params.maritalStatus,
      CustomerType: params.customerType,
      Occupation: params.occupation,
      Constitution: params.constitution,
      RegistrationDate: params.registrationDate,
      ComMode1: params.comMode1,
      ComMode2: params.comMode2,
      Address1: params.address1,
      Address2: params.address2,
      Address3: params.address3,
      City: params.city,
      PinCode: params.pinCode,
      State: params.state,
      Country: params.country,
      StdCode: params.stdCode,
      PhoneRes: params.phoneRes,
      PhoneOff: params.phoneOff,
      Mobile: params.mobile,
      Email: params.email,
      TaxStatus: params.taxStatus,
      ApplicationSource: params.applicationSource,
      AccountType: params.accountType,
      ClientHolding: params.clientHolding,
      DividendPayMode: params.dividendPayMode,
      BankName: params.bankName,
      BankBranch: params.bankBranch,
      BankAccountNo: params.bankAccountNo,
      BankAccountType: params.bankAccountType,
      MICRNo: params.micrNo,
      IFSCCode: params.ifscCode,
      CMBOID: params.cmBoID,
      CMBOIDSlNo: params.cmBoIDSlNo,
      CMBOIDSubSlNo: params.cmBoIDSubSlNo,
      DepositoryName: params.depositoryName,
      SubBrCode: params.subBrokerCode,
      SubBrARN: params.subBrokerARN,
      EUIN: params.euin,
      EUINVal: params.euinVal,
      PayinBankMapping: params.payinBankMapping,
    };
  }
}
```

### 19.2 Mandate Service

```typescript
// packages/core/src/services/mandate.service.ts

export class MandateService extends BaseService {
  async registerMandate(params: MandateRegistrationRequest): Promise<MandateRegistrationResponse> {
    const transNo = this.transNoGenerator.generate();
    return this.executeRequest<MandateRegistrationResponse>('MandateRegistration', {
      TransCode: 'NEW',
      TransNo: transNo,
      ClientCode: params.clientCode,
      MandateType: params.mandateType,
      MandateAmount: params.amount,
      MandateFreq: params.frequency,
      FirstInstDate: params.firstInstallmentDate,
      MandateStartDate: params.startDate,
      MandateEndDate: params.endDate,
      PhoneNo: params.phoneNo,
      Email: params.email,
      BankName: params.bankName,
      BankBranch: params.bankBranch,
      BankAccountNo: params.bankAccountNo,
      AccountType: params.accountType,
      IFSCCode: params.ifscCode,
      MICRNo: params.micrNo,
    });
  }

  async getStatus(mandateId: string): Promise<MandateStatusResponse> {
    return this.executeRequest<MandateStatusResponse>('MandateStatus', {
      MandateID: mandateId,
    });
  }

  async cancelMandate(mandateId: string): Promise<MandateCancellationResponse> {
    const transNo = this.transNoGenerator.generate();
    return this.executeRequest<MandateCancellationResponse>('MandateRegistration', {
      TransCode: 'CXL',
      RegId: mandateId,
      TransNo: transNo,
    });
  }

  protected getSoapAction(): string {
    return 'http://bsestarmf.in/StarMFAdditionalServices/MandateRegistration';
  }

  protected buildSoapEnvelope(method: string, params: Record<string, unknown>): string {
    return SOAPBuilder.build('bses', 'http://bsestarmf.in/', method, params);
  }

  protected parseResponse<T>(soapResponse: string): T {
    const parser = new DOMParser();
    const doc = parser.parseFromString(soapResponse, 'text/xml');
    const result = doc.getElementsByTagName('MandateRegistrationResult')[0]?.textContent;
    return this.parseDelimitedResponse(result || '') as T;
  }

  private parseDelimitedResponse(response: string): Record<string, unknown> {
    const parts = response.split('|');
    return {
      statusCode: parts[0],
      status: parts[1],
      mandateId: parts[2],
      remarks: parts[3],
    };
  }
}
```

## 20. API Endpoints Reference

### 20.1 Order Entry Endpoints

| Endpoint | Method | URL | Description |
|----------|--------|-----|-------------|
| Authentication | getPassword | /MFOrderEntry/MFOrder.svc/Secure | Session initialization |
| Order Entry | orderEntryParam | /MFOrderEntry/MFOrder.svc/Secure | Purchase/Redemption |
| SIP Entry | sipOrderEntryParam | /MFOrderEntry/MFOrder.svc/Secure | SIP registration/cancellation |
| XSIP Entry | xsipOrderEntryParam | /MFOrderEntry/MFOrder.svc/Secure | Extended SIP |
| Switch Entry | switchOrderEntryParam | /MFOrderEntry/MFOrder.svc/Secure | Fund switching |
| Spread Entry | spreadOrderEntryParam | /MFOrderEntry/MFOrder.svc/Secure | Overnight spread |

### 20.2 Additional Services Endpoints

| Endpoint | Method | URL | Description |
|----------|--------|-----|-------------|
| Login | AdditionalServicesLogin | /StarMFAdditionalServices.svc/Secure | Additional services auth |
| Additional Services | AdditionalServices | /StarMFAdditionalServices.svc/Secure | Various operations |
| Mandate Status | MandateStatus | /StarMFAdditionalServices.svc/Secure | Check mandate state |
| Order Status | OrderStatus | /StarMFAdditionalServices.svc/Secure | Transaction status |
| Allotment | AllotmentStatement | /StarMFAdditionalServices.svc/Secure | Unit allotment |
| Payment Status | OrderPaymentStatus | /StarMFAdditionalServices.svc/Secure | Payment verification |

### 20.3 Client Management Endpoints

| Endpoint | Method | URL | Description |
|----------|--------|-----|-------------|
| Registration | Registration | /StarMFCommonAPI/ClientMaster | Client creation/update |
| Enhanced STP | STPRegistration | /StarMFCommonAPI/STP | STP setup/cancellation |
| Mandate Auth URL | eNACHMandateAuthURL | /StarMFAdditionalServices | Generate mandate URL |

### 20.4 Payment Gateway Endpoints

| Endpoint | Method | URL | Description |
|----------|--------|-----|-------------|
| Direct Payment URL | DirectPaymentGateway | /StarMFAdditionalServices | Payment link generation |
| Payment Status | PaymentStatus | /StarMFAdditionalServices | Payment verification |
| Single Payment | SinglePaymentAPI | /StarMFAdditionalServices | Unified payment interface |

## 21. Examples and Use Cases

### 21.1 Complete Purchase Flow

```typescript
import { BSEClient, BSEError } from '@bse-starmf/core';

async function completePurchaseExample() {
  const client = new BSEClient({
    userId: process.env.BSE_USER_ID!,
    memberId: process.env.BSE_MEMBER_ID!,
    password: process.env.BSE_PASSWORD!,
    environment: 'test',
  });

  try {
    // Authenticate (auto-handled, but explicit for clarity)
    await client.authenticate();

    // Place purchase order
    const purchase = await client.orders.purchase({
      clientCode: 'UCC001',
      schemeCode: '119603',
      amount: 10000,
      buySellType: 'FRESH',
      dpTransaction: 'P',
      kycStatus: 'Y',
      dpcFlag: 'Y',
    });

    console.log(`Order ID: ${purchase.orderId}`);
    console.log(`Remarks: ${purchase.bseRemarks}`);
    console.log(`Success: ${purchase.successFlag === '0'}`);

    return purchase;
  } catch (error) {
    if (error instanceof BSEError) {
      console.error(`Error ${error.code}: ${error.message}`);
    }
    throw error;
  }
}
```

### 21.2 SIP Registration Flow

```typescript
async function registerSIPExample() {
  const client = new BSEClient({
    userId: process.env.BSE_USER_ID!,
    memberId: process.env.BSE_MEMBER_ID!,
    password: process.env.BSE_PASSWORD!,
    environment: 'test',
  });

  const sip = await client.sip.register({
    clientCode: 'UCC001',
    schemeCode: '119603',
    amount: 5000,
    frequency: 'MONTHLY',
    startDate: '01/02/2026',
    noOfInstallments: 24,
    firstOrderToday: 'Y',
    dpTransaction: 'P',
    mandateId: '12345',
  });

  console.log(`SIP Reg ID: ${sip.sipRegId}`);
  console.log(`First Order Today: ${sip.firstOrderTodayOrderNo}`);
}
```

### 21.3 Client Registration Flow

```typescript
async function registerClientExample() {
  const client = new BSEClient({
    userId: process.env.BSE_USER_ID!,
    memberId: process.env.BSE_MEMBER_ID!,
    password: process.env.BSE_PASSWORD!,
    environment: 'test',
  });

  const newClient = await client.clients.registerClient({
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '15/08/1990',
    pan: 'ABCDE1234F',
    mobile: '9876543210',
    email: 'john.doe@example.com',
    address1: '123 Main Street',
    city: 'Mumbai',
    state: 'MH',
    pinCode: '400001',
    country: 'IND',
    taxStatus: 'Individual',
    accountType: 'Individual',
    clientHolding: 'Single',
    dividendPayMode: ' payout',
    bankName: 'State Bank of India',
    bankBranch: 'Main Branch',
    bankAccountNo: '1234567890',
    bankAccountType: 'Savings',
    ifscCode: 'SBIN0001234',
  });

  console.log(`UCC Created: ${newClient.ucc}`);
  console.log(`Status: ${newClient.status}`);
}
```

### 21.4 Mandate Registration Flow

```typescript
async function registerMandateExample() {
  const client = new BSEClient({
    userId: process.env.BSE_USER_ID!,
    memberId: process.env.BSE_MEMBER_ID!,
    password: process.env.BSE_PASSWORD!,
    environment: 'test',
  });

  const mandate = await client.mandates.registerMandate({
    clientCode: 'UCC001',
    mandateType: 'O',
    amount: 10000,
    frequency: 'MONTHLY',
    startDate: '01/02/2026',
    endDate: '01/02/2031',
    bankName: 'State Bank of India',
    bankBranch: 'Main Branch',
    bankAccountNo: '1234567890',
    accountType: 'Savings',
    ifscCode: 'SBIN0001234',
    phoneNo: '9876543210',
    email: 'client@example.com',
  });

  console.log(`Mandate ID: ${mandate.mandateId}`);
  console.log(`Status: ${mandate.status}`);
}
```

## 22. Debugging and Logging

### 22.1 Debug Mode Configuration

```typescript
const client = new BSEClient({
  userId: process.env.BSE_USER_ID!,
  memberId: process.env.BSE_MEMBER_ID!,
  password: process.env.BSE_PASSWORD!,
  environment: 'test',
  debug: true, // Enable debug logging
});

// With custom logger
const client = new BSEClient({
  // ... config
  logger: {
    debug: (message: string, data?: unknown) => console.debug(`[DEBUG] ${message}`, data),
    info: (message: string, data?: unknown) => console.info(`[INFO] ${message}`, data),
    warn: (message: string, data?: unknown) => console.warn(`[WARN] ${message}`, data),
    error: (message: string, data?: unknown) => console.error(`[ERROR] ${message}`, data),
  },
});
```

### 22.2 Request/Response Logging

```typescript
// Enable request/response logging
const client = new BSEClient({
  // ... config
  logRequests: true,
  logResponses: true,
  logSensitiveData: false, // Set true only in dev, never in prod
});

// Logged output example:
// [REQUEST] POST https://bsestarmfdemo.bseindia.com/MFOrderEntry/MFOrder.svc/Secure
// [REQUEST] SOAPAction: http://bsestarmf.in/MFOrderEntry/orderEntryParam
// [REQUEST] Body: <soap:Envelope>...</soap:Envelope>
// [RESPONSE] Status: 200
// [RESPONSE] Body: <s:Envelope>...</s:Envelope>
```

## 23. Rate Limiting and Best Practices

### 23.1 Recommended Rate Limits

```typescript
// Per BSE guidelines, implement rate limiting
const RATE_LIMITS = {
  orderEntry: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 100 requests per minute
  },
  authentication: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 10 auth requests per minute
  },
  query: {
    maxRequests: 200,
    windowMs: 60 * 1000, // 200 queries per minute
  },
};
```

### 23.2 Retry Strategy

```typescript
const client = new BSEClient({
  userId: process.env.BSE_USER_ID!,
  memberId: process.env.BSE_MEMBER_ID!,
  password: process.env.BSE_PASSWORD!,
  environment: 'test',
  retries: 3,
  retryDelay: 1000, // Base delay in ms
  retryBackoff: 'exponential', // or 'linear'
  retryableStatusCodes: [500, 502, 503, 504],
});

// Custom retry handler
const client = new BSEClient({
  // ... config
  retryCondition: (error: BSEError) => {
    // Retry on session expiry
    if (error.code === 'AUTH_011') return true;
    // Retry on network errors
    if (error.code === 'SYS_001') return true;
    return false;
  },
});
```

### 23.3 Best Practices

```typescript
// 1. Always use environment variables for credentials
const client = new BSEClient({
  userId: process.env.BSE_USER_ID!,
  memberId: process.env.BSE_MEMBER_ID!,
  password: process.env.BSE_PASSWORD!,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'test',
});

// 2. Implement proper error handling
try {
  const result = await client.orders.purchase(params);
} catch (error) {
  if (error instanceof BSEError) {
    // Handle specific error types
    switch (error.code) {
      case 'AUTH_011': // Session expired
        await client.authenticate();
        break;
      case 'TXN_003': // Order rejected
        console.error('Order rejected:', error.message);
        break;
      default:
        console.error('Unknown error:', error);
    }
  }
}

// 3. Use transaction numbers for tracking
const transNo = client.orders.generateTransNo();
const purchase = await client.orders.purchase({ ...params, internalRefNo: transNo });

// 4. Implement circuit breaker for production use
```

## 24. Troubleshooting Guide

### 24.1 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Session expired errors | Session not refreshed | Enable auto-refresh or manually re-authenticate |
| Authentication failed | Invalid credentials | Verify env vars and BSE account |
| Timeout errors | Network latency | Increase timeout or check connection |
| Invalid scheme | Wrong scheme code | Verify scheme code from BSE master |
| Insufficient units | Redemption quantity too high | Check available units before redemption |
| KYC not verified | Client KYC status | Complete KYC verification first |

### 24.2 Debugging Steps

```typescript
// 1. Enable debug mode
const client = new BSEClient({
  // ... config
  debug: true,
});

// 2. Check session validity
const session = await client.sessionManager.getSession();
console.log('Session valid:', session.isValid);
console.log('Session expires:', session.expiresAt);

// 3. Verify credentials
try {
  await client.authenticate();
  console.log('Authentication successful');
} catch (error) {
  console.error('Authentication failed:', error);
}

// 4. Test with simple query
const status = await client.reports.getOrderStatus('123456');
console.log('API connection successful:', status);
```

### 24.3 Network Diagnostics

```typescript
import { Agent } from 'http';

// Test connection to BSE
async function testConnection() {
  const https = await import('https');
  
  const testUrls = [
    'https://bsestarmfdemo.bseindia.com',
    'https://bsestarmfdemo.bseindia.com/MFOrderEntry/MFOrder.svc',
  ];

  for (const url of testUrls) {
    console.log(`Testing: ${url}`);
    try {
      await fetch(url, { method: 'HEAD' });
      console.log(`✓ ${url} - Reachable`);
    } catch (error) {
      console.error(`✗ ${url} - Failed: ${error.message}`);
    }
  }
}
```

## 25. Roadmap and Future Enhancements

### 25.1 v1.1 (Q2 2026)

- [ ] Switch order support
- [ ] Spread order support
- [ ] Image upload services (AOF, Mandate, Cheque)
- [ ] e-NACH mandate integration
- [ ] Enhanced STP APIs

### 25.2 v1.2 (Q3 2026)

- [ ] WebSocket support for real-time notifications
- [ ] Batch order processing
- [ ] Transaction webhooks
- [ ] Rate limiting features
- [ ] Analytics and reporting module

### 25.3 v2.0 (Q4 2026)

- [ ] REST API wrapper over SOAP
- [ ] GraphQL support
- [ ] Multi-tenant support
- [ ] Plugin architecture
- [ ] CLI enhancements

## 20. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 2026 | Initial PRD and TDD |

---

**Document Version**: 1.0  
**Created**: January 2026  
**Status**: Draft - For Review

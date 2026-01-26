import type { BSEConfig, BSEClientOptions } from './client.types';
import { SessionManager } from '../auth/session-manager';
import { PasswordEncryptor } from '../encryption/password-encryptor';
import { OrderService } from '../services/order.service';
import { SIPService } from '../services/sip.service';
import { XSIPService } from '../services/xsip.service';
import { SwitchService } from '../services/switch.service';
import { SpreadService } from '../services/spread.service';
import { ClientService } from '../services/client.service';
import { MandateService } from '../services/mandate.service';
import { STPService } from '../services/stp.service';
import { ReportService } from '../services/report.service';
import { PaymentService } from '../services/payment.service';
import { AdditionalService } from '../services/additional.service';
import { BSEError } from '../errors/bse-error';

/**
 * Main client class for interacting with BSE StAR MF Mutual Fund API.
 *
 * Provides access to all BSE StAR MF operations including:
 * - Order management (purchase, redemption)
 * - SIP registration and management
 * - Client registration and modification
 * - Mandate management
 * - Reports and statements
 *
 * @example
 * ```typescript
 * import { BSEClient } from '@bse-starmf/core';
 *
 * const client = new BSEClient({
 *   userId: 'your-user-id',
 *   memberId: 'your-member-id',
 *   password: 'your-password',
 *   environment: 'test',
 * });
 *
 * await client.authenticate();
 *
 * // Place a purchase order
 * const purchase = await client.orders.purchase({
 *   clientCode: 'UCC001',
 *   schemeCode: '119603',
 *   amount: 5000,
 * });
 *
 * console.log(purchase.orderId);
 * ```
 */
export class BSEClient {
  private config: BSEConfig;
  private sessionManager: SessionManager;
  private encryptor: PasswordEncryptor;
  private _authenticated: boolean = false;

  public readonly orders: OrderService;

  public readonly sip: SIPService;

  public readonly xsip: XSIPService;

  public readonly switch: SwitchService;

  public readonly spread: SpreadService;

  public readonly clients: ClientService;

  public readonly mandates: MandateService;

  public readonly stp: STPService;

  public readonly reports: ReportService;

  public readonly payment: PaymentService;

  public readonly additional: AdditionalService;

  /**
   * Creates a new BSEClient instance.
   *
   * @param config - The client configuration options
   * @param config.userId - BSE StAR MF user ID
   * @param config.memberId - BSE StAR MF member ID
   * @param config.password - BSE StAR MF password (will be encrypted)
   * @param config.passkey - Optional passkey for encryption (auto-generated if not provided)
   * @param config.environment - Environment: 'test' or 'production'
   * @param config.baseUrl - Optional base URL override
   * @param config.timeout - Request timeout in milliseconds (default: 30000)
   * @param config.retries - Number of retry attempts for failed requests (default: 3)
   * @param config.debug - Enable debug mode for additional logging
   * @param config.encryptorOptions - Optional encryption configuration
   *
   * @throws {BSEError} AUTH_001 - If userId or password is blank
   */
  constructor(config: BSEClientOptions) {
    this.config = {
      userId: config.userId,
      memberId: config.memberId,
      password: config.password,
      passkey: config.passkey ?? this.generateDefaultPasskey(),
      environment: config.environment,
      baseUrl: config.baseUrl,
      timeout: config.timeout ?? 30000,
      retries: config.retries ?? 3,
      debug: config.debug ?? false,
    };

    this.sessionManager = new SessionManager(this.config);
    this.encryptor = new PasswordEncryptor({
      algorithm: config.encryptorOptions?.algorithm,
      mode: config.encryptorOptions?.mode,
      padding: config.encryptorOptions?.padding,
    });

    this.orders = new OrderService(this.config, this.sessionManager, this.encryptor);
    this.sip = new SIPService(this.config, this.sessionManager, this.encryptor);
    this.xsip = new XSIPService(this.config, this.sessionManager, this.encryptor);
    this.switch = new SwitchService(this.config, this.sessionManager, this.encryptor);
    this.spread = new SpreadService(this.config, this.sessionManager, this.encryptor);
    this.clients = new ClientService(this.config);
    this.mandates = new MandateService(this.config);
    this.stp = new STPService(this.config);
    this.reports = new ReportService(this.config);
    this.payment = new PaymentService(this.config);
    this.additional = new AdditionalService(this.config);
  }

  get authenticated(): boolean {
    return this._authenticated;
  }

  /**
   * Authenticates with BSE StAR MF API using the configured credentials.
   *
   * This method encrypts the password using AES-256 and establishes a session
   * with BSE. The session is valid for 1 hour and will be automatically refreshed
   * when expired.
   *
   * @example
   * ```typescript
   * const client = new BSEClient({ ... });
   * await client.authenticate();
   * console.log(client.authenticated); // true
   * ```
   *
   * @returns {Promise<void>} Resolves when authentication is successful
   *
   * @throws {BSEError} AUTH_001 - If userId or password is blank
   * @throws {BSEError} AUTH_FAILED - If authentication fails due to invalid credentials
   */
  async authenticate(): Promise<void> {
    if (!this.config.userId || !this.config.password) {
      throw new BSEError('AUTH_001', 'User ID and password are required');
    }

    const encryptedPassword = this.encryptor.encrypt(this.config.password, this.config.passkey!);

    await this.sessionManager.createSession(this.config.userId, encryptedPassword);
    this._authenticated = true;
  }

  /**
   * Clears the current session and disconnects from BSE StAR MF API.
   *
   * This method clears the session from memory. Subsequent API calls will fail
   * until {@link authenticate} is called again.
   *
   * @example
   * ```typescript
   * await client.authenticate();
   * // ... perform operations ...
   * client.disconnect();
   * console.log(client.authenticated); // false
   * ```
   */
  disconnect(): void {
    this.sessionManager.clearSession();
    this._authenticated = false;
  }

  private generateDefaultPasskey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let passkey = '';
    for (let i = 0; i < 10; i++) {
      passkey += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return passkey;
  }
}

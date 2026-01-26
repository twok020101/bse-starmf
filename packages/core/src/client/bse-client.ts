import { BSEConfig, BSEClientOptions } from './client.types';
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

  async authenticate(): Promise<void> {
    if (!this.config.userId || !this.config.password) {
      throw new BSEError('AUTH_001', 'User ID and password are required');
    }

    const encryptedPassword = this.encryptor.encrypt(this.config.password, this.config.passkey!);

    await this.sessionManager.createSession(this.config.userId, encryptedPassword);
    this._authenticated = true;
  }

  async disconnect(): Promise<void> {
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

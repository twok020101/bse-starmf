import axios, { AxiosInstance, AxiosError } from 'axios';
import { BSEConfig } from '../client/client.types';
import { SessionManager } from '../auth/session-manager';
import { PasswordEncryptor } from '../encryption/password-encryptor';
import { mapAxiosError } from '../errors/bse-error';
import { isSessionExpired } from '../auth/session.types';

export abstract class BaseService {
  protected config: BSEConfig;
  protected sessionManager: SessionManager;
  protected encryptor: PasswordEncryptor;
  protected httpClient: AxiosInstance;
  protected basePath: string;

  constructor(
    config: BSEConfig,
    sessionManager: SessionManager,
    encryptor: PasswordEncryptor,
    basePath: string
  ) {
    this.config = config;
    this.sessionManager = sessionManager;
    this.encryptor = encryptor;
    this.basePath = basePath;

    const baseUrl = config.baseUrl || this.getBaseUrl();

    this.httpClient = axios.create({
      baseURL: `${baseUrl}${basePath}`,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
      },
    });

    this.setupInterceptors();
  }

  protected async executeRequest<T>(
    methodName: string,
    params: Record<string, unknown>
  ): Promise<T> {
    const session = await this.sessionManager.getSession();

    const enrichedParams = {
      ...params,
      UserID: this.config.userId,
      MemberId: this.config.memberId,
      Password: session.encryptedPassword,
      PassKey: this.config.passkey,
    };

    const soapEnvelope = this.buildSoapEnvelope(methodName, enrichedParams);
    const soapAction = this.getSoapAction(methodName);

    const response = await this.httpClient.post('', soapEnvelope, {
      headers: {
        SOAPAction: soapAction,
      },
    });

    return this.parseResponse<T>(response.data);
  }

  protected abstract getSoapAction(methodName: string): string;

  protected abstract buildSoapEnvelope(method: string, params: Record<string, unknown>): string;

  protected abstract parseResponse<T>(soapResponse: string): T;

  protected getSoapActionPrefix(): string {
    return 'http://bsestarmf.in/';
  }

  private setupInterceptors(): void {
    this.httpClient.interceptors.request.use(
      async config => {
        try {
          const session = await this.sessionManager.getSession();
          if (isSessionExpired.call(session)) {
            await this.sessionManager.refreshSession();
          }
        } catch {
          // Ignore session errors in interceptor
        }
        return config;
      },
      error => Promise.reject(error)
    );

    this.httpClient.interceptors.response.use(
      response => response,
      async (error: AxiosError) => {
        const bseError = await mapAxiosError(error);
        throw bseError;
      }
    );
  }

  private getBaseUrl(): string {
    return this.config.environment === 'production'
      ? 'https://bsestarmf.bseindia.com'
      : 'https://bsestarmfdemo.bseindia.com';
  }
}

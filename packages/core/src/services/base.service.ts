import type { AxiosInstance, AxiosError } from 'axios';
import axios from 'axios';
import type { BSEConfig } from '../client/client.types';
import type { SessionManager } from '../auth/session-manager';
import type { PasswordEncryptor } from '../encryption/password-encryptor';
import { mapAxiosError } from '../errors/bse-error';
import { isSessionExpired } from '../auth/session.types';

/**
 * Abstract base class for all BSE StAR MF services.
 *
 * Provides common functionality for SOAP-based API communication including:
 * - HTTP client configuration with interceptors
 * - Session management and automatic refresh
 * - SOAP envelope building and response parsing
 *
 * Service implementations should extend this class and implement
 * the abstract methods for specific API endpoints.
 */
export abstract class BaseService {
  /** BSE configuration */
  protected config: BSEConfig;

  /** Session manager for authentication */
  protected sessionManager: SessionManager;

  /** Password encryptor for secure transmission */
  protected encryptor: PasswordEncryptor;

  /** Axios HTTP client instance */
  protected httpClient: AxiosInstance;

  /** Base path for API endpoints */
  protected basePath: string;

  /**
   * Creates a new BaseService instance.
   *
   * @param config - BSE configuration
   * @param sessionManager - Session manager for authentication
   * @param encryptor - Password encryptor for secure transmission
   * @param basePath - Base API path for this service
   */
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

    const baseUrl = config.baseUrl ?? this.getBaseUrl();

    this.httpClient = axios.create({
      baseURL: `${baseUrl}${basePath}`,
      timeout: config.timeout ?? 30000,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Executes a SOAP request to BSE StAR MF API.
   *
   * This method handles the complete request lifecycle:
   * 1. Gets or refreshes the session
   * 2. Enriches parameters with authentication data
   * 3. Builds SOAP envelope
   * 4. Sends HTTP request
   * 5. Parses and returns response
   *
   * @param methodName - The SOAP method name to call
   * @param params - Request parameters as key-value pairs
   * @returns {Promise<T>} Parsed response of type T
   *
   * @throws {BSEError} When session is invalid or request fails
   */
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

  /**
   * Gets the SOAP action header for the specified method.
   *
   * @param methodName - The SOAP method name
   * @returns The full SOAP action URI
   */
  protected abstract getSoapAction(methodName: string): string;

  /**
   * Builds a SOAP envelope for the specified method and parameters.
   *
   * @param method - The SOAP method name
   * @param params - Request parameters
   * @returns Complete SOAP XML envelope as string
   */
  protected abstract buildSoapEnvelope(method: string, params: Record<string, unknown>): string;

  /**
   * Parses the SOAP response and extracts the result.
   *
   * @param soapResponse - Raw SOAP XML response
   * @returns Parsed response object of type T
   */
  protected abstract parseResponse<T>(soapResponse: string): T;

  /**
   * Gets the SOAP action prefix for this service.
   *
   * @returns The base URI for SOAP actions
   * @defaultValue 'http://bsestarmf.in/'
   */
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
      (error: AxiosError) => {
        const bseError = mapAxiosError(error);
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

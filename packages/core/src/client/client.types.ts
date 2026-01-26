import type { Environment } from '../types/common.types';

/**
 * Configuration interface for BSE StAR MF API client.
 *
 * Contains all required and optional settings for connecting to BSE StAR MF.
 */
export interface BSEConfig {
  /**
   * BSE StAR MF User ID.
   *
   * Provided by BSE after registration as a mutual fund distributor or partner.
   */
  userId: string;

  /**
   * BSE StAR MF Member ID.
   *
   * Unique identifier for the member/ARN.
   */
  memberId: string;

  /**
   * BSE StAR MF Password.
   *
   * Will be encrypted using AES-256 before transmission.
   * Should be stored securely in environment variables.
   */
  password: string;

  /**
   * Optional passkey for password encryption.
   *
   * If not provided, a random 10-character passkey will be generated.
   * The same passkey must be used for all requests in a session.
   *
   * @defaultValue Auto-generated 10-character alphanumeric string
   */
  passkey?: string;

  /**
   * Target environment for API calls.
   *
   * - `test`: BSE StAR MF Demo environment (https://bsestarmfdemo.bseindia.com)
   * - `production`: BSE StAR MF Production environment (https://bsestarmf.bseindia.com)
   */
  environment: Environment;

  /**
   * Optional base URL override for API endpoints.
   *
   * Use this if you need to connect through a proxy or have custom endpoint URLs.
   * When not provided, the default BSE URLs are used based on environment.
   */
  baseUrl?: string;

  /**
   * Request timeout in milliseconds.
   *
   * Maximum time to wait for a response from BSE API.
   *
   * @defaultValue 30000 (30 seconds)
   */
  timeout?: number;

  /**
   * Number of retry attempts for failed requests.
   *
   * Failed requests due to network errors or server errors (5xx) will be retried.
   *
   * @defaultValue 3
   */
  retries?: number;

  /**
   * Enable debug mode for additional logging.
   *
   * When enabled, request/response details will be logged to console.
   * Should be disabled in production to avoid logging sensitive data.
   *
   * @defaultValue false
   */
  debug?: boolean;
}

/**
 * Extended configuration options for BSEClient.
 *
 * Extends BSEConfig with optional settings for session management and encryption.
 */
export interface BSEClientOptions extends BSEConfig {
  /**
   * Optional configuration for session manager behavior.
   */
  sessionManagerOptions?: SessionManagerOptions;

  /**
   * Optional configuration for password encryption.
   *
   * Allows customization of encryption algorithm, mode, and padding.
   */
  encryptorOptions?: EncryptorOptions;
}

/**
 * Configuration options for session manager behavior.
 */
export interface SessionManagerOptions {
  /**
   * Default session expiry time in milliseconds.
   *
   * @defaultValue 3600000 (1 hour)
   */
  defaultExpiry?: number;

  /**
   * Whether to automatically refresh expired sessions.
   *
   * @defaultValue true
   */
  autoRefresh?: boolean;

  /**
   * Time in milliseconds before expiry to trigger automatic refresh.
   *
   * @defaultValue 300000 (5 minutes)
   */
  refreshThreshold?: number;
}

/**
 * Configuration options for password encryption.
 */
export interface EncryptorOptions {
  /**
   * Encryption algorithm to use.
   *
   * @defaultValue 'AES'
   */
  algorithm?: 'AES';

  /**
   * Cipher mode for encryption.
   *
   * - `ECB`: Electronic Codebook (default, as per BSE spec)
   * - `CBC`: Cipher Block Chaining
   *
   * @defaultValue 'ECB'
   */
  mode?: 'ECB' | 'CBC';

  /**
   * Padding scheme for encryption.
   *
   * @defaultValue 'Pkcs7'
   */
  padding?: 'Pkcs7';
}

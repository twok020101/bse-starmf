/**
 * Enumeration of all possible BSE StAR MF API error codes.
 *
 * Error codes are organized by category:
 * - AUTH_xxx: Authentication and authorization errors
 * - TXN_xxx: Transaction-related errors
 * - NET_xxx: Network and communication errors
 * - UNK_xxx: Unknown or unclassified errors
 */
export enum BSEErrorCode {
  /** User ID is blank or invalid */
  INVALID_USER_ID = 'AUTH_001',

  /** Password is blank */
  PASSWORD_BLANK = 'AUTH_003',

  /** Session has expired, please re-authenticate */
  SESSION_EXPIRED = 'AUTH_004',

  /** User account is disabled, contact administrator */
  USER_DISABLED = 'AUTH_005',

  /** Invalid account information provided */
  INVALID_ACCOUNT_INFO = 'AUTH_006',

  /** User does not exist in the system */
  INVALID_USER = 'AUTH_007',

  /** Member is suspended, contact administrator */
  MEMBER_SUSPENDED = 'AUTH_008',

  /** Password has expired and needs to be changed */
  PASSWORD_EXPIRED = 'AUTH_009',

  /** User does not exist in the system */
  USER_NOT_EXISTS = 'AUTH_010',

  /** Order was rejected by BSE */
  ORDER_REJECTED = 'TXN_003',

  /** Insufficient units for redemption */
  INSUFFICIENT_UNITS = 'TXN_004',

  /** Invalid or unknown scheme code */
  INVALID_SCHEME = 'TXN_002',

  /** Network connectivity error */
  NETWORK_ERROR = 'NET_001',

  /** Server-side error (5xx response) */
  SERVER_ERROR = 'NET_002',

  /** Request timeout */
  TIMEOUT_ERROR = 'NET_003',

  /** Session timeout */
  SESSION_TIMEOUT = 'NET_004',

  /** Unknown or unclassified error */
  UNKNOWN = 'UNK_001',
}

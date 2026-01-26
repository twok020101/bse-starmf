import type { AxiosError } from 'axios';
import { BSEErrorCode } from './error-codes';
import { ERROR_MESSAGES, MESSAGE_TO_CODE_MAP, RETRYABLE_ERRORS } from './error-messages';

/**
 * Custom error class for BSE StAR MF API errors.
 *
 * Provides typed error codes, retry guidance, and optional raw response data
 * for debugging failed API requests.
 *
 * @example
 * ```typescript
 * try {
 *   await client.orders.purchase({ ... });
 * } catch (error) {
 *   if (error instanceof BSEError) {
 *     console.error(`Error ${error.code}: ${error.message}`);
 *     if (error.retryable) {
 *       // Retry the request
 *     }
 *   }
 * }
 * ```
 */
export class BSEError extends Error {
  /**
   * Typed error code from BSEErrorCode enum.
   *
   * Examples: AUTH_001, TXN_003, NET_001
   */
  public readonly code: BSEErrorCode;

  /**
   * Whether the error is retryable.
   *
   * Network errors and server errors (5xx) are typically retryable.
   * Authentication and validation errors are not retryable.
   */
  public readonly retryable: boolean;

  /**
   * Raw response data from BSE API (if available).
   *
   * Useful for debugging when BSE returns unexpected responses.
   */
  public readonly rawResponse?: string;

  /**
   * Additional error details object.
   *
   * May contain field-specific validation errors, request parameters,
   * or other contextual information.
   */
  public readonly details?: Record<string, unknown>;

  /**
   * Creates a new BSEError instance.
   *
   * @param code - Error code from BSEErrorCode enum or custom string code
   * @param message - Optional custom error message (overrides default)
   * @param options - Additional error options
   * @param options.retryable - Whether the error can be retried
   * @param options.rawResponse - Raw API response for debugging
   * @param options.details - Additional error details
   */
  constructor(
    code: BSEErrorCode | string,
    message?: string,
    options?: {
      retryable?: boolean;
      rawResponse?: string;
      details?: Record<string, unknown>;
    }
  ) {
    const errorInfo = BSEError.getErrorInfoStatic(code);
    const finalMessage = options?.rawResponse ?? message ?? errorInfo.message;
    super(finalMessage);

    this.code = errorInfo.code;
    this.name = 'BSEError';
    this.retryable = options?.retryable ?? errorInfo.retryable;
    this.rawResponse = options?.rawResponse;
    this.details = options?.details;
  }

  private static getErrorInfoStatic(code: string | BSEErrorCode): {
    code: BSEErrorCode;
    message: string;
    retryable: boolean;
  } {
    if (Object.values(BSEErrorCode).includes(code as BSEErrorCode)) {
      return {
        code: code as BSEErrorCode,
        message: ERROR_MESSAGES[code as BSEErrorCode] ?? 'Unknown error',
        retryable: RETRYABLE_ERRORS.has(code as BSEErrorCode),
      };
    }

    return {
      code: 'UNKNOWN' as BSEErrorCode,
      message: code.toString(),
      retryable: false,
    };
  }
}

/**
 * Maps an Axios error to a BSEError.
 *
 * Extracts error message from SOAP response and maps it to appropriate
 * error code. Network errors are marked as retryable.
 *
 * @param error - The Axios error to map
 * @returns A new BSEError with appropriate code and message
 */
export function mapAxiosError(error: AxiosError): BSEError {
  if (!error.response) {
    return new BSEError('NET_001', error.message, { retryable: true });
  }

  const responseData = error.response.data as string;
  const errorMessage = extractErrorMessage(responseData);

  return new BSEError(mapErrorMessageToCode(errorMessage), errorMessage, {
    retryable: error.response.status >= 500,
    rawResponse: responseData,
  });
}

function extractErrorMessage(soapResponse: string): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const parser = new (require('fast-xml-parser').XMLParser)();
    const doc = parser.parse(soapResponse);
    const faultString =
      doc?.['soap:Envelope']?.['soap:Body']?.['soap:Fault']?.['faultstring']?.['#text'] ||
      doc?.['soap:Envelope']?.['soap:Body']?.['soap:Fault']?.['faultstring'] ||
      doc?.S?.[0]?.E?.[0]?.B?.[0]?.F?.[0]?.fs?.[0] ||
      '';

    if (faultString && typeof faultString === 'string') {
      return faultString.trim();
    }
  } catch {
    // Ignore parsing errors
  }

  if (typeof soapResponse === 'string' && soapResponse.includes('faultstring')) {
    const match = soapResponse.match(/<faultstring>([^<]+)<\/faultstring>/);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return 'Unknown error';
}

function mapErrorMessageToCode(message: string): BSEErrorCode {
  return MESSAGE_TO_CODE_MAP[message] ?? ('UNKNOWN' as BSEErrorCode);
}

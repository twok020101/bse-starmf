import { AxiosError } from 'axios';
import { BSEErrorCode } from './error-codes';
import { ERROR_MESSAGES, MESSAGE_TO_CODE_MAP, RETRYABLE_ERRORS } from './error-messages';

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
    const errorInfo = BSEError.getErrorInfoStatic(code);
    const finalMessage = options?.rawResponse || message || errorInfo.message;
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
        message: ERROR_MESSAGES[code as BSEErrorCode] || 'Unknown error',
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

export async function mapAxiosError(error: AxiosError): Promise<BSEError> {
  if (!error.response) {
    return new BSEError('NET_001', error.message, { retryable: true });
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
  try {
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
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return 'Unknown error';
}

function mapErrorMessageToCode(message: string): BSEErrorCode {
  return MESSAGE_TO_CODE_MAP[message] || 'UNKNOWN' as BSEErrorCode;
}
